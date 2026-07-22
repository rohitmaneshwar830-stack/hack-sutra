import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib

app = Flask(__name__)
CORS(app, origins=os.environ.get('BACKEND_ORIGIN', '*'))
BASE_DIR = os.path.dirname(__file__)
MODEL_VERSION = os.environ.get('MODEL_VERSION', 'configured-artifact')
ARTIFACT_TRUSTED = os.environ.get('MODEL_ARTIFACT_TRUSTED', 'false').lower() == 'true'

def load_model(filename):
    if not ARTIFACT_TRUSTED:
        return None
    path = os.path.join(BASE_DIR, 'models', filename)
    if not os.path.exists(path):
        return None
    try:
        return joblib.load(path)
    except Exception as exc:
        app.logger.error('Unable to load %s: %s', filename, exc)
        return None

forecast_model = load_model('forecast_model.pkl')
classifier_model = load_model('classifier_model.pkl')

@app.get('/health')
def health():
    ready = forecast_model is not None and classifier_model is not None
    return jsonify({'status': 'healthy' if ready else 'degraded', 'models_loaded': {'forecast_model': forecast_model is not None, 'classifier_model': classifier_model is not None}, 'model_version': MODEL_VERSION}), (200 if ready else 503)

def numeric_series(value, minimum=5):
    if not isinstance(value, list) or len(value) < minimum:
        raise ValueError(f'At least {minimum} numeric readings are required.')
    values = [float(item) for item in value]
    if not all(np.isfinite(values)):
        raise ValueError('Readings must be finite numbers.')
    return values

@app.post('/predict')
def predict():
    try:
        data = request.get_json(silent=True) or {}
        bod_readings = numeric_series(data.get('bod_readings'))
        if forecast_model is None:
            return jsonify({'error': 'Forecast model is not available.'}), 503
        prediction = forecast_model.predict(np.array(bod_readings[-5:]).reshape(1, -1))[0]
        forecast_days = []
        for index, value in enumerate(prediction):
            value = max(0.0, round(float(value), 2))
            status = 'CRITICAL' if value > 30 else 'WARNING' if value > 20 else 'MODERATE' if value > 10 else 'IMPROVING'
            forecast_days.append({'day': 'Today' if index == 0 else f'+{index} Day', 'bodValue': value, 'status': status})
        return jsonify({'location': data.get('location'), 'forecast': forecast_days, 'model': MODEL_VERSION})
    except (TypeError, ValueError) as exc:
        return jsonify({'error': str(exc)}), 400
    except Exception as exc:
        app.logger.exception('Prediction failed')
        return jsonify({'error': 'Prediction failed.'}), 500

@app.post('/classify-source')
def classify_source():
    try:
        data = request.get_json(silent=True) or {}
        keys = ['chromium', 'lead', 'mercury', 'bod', 'do', 'turbidity']
        values = [float(data[key]) for key in keys]
        if not all(np.isfinite(values)):
            raise ValueError('All pollutant values must be finite numbers.')
        if classifier_model is None:
            return jsonify({'error': 'Source classifier is not available.'}), 503
        features = [values]
        prediction = classifier_model.predict(features)[0]
        probabilities = classifier_model.predict_proba(features)[0]
        confidence = int(round(float(max(probabilities)) * 100))
        return jsonify({'source': prediction, 'chemical': 'Chromium signature' if values[0] > 0 else 'Measured mixed pollutant signature', 'confidence': confidence, 'model': MODEL_VERSION})
    except (KeyError, TypeError, ValueError) as exc:
        return jsonify({'error': str(exc)}), 400
    except Exception:
        app.logger.exception('Classification failed')
        return jsonify({'error': 'Classification failed.'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5001)), debug=False)

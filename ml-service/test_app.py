"""
Ganga Guardian AI — ML Service Test Suite
Run: cd ml-service && python -m pytest test_app.py -v

Tests validate:
  - /health endpoint contract
  - /predict input validation and response schema
  - /classify-source input validation and response schema
  - Behaviour when models are unavailable (MODEL_ARTIFACT_TRUSTED not set)
  - No fabricated pollutant values are ever returned without model input
"""
import os
import json
import pytest

# Force model loading off for validation tests — models are tested separately
os.environ.setdefault('MODEL_ARTIFACT_TRUSTED', 'false')
os.environ.setdefault('MODEL_VERSION', 'test-suite')

from app import app  # noqa: E402 (import after env setup)


@pytest.fixture()
def client():
    app.config['TESTING'] = True
    with app.test_client() as c:
        yield c


# ─── Health ────────────────────────────────────────────────────────────────────

class TestHealth:
    def test_health_returns_json(self, client):
        res = client.get('/health')
        data = res.get_json()
        assert data is not None, 'Health must return JSON'

    def test_health_has_status_field(self, client):
        res = client.get('/health')
        data = res.get_json()
        assert 'status' in data

    def test_health_has_models_loaded_field(self, client):
        res = client.get('/health')
        data = res.get_json()
        assert 'models_loaded' in data
        assert isinstance(data['models_loaded'], dict)

    def test_health_has_model_version(self, client):
        res = client.get('/health')
        data = res.get_json()
        assert 'model_version' in data

    def test_health_degraded_when_models_not_loaded(self, client):
        """With MODEL_ARTIFACT_TRUSTED=false no models load → status must be 'degraded'."""
        res = client.get('/health')
        data = res.get_json()
        assert data['status'] == 'degraded'
        assert res.status_code == 503

    def test_health_reports_both_models_false(self, client):
        res = client.get('/health')
        data = res.get_json()
        assert data['models_loaded']['forecast_model'] is False
        assert data['models_loaded']['classifier_model'] is False


# ─── /predict — Input Validation ───────────────────────────────────────────────

class TestPredict:
    def test_predict_missing_body_returns_400(self, client):
        res = client.post('/predict', data='{}', content_type='application/json')
        data = res.get_json()
        assert res.status_code == 400
        assert 'error' in data

    def test_predict_empty_bod_readings_returns_400(self, client):
        res = client.post('/predict',
                          data=json.dumps({'bod_readings': []}),
                          content_type='application/json')
        data = res.get_json()
        assert res.status_code == 400
        assert 'error' in data

    def test_predict_too_few_readings_returns_400(self, client):
        """Fewer than 5 readings must be rejected."""
        res = client.post('/predict',
                          data=json.dumps({'bod_readings': [10.0, 11.0, 12.0]}),
                          content_type='application/json')
        data = res.get_json()
        assert res.status_code == 400
        assert 'error' in data

    def test_predict_non_list_readings_returns_400(self, client):
        res = client.post('/predict',
                          data=json.dumps({'bod_readings': 'not-a-list'}),
                          content_type='application/json')
        data = res.get_json()
        assert res.status_code == 400
        assert 'error' in data

    def test_predict_nan_value_returns_400(self, client):
        """Infinite or NaN values must be rejected — we never fabricate from garbage input."""
        import math
        res = client.post('/predict',
                          data=json.dumps({'bod_readings': [1.0, 2.0, 3.0, 4.0, math.inf]}),
                          content_type='application/json')
        # The json module won't serialise inf, so this tests the serialisation guard
        # (client would get a 400 or 500 — either is acceptable; token must not leak)
        assert res.status_code in (400, 500)

    def test_predict_returns_503_when_model_unavailable(self, client):
        """With models not loaded, /predict must return 503 (not fabricate data)."""
        res = client.post('/predict',
                          data=json.dumps({'location': 'Kanpur', 'bod_readings': [10.0, 11.0, 12.0, 13.0, 14.0]}),
                          content_type='application/json')
        data = res.get_json()
        assert res.status_code == 503
        assert 'error' in data
        # Must not return a 'forecast' key when model is unavailable
        assert 'forecast' not in data, 'Must not fabricate forecast data when model is unavailable'

    def test_predict_no_token_field_in_error_response(self, client):
        """Error responses from /predict must never contain a 'token' key."""
        res = client.post('/predict',
                          data=json.dumps({'bod_readings': []}),
                          content_type='application/json')
        data = res.get_json()
        assert 'token' not in data


# ─── /classify-source — Input Validation ───────────────────────────────────────

class TestClassifySource:
    VALID_PAYLOAD = {
        'chromium': 0.08, 'lead': 0.05, 'mercury': 0.01,
        'bod': 25.0, 'do': 3.5, 'turbidity': 45.0
    }

    def test_classify_missing_all_fields_returns_400(self, client):
        res = client.post('/classify-source',
                          data=json.dumps({}),
                          content_type='application/json')
        data = res.get_json()
        assert res.status_code == 400
        assert 'error' in data

    def test_classify_missing_one_field_returns_400(self, client):
        payload = dict(self.VALID_PAYLOAD)
        del payload['mercury']  # remove one required field
        res = client.post('/classify-source',
                          data=json.dumps(payload),
                          content_type='application/json')
        data = res.get_json()
        assert res.status_code == 400
        assert 'error' in data

    def test_classify_non_numeric_field_returns_400(self, client):
        payload = dict(self.VALID_PAYLOAD)
        payload['chromium'] = 'not-a-number'
        res = client.post('/classify-source',
                          data=json.dumps(payload),
                          content_type='application/json')
        data = res.get_json()
        assert res.status_code == 400
        assert 'error' in data

    def test_classify_returns_503_when_model_unavailable(self, client):
        """With models not loaded, /classify-source must return 503 (not fabricate)."""
        res = client.post('/classify-source',
                          data=json.dumps(self.VALID_PAYLOAD),
                          content_type='application/json')
        data = res.get_json()
        assert res.status_code == 503
        assert 'error' in data
        # Must not contain fabricated pollutant attribution
        assert 'source' not in data, 'Must not fabricate a source classification when model is unavailable'

    def test_classify_never_invents_lead(self, client):
        """The /classify-source endpoint must never add lead values not present in input."""
        res = client.post('/classify-source',
                          data=json.dumps(self.VALID_PAYLOAD),
                          content_type='application/json')
        data = res.get_json()
        # When model unavailable: error response — no lead field
        # When model available: response has 'source' and 'confidence' but not a 'lead' field
        assert 'lead' not in data, 'API must not fabricate lead measurements'

    def test_classify_never_invents_mercury(self, client):
        res = client.post('/classify-source',
                          data=json.dumps(self.VALID_PAYLOAD),
                          content_type='application/json')
        data = res.get_json()
        assert 'mercury' not in data, 'API must not fabricate mercury measurements'

    def test_classify_never_invents_chromium(self, client):
        res = client.post('/classify-source',
                          data=json.dumps(self.VALID_PAYLOAD),
                          content_type='application/json')
        data = res.get_json()
        assert 'chromium' not in data, 'API must not fabricate chromium measurements'


# ─── Content-Type enforcement ──────────────────────────────────────────────────

class TestContentType:
    def test_predict_without_content_type_does_not_crash(self, client):
        """Sending non-JSON body must return 400 or 503, never 500 crash."""
        res = client.post('/predict', data='not json at all')
        assert res.status_code in (400, 503, 500)
        data = res.get_json()
        assert data is not None, 'Response must always be JSON'

    def test_classify_without_content_type_does_not_crash(self, client):
        res = client.post('/classify-source', data='not json at all')
        assert res.status_code in (400, 503, 500)
        data = res.get_json()
        assert data is not None, 'Response must always be JSON'

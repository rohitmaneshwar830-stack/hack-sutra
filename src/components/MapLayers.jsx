import React, { useCallback, useEffect, useState } from 'react';
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../utils/api';

function FitBounds({ layers }) {
  const map = useMap();
  useEffect(() => {
    const points = (layers?.stations || [])
      .map((s) => [s.coordinates[1], s.coordinates[0]])
      .filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
    if (points.length) map.fitBounds(points, { padding: [24, 24] });
  }, [layers, map]);
  return null;
}

/** Colour-codes citizen report pins by their resolution status. */
const reportColor = (status) => {
  if (['Verified', 'Action Taken', 'Resolved'].includes(status)) return '#2d6a4f';
  if (status === 'Under Review') return '#f5a623';
  return '#c92a2a'; // Pending / unknown
};

export default function MapLayers() {
  const [layers, setLayers]           = useState(null);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(true);
  const [showIndustries, setShowIndustries] = useState(true);
  const [showRivers, setShowRivers]   = useState(true);
  const [showReports, setShowReports] = useState(true);

  const fetchLayers = useCallback(() => {
    setLoading(true);
    setError('');
    api.get('/map/layers')
      .then((res) => setLayers(res.layers))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLayers(); }, [fetchLayers]);

  if (error) {
    return (
      <div role="alert" className="flex items-center justify-between border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <span>Map data unavailable: {error}</span>
        <button onClick={fetchLayers} className="ml-4 text-xs font-bold underline">Retry</button>
      </div>
    );
  }

  if (loading || !layers) {
    return (
      <div className="flex h-80 items-center justify-center border border-gray-200 text-sm text-gray-500">
        Loading GIS layers…
      </div>
    );
  }

  const stations      = layers.stations       || [];
  const industries    = layers.industries     || [];
  const riverStretches = layers.riverStretches || [];
  const reports       = layers.reports        || [];
  const satellite     = layers.satellite; // null when SATELLITE_TILE_URL not configured
  const hasData       = stations.length || industries.length || riverStretches.length || reports.length;

  return (
    <div className="relative overflow-hidden border border-gray-200">
      {/* ── Layer toggle controls ── */}
      <div className="absolute left-3 top-3 z-[1000] flex flex-wrap gap-2 rounded bg-white/95 p-2 text-xs shadow">
        <label className="flex cursor-pointer select-none items-center gap-1.5">
          <input type="checkbox" checked={showIndustries} onChange={(e) => setShowIndustries(e.target.checked)} />
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
          Industries
        </label>
        <label className="flex cursor-pointer select-none items-center gap-1.5">
          <input type="checkbox" checked={showRivers} onChange={(e) => setShowRivers(e.target.checked)} />
          <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
          River stretches
        </label>
        <label className="flex cursor-pointer select-none items-center gap-1.5">
          <input type="checkbox" checked={showReports} onChange={(e) => setShowReports(e.target.checked)} />
          <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
          Citizen reports
        </label>
      </div>

      {/* ── Legend ── */}
      <div className="absolute right-3 top-3 z-[1000] space-y-1 rounded bg-white/95 p-2 text-[10px] shadow">
        <div className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Monitoring station</div>
        <div className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-500"     /> Industry</div>
        <div className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-orange-400" /> Pending report</div>
        <div className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-700" /> Resolved report</div>
      </div>

      <MapContainer center={[26.45, 80.35]} zoom={7} className="h-96 w-full">
        {/* Base OSM tiles */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Optional satellite overlay — only rendered when the backend reports a configured provider */}
        {satellite && (
          <TileLayer
            attribution={satellite.attribution}
            url={satellite.url}
            opacity={0.65}
          />
        )}

        <FitBounds layers={layers} />

        {/* ── Monitoring stations (teal) ── */}
        {stations.map((s) => (
          <CircleMarker
            key={s._id}
            center={[s.coordinates[1], s.coordinates[0]]}
            radius={8}
            pathOptions={{ color: '#087f5b', fillColor: '#20c997', fillOpacity: 0.85, weight: 2 }}
          >
            <Popup>
              <strong>{s.name}</strong><br />
              {s.location}<br />
              <small className="text-gray-500">Provider: {s.provider}</small>
            </Popup>
          </CircleMarker>
        ))}

        {/* ── Industry markers (red) ── */}
        {showIndustries && industries.map((ind) => (
          <CircleMarker
            key={ind._id}
            center={[ind.coordinates[1], ind.coordinates[0]]}
            radius={7}
            pathOptions={{ color: '#c92a2a', fillColor: '#ff6b6b', fillOpacity: 0.85, weight: 2 }}
          >
            <Popup>
              <strong>{ind.name}</strong><br />
              {ind.category}<br />
              <small className="text-gray-500">Provider: {ind.provider}</small>
            </Popup>
          </CircleMarker>
        ))}

        {/* ── River stretch GeoJSON (blue) ── */}
        {showRivers && riverStretches.map((stretch) => (
          <GeoJSON
            key={stretch._id}
            data={stretch.geometry}
            pathOptions={{ color: '#1971c2', weight: 4, opacity: 0.7 }}
          />
        ))}

        {/* ── Citizen report pins — colour-coded by resolution status ── */}
        {showReports && reports.map((report) => {
          // Only show reports that have valid GPS coordinates
          const raw = report.gpsCoords ? String(report.gpsCoords).split(',').map(Number) : null;
          if (!raw || raw.length !== 2 || !Number.isFinite(raw[0]) || !Number.isFinite(raw[1])) return null;
          const color = reportColor(report.status);
          return (
            <CircleMarker
              key={report._id}
              center={[raw[0], raw[1]]}
              radius={6}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}
            >
              <Popup>
                <strong>{report.type}</strong><br />
                {report.location}<br />
                Status: <em>{report.status}</em><br />
                <small className="text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </small>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Empty-state overlay when no GIS records exist in DB */}
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-gray-600">
          No GIS records available. Sync official data via the Admin panel to populate this map.
        </div>
      )}
    </div>
  );
}

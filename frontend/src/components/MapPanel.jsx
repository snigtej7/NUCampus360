import { useEffect, useRef } from 'react';

// Leaflet is loaded via CDN in index.html for simplicity with pannellum
// For a full React setup, import from 'leaflet' directly
const L = window.L;

const TYPE_COLORS = {
  'Academic': '#CC0000',
  'Student Services': '#e07b39',
  'Research': '#3b82f6',
  'Recreation': '#22c55e',
  'Dining': '#e07b39'
};

export default function MapPanel({ buildings, loading, onOpenTour, onAskAbout }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!L || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: true
    }).setView([47.6205, -122.3490], 17);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Add/update markers when buildings load
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !buildings.length || !L) return;

    // Clear existing
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    buildings.forEach(b => {
      const color = TYPE_COLORS[b.type] || '#CC0000';
      const hasTour = b.tourImages && b.tourImages.length > 0;

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:32px; height:32px;
          background:${color};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:2px solid rgba(255,255,255,0.25);
          box-shadow:0 4px 18px ${color}55;
          transition: box-shadow 0.2s;
          cursor: pointer;
          position: relative;
        ">
          <div style="
            width:10px; height:10px;
            background:white;
            border-radius:50%;
            position:absolute;
            top:50%; left:50%;
            transform:translate(-50%,-50%);
          "></div>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -36]
      });

      const marker = L.marker([b.lat, b.lng], { icon }).addTo(map);

      const spacePills = (b.spaces || []).map(s =>
        `<span style="display:inline-block;background:rgba(255,255,255,0.06);border-radius:4px;padding:2px 7px;font-size:11px;margin:2px 2px 0 0;color:#aaa;">${s}</span>`
      ).join('');

      marker.bindPopup(`
        <div style="min-width:230px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:${color};margin-bottom:4px;">${b.type}</div>
          <div style="font-family:'DM Serif Display',serif;font-size:17px;color:#fff;margin-bottom:6px;">${b.name}</div>
          <div style="font-size:13px;color:#999;line-height:1.5;margin-bottom:8px;">${b.description}</div>
          <div style="font-size:12px;color:#888;background:rgba(255,255,255,0.04);border-radius:6px;padding:6px 8px;margin-bottom:8px;">
            <strong style="color:#ddd;">Hours:</strong> ${b.hours}
          </div>
          <div style="margin-bottom:12px;">${spacePills}</div>
          <div style="display:flex;gap:6px;">
            <button onclick="window.__openTour('${b.id}')" style="
              background:${color};color:white;border:none;padding:7px 13px;
              border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;
              font-family:'DM Sans',sans-serif;
            ">${hasTour ? '🌐 360° Tour' : '📸 View Space'}</button>
            <button onclick="window.__askAbout('${b.name}')" style="
              background:rgba(255,255,255,0.08);color:#ddd;border:none;padding:7px 13px;
              border-radius:6px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;
            ">Ask AI →</button>
          </div>
        </div>
      `, { maxWidth: 300 });

      markersRef.current.push(marker);
    });
  }, [buildings]);

  // Expose handlers to popup buttons (they run in global scope)
  useEffect(() => {
    window.__openTour = onOpenTour;
    window.__askAbout = onAskAbout;
    return () => {
      delete window.__openTour;
      delete window.__askAbout;
    };
  }, [onOpenTour, onAskAbout]);

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 20, left: 16, zIndex: 500,
        background: 'rgba(20,20,20,0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--panel-border)',
        borderRadius: 'var(--radius)',
        padding: '12px 14px',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Buildings
        </div>
        {Object.entries(TYPE_COLORS).filter(([k]) => k !== 'Dining').map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-dim)', marginBottom: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
            {type}
          </div>
        ))}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 600,
          background: 'rgba(10,10,10,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 12
        }}>
          <div style={{ fontSize: 32 }}>🗺</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>Loading campus map…</div>
        </div>
      )}
    </div>
  );
}

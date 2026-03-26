import { useEffect, useRef, useState } from 'react';

export default function TourPanel({ building, onClose, onShowPhotoGuide }) {
  const panoramaRef = useRef(null);
  const viewerRef = useRef(null);
  const [activeScene, setActiveScene] = useState(0);
  
  const scenes = building.scenes || [];
  const hasTour = scenes.length > 0;

  useEffect(() => {
    if (!hasTour || !window.pannellum) return;

    if (viewerRef.current) {
      try {
        viewerRef.current.destroy();
      } catch (e) {}
      viewerRef.current = null;
    }

    // Build image URL
    let imageUrl = scenes[activeScene]?.file || '';
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `http://localhost:3001/data/${imageUrl}`;
    }

    if (!imageUrl) return;

    // Load panorama viewer
    viewerRef.current = window.pannellum.viewer(panoramaRef.current, {
      type: 'equirectangular',
      panorama: imageUrl,
      autoLoad: true,
      showControls: true,
      hfov: scenes[activeScene]?.hfov || 110,
      minHfov: 80,
      maxHfov: 140,
      pitch: 0,
      yaw: 0,
      autoRotate: -2,
      autoRotateInactivityDelay: 3000,
      compass: false,
      showFullscreenCtrl: true,
      mouseZoom: true
    });

    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {}
        viewerRef.current = null;
      }
    };
  }, [activeScene, hasTour, scenes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        background: 'var(--charcoal)',
        borderBottom: '1px solid var(--panel-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontFamily: "'DM Sans', sans-serif",
            padding: '4px 8px',
            borderRadius: 6,
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => (e.target.style.color = 'var(--text)')}
          onMouseLeave={(e) => (e.target.style.color = 'var(--text-dim)')}
        >
          ← Back
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: 'var(--white)' }}>
            {building.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{building.type}</div>
        </div>
      </div>

      {/* Panorama Viewer or Placeholder */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {hasTour ? (
          <div ref={panoramaRef} style={{ width: '100%', height: '100%' }} />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0d1a0d 0%, #0f1020 100%)',
              padding: 28,
              textAlign: 'center',
              gap: 14
            }}
          >
            <div style={{ fontSize: 52 }}>📸</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: 'var(--white)' }}>
              360° Tour Coming Soon
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.65, maxWidth: 270 }}>
              Capture equirectangular panoramic photos of{' '}
              <strong style={{ color: 'var(--text)' }}>{building.name}</strong> and add them to the data file to enable
              immersive walkthroughs.
            </div>
            <button
              onClick={onShowPhotoGuide}
              style={{
                marginTop: 4,
                background: 'var(--red)',
                color: 'white',
                border: 'none',
                padding: '9px 18px',
                borderRadius: 8,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              How to add photos →
            </button>

            <div
              style={{
                marginTop: 8,
                width: '100%',
                maxWidth: 300,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--panel-border)',
                borderRadius: 10,
                padding: '12px 14px',
                textAlign: 'left'
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--red)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 8,
                  fontWeight: 600
                }}
              >
                Building Info
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.7 }}>
                <div>
                  <strong style={{ color: 'var(--text)' }}>Hours:</strong> {building.hours}
                </div>
                {building.contact && (
                  <div style={{ marginTop: 4 }}>
                    <strong style={{ color: 'var(--text)' }}>Contact:</strong>{' '}
                    <a href={`mailto:${building.contact}`} style={{ color: 'var(--red)', textDecoration: 'none' }}>
                      {building.contact}
                    </a>
                  </div>
                )}
              </div>
              {building.amenities && building.amenities.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {building.amenities.map((a) => (
                    <span
                      key={a}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: 4,
                        padding: '2px 7px',
                        fontSize: 11,
                        color: '#999'
                      }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Scene Navigation - only show if multiple scenes */}
      {hasTour && scenes.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '10px 12px',
            background: 'var(--charcoal)',
            borderTop: '1px solid var(--panel-border)',
            overflowX: 'auto',
            flexShrink: 0
          }}
        >
          {scenes.map((scene, i) => (
            <button
              key={i}
              onClick={() => setActiveScene(i)}
              style={{
                minWidth: 72,
                height: 50,
                background: 'var(--panel-border)',
                borderRadius: 6,
                cursor: 'pointer',
                border: `2px solid ${activeScene === i ? 'var(--red)' : 'transparent'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                flexShrink: 0,
                transition: 'border-color 0.2s',
                color: 'var(--text-dim)',
                fontFamily: "'DM Sans', sans-serif",
                padding: '4px 8px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'normal'
              }}
              title={scene.label}
            >
              {scene.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PhotoModal({ onClose }) {
  const steps = [
    {
      icon: '📱',
      title: 'Capture with your phone (Free)',
      body: 'Download the Google Street View app or Insta360 app. Walk to a room, tap "Add photo", and follow the guided capture. The app automatically stitches an equirectangular panorama.'
    },
    {
      icon: '🖼',
      title: 'Upload to Cloudinary (Free)',
      body: 'Create a free account at cloudinary.com. Upload your panorama image. Copy the resulting URL — it looks like: https://res.cloudinary.com/YOUR_CLOUD/image/upload/your_photo.jpg'
    },
    {
      icon: '🛠',
      title: 'Add URL to campus data',
      body: 'Open backend/data/campus.js. Find the building object. Add your Cloudinary URL to its tourImages array. Multiple URLs create a multi-scene tour.'
    },
    {
      icon: '🚀',
      title: 'Deploy & done',
      body: 'Commit and push to GitHub. Your Render backend auto-deploys in ~2 minutes. The 360° viewer will be live instantly — no code changes needed.'
    }
  ];

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.82)',
        zIndex: 9999, padding: 20,
        overflowY: 'auto',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center'
      }}
    >
      <div style={{
        maxWidth: 540, width: '100%', margin: '40px auto',
        background: 'var(--panel)',
        border: '1px solid var(--panel-border)',
        borderRadius: 16, padding: 28,
        animation: 'fadeUp 0.25s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 21, color: 'var(--white)' }}>
            Adding 360° Photos
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-dim)',
            fontSize: 20, cursor: 'pointer', lineHeight: 1
          }}>✕</button>
        </div>

        <p style={{ fontSize: 13.5, color: 'var(--text-dim)', marginBottom: 20, lineHeight: 1.65 }}>
          NUCampus360 uses <strong style={{ color: 'var(--text)' }}>Pannellum</strong> to render equirectangular panoramic images as interactive 360° viewers. Here's how to get photos into the app:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              background: 'var(--charcoal)',
              border: '1px solid var(--panel-border)',
              borderRadius: 10, padding: '14px 16px',
              display: 'flex', gap: 14
            }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{step.icon}</div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: 5, fontSize: 14 }}>
                  <span style={{ color: 'var(--red)', marginRight: 6 }}>{i + 1}.</span>{step.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.65 }}>{step.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 18,
          background: 'rgba(204,0,0,0.08)',
          border: '1px solid rgba(204,0,0,0.2)',
          borderRadius: 8, padding: '12px 14px'
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text)' }}>Example code in campus.js:</strong>
            <pre style={{
              marginTop: 8, background: 'var(--black)', borderRadius: 6,
              padding: '10px 12px', fontSize: 12, color: '#a5d6a7',
              overflow: 'auto', lineHeight: 1.5
            }}>{`tourImages: [
  "https://res.cloudinary.com/mycloud/image/upload/lobby.jpg",
  "https://res.cloudinary.com/mycloud/image/upload/main_hall.jpg",
  "https://res.cloudinary.com/mycloud/image/upload/lab.jpg"
]`}</pre>
          </div>
        </div>

        <button onClick={onClose} style={{
          marginTop: 20, width: '100%',
          background: 'var(--red)', color: 'white',
          border: 'none', padding: '11px',
          borderRadius: 9, fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, fontWeight: 500, cursor: 'pointer'
        }}>
          Got it, let's shoot some photos
        </button>
      </div>
    </div>
  );
}

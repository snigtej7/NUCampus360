import { useState, useEffect } from 'react';
import Nav from './components/Nav';
import MapPanel from './components/MapPanel';
import ChatPanel from './components/ChatPanel';
import TourPanel from './components/TourPanel';
import PhotoModal from './components/PhotoModal';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  const [buildings, setBuildings] = useState([]);
  const [activePanel, setActivePanel] = useState('chat'); // 'chat' | 'tour'
  const [activeTourBuilding, setActiveTourBuilding] = useState(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch campus data from backend
  useEffect(() => {
    fetch(`${API_BASE}/campus`)
      .then(r => r.json())
      .then(data => {
        setBuildings(data.buildings || []);
        setLoading(false);
      })
      .catch(() => {
        // Fallback: load local data if backend is unreachable
        import('./data/campusFallback').then(m => {
          setBuildings(m.default);
          setLoading(false);
        });
      });
  }, []);

  function openTour(buildingId) {
    const b = buildings.find(x => x.id === buildingId);
    if (b) {
      setActiveTourBuilding(b);
      setActivePanel('tour');
    }
  }

  function closeTour() {
    setActiveTourBuilding(null);
    setActivePanel('chat');
  }

  function askAboutBuilding(buildingName) {
    setPendingQuestion(`Tell me about ${buildingName}`);
    setActivePanel('chat');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Nav />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Map — always rendered, always visible */}
        <MapPanel
          buildings={buildings}
          loading={loading}
          onOpenTour={openTour}
          onAskAbout={askAboutBuilding}
        />

        {/* Right panel — chat or tour */}
        <div style={{
          width: 'clamp(300px, 380px, 38vw)',
          background: 'var(--panel)',
          borderLeft: '1px solid var(--panel-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {activePanel === 'tour' && activeTourBuilding ? (
            <TourPanel
              building={activeTourBuilding}
              onClose={closeTour}
              onShowPhotoGuide={() => setPhotoModalOpen(true)}
            />
          ) : (
            <ChatPanel
              apiBase={API_BASE}
              pendingQuestion={pendingQuestion}
              onPendingHandled={() => setPendingQuestion(null)}
            />
          )}
        </div>
      </div>

      {photoModalOpen && (
        <PhotoModal onClose={() => setPhotoModalOpen(false)} />
      )}
    </div>
  );
}

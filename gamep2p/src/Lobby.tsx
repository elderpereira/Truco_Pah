
import React, { useState } from 'react';

interface LobbyProps {
  onCreate: () => void;
  onJoin: (peerId: string) => void;
}

export default function Lobby({ onCreate, onJoin }: LobbyProps) {
  const [peerId, setPeerId] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="container">
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        background: '#222',
        color: '#fff',
        boxShadow: '0 2px 8px #0001',
        zIndex: 200,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        minHeight: 56,
        boxSizing: 'border-box',
        maxWidth: '100vw',
      }}>
        <h2 style={{ margin: 0, color: '#fff' }}>PeerJS Demo</h2>
        <div style={{ display: 'flex', gap: 16 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#fff', fontWeight: 'bold' }} onClick={onCreate}>
            Criar Sala
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#fff', fontWeight: 'bold' }} onClick={() => setShowPopup(true)}>
            Conectar
          </button>
        </div>
      </header>

      {/* Espaço para não cobrir o conteúdo */}
      <div style={{ height: 72 }}></div>

      {showPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0006', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', color: '#222', borderRadius: 8, boxShadow: '0 2px 8px #0002', padding: 32, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ marginBottom: 16, color: '#222' }}>Entrar em Sala</h3>
            <input
              type="text"
              value={peerId}
              onChange={e => setPeerId(e.target.value)}
              placeholder="Peer ID do host"
              style={{ marginBottom: 16, width: '100%', color: '#222', background: '#f5f5f5', border: '1px solid #ccc' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { onJoin(peerId); setShowPopup(false); }} style={{ padding: '8px 16px', color: '#fff', background: '#007bff', border: 'none', borderRadius: 4 }}>Conectar</button>
              <button onClick={() => setShowPopup(false)} style={{ padding: '8px 16px', background: '#eee', color: '#222', border: 'none', borderRadius: 4 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

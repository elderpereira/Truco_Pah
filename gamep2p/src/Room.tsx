import React, { useState } from 'react';

export default function Room({ roomId, onCopy, log, onSendMessage, name, players = [], onPlayersOpen, playersCheck }) {
  const [showChat, setShowChat] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);
  const [msg, setMsg] = useState('');
  const handleSend = (e) => {
    e.preventDefault();
    if (msg.trim() && onSendMessage) {
      onSendMessage(msg);
      setMsg('');
    }
  };

  // Quando abrir a lista de players, dispara ping
  React.useEffect(() => {
    if (showPlayers && onPlayersOpen) onPlayersOpen();
    // eslint-disable-next-line
  }, [showPlayers, playersCheck]);

  return (
    <div style={{ minHeight: '100vh', minWidth: '100vw', width: '100vw', height: '100vh', background: '#181818', display: 'flex', flexDirection: 'column' }}>
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
        <span style={{ fontWeight: 'bold', fontSize: 18, color: '#fff' }}>Sala</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="peer-id" style={{ fontSize: 15, padding: '6px 10px', background: '#222', color: '#fff', border: '1px solid #444' }}>{roomId}</span>
          <button onClick={onCopy} style={{ padding: '6px 12px', fontSize: 15, background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Copiar</button>
        </div>
      </header>
      <main style={{ flex: 1, marginTop: 72, marginBottom: 64, padding: '0 4vw', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <div className="section" style={{ margin: 0, width: '100%' }}>
          <pre className="log" style={{ minHeight: 60, textAlign: 'left', width: '100%', wordBreak: 'break-word' }}>{log}</pre>
        </div>
      </main>
      <footer style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        background: '#222',
        color: '#fff',
        boxShadow: '0 -2px 8px #0001',
        zIndex: 200,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        minHeight: 56,
        boxSizing: 'border-box',
        maxWidth: '100vw',
      }}>
        <span style={{ fontWeight: 'bold', fontSize: 16 }}>Menu</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#fff', fontWeight: 'bold' }} onClick={() => setShowPlayers(v => !v)}>
            Players
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#fff', fontWeight: 'bold' }} onClick={() => setShowChat(v => !v)}>
            Chat
          </button>
        </div>
      </footer>
      {showPlayers && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 56, zIndex: 400, display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#fff', color: '#222', borderRadius: 8, boxShadow: '0 2px 8px #0002', padding: 20, minWidth: 260, maxWidth: 340, width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 'bold', color: '#007bff', fontSize: 18 }}>Jogadores</span>
              <button onClick={() => setShowPlayers(false)} style={{ background: 'none', border: 'none', color: '#007bff', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' }}>X</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {players.map((p, i) => (
                <li key={i} style={{ padding: 6, borderBottom: '1px solid #eee', fontWeight: p === name ? 'bold' : 'normal', color: p === name ? '#007bff' : '#222' }}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {showChat && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 56, zIndex: 300, display: 'flex', justifyContent: 'center' }}>
          <form onSubmit={handleSend} style={{ background: '#fff', color: '#222', borderRadius: 8, boxShadow: '0 2px 8px #0002', padding: 12, minWidth: 320, display: 'flex', alignItems: 'center', gap: 8, maxWidth: 480, width: '90%' }}>
            <span style={{ fontWeight: 'bold', color: '#007bff' }}>{name || 'Você'}:</span>
            <input
              type="text"
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder="Digite sua mensagem..."
              style={{ flex: 1, color: '#222', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 4, padding: 8 }}
              autoFocus
            />
            <button type="submit" style={{ padding: '8px 16px', color: '#fff', background: '#007bff', border: 'none', borderRadius: 4 }}>Enviar</button>
          </form>
        </div>
      )}
    </div>
  );
}

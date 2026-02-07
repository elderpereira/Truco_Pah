

import React, { useState, useRef } from 'react';
import Peer from 'peerjs';
import Lobby from './Lobby';
import Room from './Room';

// Tipos para as refs
// eslint-disable-next-line no-unused-vars
/** @type {import('peerjs').Peer | null} */
// eslint-disable-next-line no-unused-vars
/** @type {import('peerjs').DataConnection | null} */


export default function App() {
  const [page, setPage] = useState('lobby');
  const [roomId, setRoomId] = useState('');
  const [log, setLog] = useState('');
  const [name, setName] = useState('');
  const [askName, setAskName] = useState(false);
  const [players, setPlayers] = useState([]); // lista de nomes dos jogadores
  const [playersCheck, setPlayersCheck] = useState(0); // trigger para forçar checagem
  const peerRef = useRef(null);
  const connRef = useRef(null);
  const guestsRef = useRef([]);

  const appendLog = (msg) => setLog(l => l + '\n' + msg);

  const askNameAndProceed = (cb) => {
    setAskName(true);
    const handler = (e) => {
      e.preventDefault();
      const input = document.getElementById('input-nome');
      const nome = input && 'value' in input ? input.value.trim() : '';
      if (nome) {
        setName(nome);
        setAskName(false);
        cb(nome);
      }
    };
    setTimeout(() => {
      const form = document.getElementById('form-nome');
      if (form) form.onsubmit = handler;
    }, 0);
  };

  const handleCreate = () => {
    askNameAndProceed((nome) => {
      peerRef.current = new Peer();
      appendLog('Criando sala...');
      guestsRef.current = [];
      setPlayers([nome]);
      peerRef.current.on('open', (id) => {
        setRoomId(id);
        setPage('room');
        appendLog(`Sala criada! Compartilhe o Peer ID: ${id}`);
      });
      peerRef.current.on('connection', (connection) => {
        // @ts-ignore
        guestsRef.current.push(connection);
        appendLog('Jogador conectado!');
        let playerName = null;
        let pingTimeout = null;
        connection.on('data', (data) => {
          let parsed;
          try { parsed = JSON.parse(data); } catch {}
          if (parsed && parsed.type === 'join' && parsed.name) {
            playerName = parsed.name;
            setPlayers(prev => {
              if (!prev.includes(parsed.name)) {
                const updated = [...prev, parsed.name];
                // @ts-ignore
                guestsRef.current.forEach(conn => { if (conn && conn.open) conn.send(JSON.stringify({ type: 'players', players: updated })); });
                return updated;
              }
              return prev;
            });
          } else if (parsed && parsed.type === 'players' && Array.isArray(parsed.players)) {
            setPlayers(parsed.players);
          } else if (parsed && parsed.type === 'ping') {
            // Responde ao ping
            connection.send(JSON.stringify({ type: 'pong' }));
          } else if (parsed && parsed.type === 'pong') {
            // Recebeu pong, limpa timeout
            if (pingTimeout) clearTimeout(pingTimeout);
          } else {
            appendLog(`Recebido do convidado: ${data}`);
            // Propaga mensagens normais
            // @ts-ignore
            guestsRef.current.forEach(conn => { if (conn !== connection && conn && conn.open) { conn.send(data); } });
          }
        });
        connection.on('close', () => {
          // Remove player da lista e avisa todos
          setPlayers(prev => {
            const updated = prev.filter(p => p !== playerName);
            // @ts-ignore
            guestsRef.current.forEach(conn => { if (conn && conn.open) conn.send(JSON.stringify({ type: 'players', players: updated })); });
            // @ts-ignore
            guestsRef.current.forEach(conn => { if (conn && conn.open) conn.send(`${playerName} saiu da sala.`); });
            appendLog(`${playerName} saiu da sala.`);
            return updated;
          });
        });
        // Envia lista de players atual para novo convidado
        connection.send(JSON.stringify({ type: 'players', players: [...players, nome] }));
      });
      peerRef.current.on('error', (err) => appendLog('Erro: ' + err));
    });
  };

  const handleJoin = (peerId) => {
    if (!peerId.trim()) {
      appendLog('Insira o Peer ID do host.');
      return;
    }
    askNameAndProceed((nome) => {
      peerRef.current = new Peer();
      appendLog('Conectando ao host...');
      peerRef.current.on('open', () => {
        connRef.current = peerRef.current.connect(peerId);
        connRef.current.on('open', () => {
          appendLog('Conectado ao host!');
          setRoomId(peerId);
          setPage('room');
          // Envia mensagem de join com nome
          connRef.current.send(JSON.stringify({ type: 'join', name: nome }));
        });
        connRef.current.on('data', (data) => {
          let parsed;
          try { parsed = JSON.parse(data); } catch {}
          if (parsed && parsed.type === 'players' && Array.isArray(parsed.players)) {
            setPlayers(parsed.players);
          } else if (typeof parsed === 'object' && parsed && parsed.type === 'ping') {
            // Responde ao ping
            connRef.current.send(JSON.stringify({ type: 'pong' }));
          } else if (typeof parsed === 'object' && parsed && parsed.type === 'pong') {
            // Recebeu pong, não faz nada
          } else {
            appendLog(`${data}`);
          }
        });
        connRef.current.on('close', () => {
          appendLog('Você foi desconectado do host.');
        });
        connRef.current.on('error', (err) => appendLog('Erro na conexão: ' + err));
      });
      peerRef.current.on('error', (err) => appendLog('Erro: ' + err));
    });
  };

  const handleCopy = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      appendLog('Código da sala copiado!');
    }
  };

  const handleSendMessage = (msg) => {
    if (name) {
      const fullMsg = `${name}: ${msg}`;
      appendLog(fullMsg);
      // Se for host, propaga para todos os convidados
      if (guestsRef.current.length > 0) {
        // @ts-ignore
        guestsRef.current.forEach(conn => {
          if (conn && conn.open) conn.send(fullMsg);
        });
      }
      // Se for convidado, envia para o host
      // @ts-ignore
      if (connRef.current && connRef.current.open) {
        connRef.current.send(fullMsg);
      }
    }
  };

  if (askName) {
    return (
      <div style={{ minHeight: '100vh', background: '#181818', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form id="form-nome" style={{ background: '#fff', color: '#222', borderRadius: 8, boxShadow: '0 2px 8px #0002', padding: 32, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ marginBottom: 16, color: '#222' }}>Qual seu nome?</h3>
          <input id="input-nome" type="text" placeholder="Digite seu nome" style={{ marginBottom: 16, width: '100%', color: '#222', background: '#f5f5f5', border: '1px solid #ccc', padding: 8, borderRadius: 4 }} autoFocus />
          <button type="submit" style={{ padding: '8px 16px', color: '#fff', background: '#007bff', border: 'none', borderRadius: 4 }}>Entrar</button>
        </form>
      </div>
    );
  }

  if (page === 'lobby') {
    return <Lobby onCreate={handleCreate} onJoin={handleJoin} />;
  }
  // Função para pingar todos os jogadores (host)
  const pingPlayers = () => {
    if (guestsRef.current.length > 0) {
      guestsRef.current.forEach(conn => {
        if (conn && conn.open) {
          let ponged = false;
          conn.send(JSON.stringify({ type: 'ping' }));
          const timeout = setTimeout(() => {
            if (!ponged) {
              // Remove player da lista e avisa todos
              let playerName = null;
              // Tenta descobrir o nome pelo último players[]
              // (não é 100% seguro, mas suficiente para demo)
              setPlayers(prev => {
                const toRemove = prev.find(p => !guestsRef.current.some(c => c && c.open));
                if (toRemove) {
                  const updated = prev.filter(p => p !== toRemove);
                  guestsRef.current.forEach(c => { if (c && c.open) c.send(JSON.stringify({ type: 'players', players: updated })); });
                  guestsRef.current.forEach(c => { if (c && c.open) c.send(`${toRemove} saiu da sala.`); });
                  appendLog(`${toRemove} saiu da sala.`);
                  return updated;
                }
                return prev;
              });
            }
          }, 1500);
          conn.on('data', (data) => {
            let parsed;
            try { parsed = JSON.parse(data); } catch {}
            if (parsed && parsed.type === 'pong') {
              ponged = true;
              clearTimeout(timeout);
            }
          });
        }
      });
    }
    setPlayersCheck(v => v + 1); // força rerender
  };

  return <Room roomId={roomId} onCopy={handleCopy} log={log} onSendMessage={handleSendMessage} name={name} players={players} onPlayersOpen={pingPlayers} playersCheck={playersCheck} />;
}

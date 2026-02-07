

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
  // Usar refs sem tipagem para compatibilidade JS
  const peerRef = useRef(null);
  const connRef = useRef(null);
  // guestsRef armazena as conexões dos convidados (array de qualquer tipo)
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
      peerRef.current.on('open', (id) => {
        setRoomId(id);
        setPage('room');
        appendLog(`Sala criada! Compartilhe o Peer ID: ${id}`);
      });
      peerRef.current.on('connection', (connection) => {
        // Corrigir push para array de conexões
        // @ts-ignore
        guestsRef.current.push(connection);
        appendLog('Jogador conectado!');
        connection.on('data', (data) => {
          appendLog(`Recebido do convidado: ${data}`);
          // Propagar mensagem recebida para todos os outros convidados
          // @ts-ignore
          guestsRef.current.forEach(conn => {
            if (conn !== connection && conn && conn.open) {
              conn.send(data);
            }
          });
        });
        connection.send(`Bem-vindo à sala! Host: ${nome}`);
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
          connRef.current.send(`Olá, host! Meu nome é ${nome}`);
        });
        connRef.current.on('data', (data) => {
          appendLog(`${data}`);
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
  return <Room roomId={roomId} onCopy={handleCopy} log={log} onSendMessage={handleSendMessage} name={name} />;
}

import React, { useRef, useState } from 'react';
import Peer from 'peerjs';
import './App.css';

export default function PeerDemo() {
  const [hostId, setHostId] = useState('');
  const [peerId, setPeerId] = useState('');
  const [log, setLog] = useState('');
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<any>(null);

  const appendLog = (msg: string) => setLog(l => l + '\n' + msg);

  const handleCreateHost = () => {
    peerRef.current = new Peer();
    appendLog('Criando sala...');
    peerRef.current.on('open', (id) => {
      setHostId(id);
      appendLog(`Sala criada! Compartilhe o Peer ID: ${id}`);
    });
    peerRef.current.on('connection', (connection) => {
      connRef.current = connection;
      appendLog('Jogador conectado!');
      connection.on('data', (data) => {
        appendLog(`Recebido do convidado: ${data}`);
      });
      connection.send('Bem-vindo à sala!');
    });
    peerRef.current.on('error', (err) => appendLog('Erro: ' + err));
  };

  const handleJoin = () => {
    if (!peerId.trim()) {
      appendLog('Insira o Peer ID do host.');
      return;
    }
    peerRef.current = new Peer();
    appendLog('Conectando ao host...');
    peerRef.current.on('open', () => {
      connRef.current = peerRef.current!.connect(peerId);
      connRef.current.on('open', () => {
        appendLog('Conectado ao host!');
        connRef.current.send('Olá, host!');
      });
      connRef.current.on('data', (data: any) => {
        appendLog(`Recebido do host: ${data}`);
      });
      connRef.current.on('error', (err: any) => appendLog('Erro na conexão: ' + err));
    });
    peerRef.current.on('error', (err) => appendLog('Erro: ' + err));
  };

  return (
    <div className="container">
      <h2>PeerJS Demo</h2>
      <div className="section">
        <button onClick={handleCreateHost}>Criar Sala</button>
        {hostId && <div className="peer-id">Seu Peer ID: {hostId}</div>}
      </div>
      <div className="section">
        <input
          type="text"
          value={peerId}
          onChange={e => setPeerId(e.target.value)}
          placeholder="Peer ID do host"
        />
        <button onClick={handleJoin}>Conectar</button>
      </div>
      <div className="section">
        <pre className="log" style={{ minHeight: 60 }}>{log}</pre>
      </div>
    </div>
  );
}

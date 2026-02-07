// peerjs-connection.js - Funções de conexão PeerJS

export function setupHost(logCallback, hostIdCallback) {
  const peer = new Peer();
  logCallback('Criando sala...');
  peer.on('open', (id) => {
    hostIdCallback(id);
    logCallback(`Sala criada! Compartilhe o Peer ID: ${id}`);
  });
  peer.on('connection', (connection) => {
    logCallback('Jogador conectado!');
    connection.on('data', (data) => {
      logCallback(`Recebido do convidado: ${data}`);
    });
    connection.send('Bem-vindo à sala!');
  });
  peer.on('error', (err) => logCallback('Erro: ' + err));
  return peer;
}

export function setupGuest(logCallback, hostId) {
  const peer = new Peer();
  logCallback('Conectando ao host...');
  peer.on('open', () => {
    const conn = peer.connect(hostId);
    conn.on('open', () => {
      logCallback('Conectado ao host!');
      conn.send('Olá, host!');
    });
    conn.on('data', (data) => {
      logCallback(`Recebido do host: ${data}`);
    });
    conn.on('error', (err) => logCallback('Erro na conexão: ' + err));
  });
  peer.on('error', (err) => logCallback('Erro: ' + err));
  return peer;
}

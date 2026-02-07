

// main.js - Lógica PeerJS unificada para navegador

const log = (msg) => {
  const el = document.getElementById('log');
  el.textContent += `\n${msg}`;
  el.scrollTop = el.scrollHeight;
};

let peer = null;
let conn = null;

document.getElementById('create-host').onclick = () => {
  peer = new Peer();
  log('Criando sala...');
  peer.on('open', (id) => {
    document.getElementById('host-id').style.display = 'block';
    document.getElementById('host-id').textContent = `Seu Peer ID: ${id}`;
    log(`Sala criada! Compartilhe o Peer ID: ${id}`);
  });
  peer.on('connection', (connection) => {
    conn = connection;
    log('Jogador conectado!');
    conn.on('data', (data) => {
      log(`Recebido do convidado: ${data}`);
    });
    conn.send('Bem-vindo à sala!');
  });
  peer.on('error', (err) => log('Erro: ' + err));
};

document.getElementById('join-btn').onclick = () => {
  const hostId = document.getElementById('join-id').value.trim();
  if (!hostId) {
    log('Insira o Peer ID do host.');
    return;
  }
  peer = new Peer();
  log('Conectando ao host...');
  peer.on('open', () => {
    conn = peer.connect(hostId);
    conn.on('open', () => {
      log('Conectado ao host!');
      conn.send('Olá, host!');
    });
    conn.on('data', (data) => {
      log(`Recebido do host: ${data}`);
    });
    conn.on('error', (err) => log('Erro na conexão: ' + err));
  });
  peer.on('error', (err) => log('Erro: ' + err));
};


// main.js - Lógica de interação com PeerJS separada

import { setupHost, setupGuest } from './peerjs-connection.js';

const log = (msg) => {
  const el = document.getElementById('log');
  el.textContent += `\n${msg}`;
  el.scrollTop = el.scrollHeight;
};

let peer = null;

document.getElementById('create-host').onclick = () => {
  peer = setupHost(log, (id) => {
    document.getElementById('host-id').style.display = 'block';
    document.getElementById('host-id').textContent = `Seu Peer ID: ${id}`;
  });
};

document.getElementById('join-btn').onclick = () => {
  const hostId = document.getElementById('join-id').value.trim();
  if (!hostId) {
    log('Insira o Peer ID do host.');
    return;
  }
  peer = setupGuest(log, hostId);
};

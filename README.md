# Projeto Truco P2P com PeerJS

Este projeto é um exemplo de estrutura para um jogo online P2P usando PeerJS e o servidor público de sinalização. Qualquer jogador pode criar uma sala (host) e compartilhar seu Peer ID para outros jogadores se conectarem, sem necessidade de configuração de rede avançada.

## Como funciona
- O host cria uma sala e recebe um Peer ID.
- Outros jogadores inserem esse Peer ID para se conectar ao host.
- Toda comunicação ocorre via WebRTC, sem necessidade de abrir portas no roteador.

## Tecnologias
- HTML, CSS, JavaScript
- PeerJS (via CDN)

## Como rodar
1. Abra o arquivo `index.html` em um navegador moderno.
2. Clique em "Criar Sala" para ser o host ou insira um Peer ID para conectar como convidado.
3. Compartilhe o Peer ID com outros jogadores.

## Observações
- O servidor público do PeerJS é usado apenas para sinalização inicial.
- Para produção, recomenda-se configurar um servidor PeerJS próprio.

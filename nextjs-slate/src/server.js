const WebSocket = require('ws');
const { setupWSConnection } = require('y-websocket/bin/utils');

const server = new WebSocket.Server({ port: 1234 });
server.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
});

console.log('WebSocket server running on ws://localhost:1234');
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

let ydoc;
let provider;

export function getYDoc(roomName) {
  if (!ydoc) {
    ydoc = new Y.Doc();
    provider = new WebsocketProvider(
      'ws://localhost:1234', // Replace with your WebSocket server URL
      roomName,
      ydoc
    );

    provider.on('status', ({ status }) => {
      console.log(`WebSocket connection status: ${status}`);
    });
  }
  return { ydoc, provider };
}

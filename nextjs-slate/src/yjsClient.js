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

    provider.on('message', (message) => {
      const msg = JSON.parse(message.data);
      if (msg.action === 'edit' && msg.update) {
        Y.applyUpdate(ydoc, new Uint8Array(msg.update));
      }
    });

    provider.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.action === 'documentOpened') {
        ydoc.getText('contents').insert(0, msg.contents);
      }
    };
  }

  const updateHandler = (update, origin) => {
    provider.ws.send(JSON.stringify({
      action: 'edit',
      update: Array.from(update),
    }));
  };
  ydoc.on('update', updateHandler);
  
  return { ydoc, provider };
}




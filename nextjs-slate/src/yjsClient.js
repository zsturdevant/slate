import * as Y from 'yjs';

let ydoc;
let ws;

export function getYDoc(roomName) {
  if (!ydoc) {
    ydoc = new Y.Doc();
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      ws.send(
        JSON.stringify({
          action: 'open',
          doc_name: roomName,
          author: 'client-author', // Replace with the actual author name
        })
      );
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log('Received message:', msg);

        if (msg.action === 'update' && msg.update) {
          const update = new Uint8Array(msg.update);
          Y.applyUpdate(ydoc, update);
        } else {
          console.warn('Unrecognized message format:', msg);
        }
      } catch (err) {
        console.error('Error processing message:', err);
      }
    };
  }

  const updateHandler = (update) => {
    const message = JSON.stringify({
      action: 'edit',
      update: Array.from(new Uint8Array(update)),
      author: 'client-author', // Replace with the actual author name
    });

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  };

  ydoc.on('update', updateHandler);

  return { ydoc, ws };
}





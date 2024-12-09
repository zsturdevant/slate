import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

let ydoc;
let provider;

export function getYDoc(roomName) {
  if (!ydoc) {
    // make a new document
    ydoc = new Y.Doc();

    // define where you are getting contents from (serevr ip)
    provider = new WebsocketProvider(
      'ws://localhost:8080', // Replace with your WebSocket server URL
      'example-room',
      ydoc
    );

    // log the connection status
    provider.on('status', ({ status }) => {
      console.log(`WebSocket connection status: ${status}`);
    });

    // when you get a message from provider
    provider.on('message', (message) => {
      // parse it
      console.log('Received message:', message.data);
      const msg = JSON.parse(message.data);
      // get the action and see if it is edit
      if (msg.action === 'edit' && msg.update) {
        // if so, implement the update that was sent if it exists
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

  const isValidJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  const updateHandler = (update, origin) => {
    const message = JSON.stringify({
      action: 'edit',
      update: Array.from(update),
    })
    console.log(isValidJSON(message), message)
    // if (!message.includes("<")) {
    //   provider.ws.send(message);
    // }
  };
  
  ydoc.on('update', updateHandler);
  
  return { ydoc, provider };
}




import * as Y from 'yjs';

let ydoc;
let document_id = -1;
let ws;

// this has to be here or else the clients try and send everything 
// that they recieve from the server back to the server 
// and everything explodes.
let last_update_recieved;

export function getYDoc() {
  if (!ydoc) {
    ydoc = new Y.Doc();
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      ws.send(
        JSON.stringify({
          action: 'open',
          doc_name: "untitled" // change this to reflect the title
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
          last_update_recieved = update;
          Y.applyUpdate(ydoc, update);
        } else if (msg.action === 'documentOpened') {
            const { doc_id, title, contents } = msg;
            document_id = doc_id;
          
            const yText = ydoc.getText('shared-text'); //instead of 'contents' ?
            yText.delete(0, yText.length); // Clear existing content
            yText.insert(0, contents); // Insert new content
      
          // const { doc_id, title, contents } = msg;
          // // when the document opens, we want to retrieve the contents
          // // and trigger an update?
          // document_id = doc_id;
          // const yText = ydoc.getText('contents'); 
          // yText.insert(0,contents);
            console.log('Document initiliazed with server contents:', contents);
        } else {
          console.warn('Unrecognized message format:', msg);
        }
      } catch (err) {
        console.error('Error processing message:', err);
      }
    };
  };

  const updateHandler = (update) => {
    const next_update = new Uint8Array(update)
    if (last_update_recieved == next_update) {
      console.log('stopped some bullshit');
    } else {
      console.log('Local update triggered:', Array.from(new Uint8Array(update)));
      const message = JSON.stringify({
        action: 'edit',
        doc_name: 'untitled', // replace with actual document name
        doc_id: document_id,
        update: Array.from(new Uint8Array(update)), // Ensure this format is consistent
      });
    
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
    
  };

  ydoc.on('update', updateHandler);

  return { ydoc, ws };
}

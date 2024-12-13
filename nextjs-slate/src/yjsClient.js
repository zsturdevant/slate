import * as Y from 'yjs';

let ydoc;
let document_id = -1;
let ws;

// this has to be here or else the clients try and send everything 
// that they recieve from the server back to the server 
// and everything explodes.
let last_update_recieved;

export function getYDoc(docname) {
  if (!ydoc) {
    ydoc = new Y.Doc();
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      ws.send(
        JSON.stringify({
          action: 'open',
          doc_name: docname
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
          document_id = msg.doc_id
          const update = new Uint8Array(msg.update);
          last_update_recieved = update;
          Y.applyUpdate(ydoc, update);
          document_id = msg.doc_id;
      
        } else if (msg.action === 'rename') {
          handleRenameNotification(msg.old_name, msg.new_name);
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
      // console.log('Local update triggered:', Array.from(new Uint8Array(update)));
      Y.logUpdate(next_update);

      const message = JSON.stringify({
        action: 'edit',
        doc_name: docname, // replace with actual document name
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

export function renameDocument(newTitle) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error('WebSocket is not open. Cannot rename document.');
    return;
  }

  const message = JSON.stringify({
    action: 'rename',
    doc_name: ydoc.getText('title').toString(), // Get current document name
    doc_id: document_id,
    new_title: newTitle, // New title to be set
  });

  ws.send(message);
  console.log(`Rename request sent: ${newTitle}`);
}

export function getDocList() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://localhost:8080');
    let docs = [];

    ws.onopen = () => {
      console.log('WebSocket connection established');
      ws.send(
        JSON.stringify({
          action: 'list_files',
        })
      );
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      reject(error);  // Reject the promise if there's an error
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log('Received message:', msg);

        if (msg.action === 'doc_list' && msg.update) {
          // Ensure msg.update is an array or plain object
          docs = Array.isArray(msg.update) ? msg.update : Object.values(msg.update);
          resolve(docs);  // Resolve the promise with docs
        } else {
          console.warn('Unrecognized message format:', msg);
        }
      } catch (err) {
        console.error('Error processing message:', err);
        reject(err);  // Reject the promise in case of an error
      }
    };
  });
}



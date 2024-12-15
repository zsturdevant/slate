import * as Y from 'yjs';

let ydoc;
let document_id = -1;
let ws;

export function getYDoc(docname) {

  // Reset Yjs document and WebSocket connection when opening a new document
  if (ydoc) {
    ydoc.destroy();
    ydoc = null;
  }
  
  ydoc = new Y.Doc();

  // Close any existing WebSocket connection      
  if (ws) {
    ws.close(); 
    ws = null;
  }

  ws = new WebSocket('ws://localhost:8080');
  /* where we change address to server IP address
    const ws = new WebSocket('wss://3.14.217.132:8080');
  */

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

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      console.log('Received message:', msg);

      if (msg.action === 'update' && msg.update) {
        const update = new Uint8Array(msg.update);
        Y.applyUpdate(ydoc, update);
          
      } else if (msg.action === 'documentOpened') {
        document_id = msg.doc_id
        const update = new Uint8Array(msg.update);
        Y.applyUpdate(ydoc, update);

        // update the shared title with the title provided by the server
        const sharedTitle = ydoc.getText('shared-title');
        sharedTitle.delete(0, sharedTitle.length);
        sharedTitle.insert(0, msg.title || 'Untitled');
      } else {
        console.warn('Unrecognized message format:', msg);
      }
    } catch (err) {
        console.error('Error processing message:', err);
    }
  };

  const updateHandler = (update) => {
    const message = JSON.stringify({
      action: 'edit',
      doc_name: docname,
      doc_id: document_id,
      update: Array.from(new Uint8Array(update)), // Ensure this format is consistent
    });

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  };

  ydoc.on('update', updateHandler);

  return { ydoc, ws , document_id };
}

export function renameDocument(newTitle) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error('WebSocket is not open. Cannot rename document.');
    return;
  }

  const message = JSON.stringify({
    action: 'rename',
    doc_name: newTitle,
    doc_id: document_id,
    new_title: newTitle,
  });

  ws.send(message);
  console.log(`Rename request sent: ${newTitle}`);
}

export function getDocList() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://localhost:8080');
    /* where we change address to server IP address
    const ws = new WebSocket('wss://3.14.217.132:8080');
    */

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

// delete a document
export function deleteDocument(docname) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    const ws = new WebSocket('ws://localhost:8080');
    /* where we change address to server IP address
    const ws = new WebSocket('wss://3.14.217.132:8080');
    */

    ws.onopen = () => {
      console.log('WebSocket connection established');
      ws.send(
        JSON.stringify({
          action: 'delete_file',
          doc_name: docname,
        })
      );
    };
  } 
  
  else {
    const message = JSON.stringify({
      action: 'delete_file',
      doc_name: docname,
    });
  
    ws.send(message);
    console.log(`Delete request sent for "${docname}"`);
  }
}



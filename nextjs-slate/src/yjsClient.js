import * as Y from 'yjs';

let ydoc;
let document_id = -1;
let ws;

// this has to be here or else the clients try and send everything 
// that they recieve from the server back to the server 
// and everything explodes.
let last_update_recieved;

export function getYDoc(docname) {

  // Reset Yjs document and WebSocket connection when opening a new document
  if (ydoc) {
    ydoc.destroy(); // Clean up the previous Yjs document
    ydoc = null;
  }
  
  ydoc = new Y.Doc();

  // Close any existing WebSocket connection      
  if (ws) {
    ws.close(); 
    ws = null;
  }

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
    const next_update = new Uint8Array(update)
    if (last_update_recieved == next_update) {
      console.log('stopped some bullshit');
    } else {
        Y.logUpdate(next_update);

        const message = JSON.stringify({
          action: 'edit',
          doc_name: docname,
          doc_id: document_id,
          update: Array.from(new Uint8Array(update)), // Ensure this format is consistent
        });
    
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
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
    //doc_name: ydoc.getText('shared-title').toString(), // Get current document name
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

export function deleteDocument(docname) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error('WebSocket is not open. Cannot delete document.');
    return;
  }

  const message = JSON.stringify({
    action: 'delete_file',
    doc_name: docname, // Send the document name to delete
  });

  ws.send(message);
  console.log(`Delete request sent for "${docname}"`);
}



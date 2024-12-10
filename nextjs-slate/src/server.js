const WebSocket = require('ws');
const fs = require('fs');
const Y = require('yjs');
const path = require('path');

class Document {
  constructor(author, path, doc_name = 'Untitled') {
    this.yDoc = new Y.Doc();
    this.doc_name = this.yDoc.getText('title');
    this.doc_name.insert(0, doc_name);
    this.contents = this.yDoc.getText('contents');
    this.author_list = [author];
    this.path = path;
  }

  // Method to save the document (contents and title) to the filesystem
  save() {
    const contents = this.contents.toString();
    const title = this.doc_name.toString();

    try {
      const filePath = path.join(this.path, `${title}.json`);
      fs.writeFileSync(filePath, JSON.stringify({ title, contents }), 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving the file:', error);
      return false;
    }
  }

  // Method to apply updates received from clients
  applyUpdate(update) {
    Y.applyUpdate(this.yDoc, update);
  }

  // Method to rename the document
  name_file(new_name) {
    this.doc_name.delete(0, this.doc_name.length);
    this.doc_name.insert(0, new_name); 
  }
}

class FileCabinet {
  constructor(doc_path) {
    this.doc_path = doc_path;
    this.document_list = [];
    this.open_docs = new Map();

    // read the contents of the directory
    try {
      this.document_list = fs.readdirSync(doc_path);
    } catch (err) {
      console.error('Error reading directory:', err);
    }
  }

  // open the file if it is not already open, create a new file if it does not already exist 
  open_file(author, doc_name) {
    if (this.open_docs.has(doc_name)) {
      return this.open_docs.get(doc_name);
    }

    const file_index = this.document_list.indexOf(doc_name);

    // Create a new document if it doesn't exist
    if (file_index === -1) {
      const doc = new Document(author, this.doc_path, doc_name);
      this.document_list.push(doc_name);
      this.open_docs.set(doc_name, doc);
      return doc;

    // Load the existing document
    } else {
      const doc = new Document(author, this.doc_path, doc_name);
      try {
        const data = fs.readFileSync(path.join(this.doc_path, `${doc_name}.json`), 'utf8');
        const parsedData = JSON.parse(data);

        doc.doc_name.insert(0, parsedData.title);
        doc.contents.insert(0, parsedData.contents);

        return doc;
      } catch (error) {
        console.error('Error loading document:', error);
        return null;
      }
    }
  }

  // delete an unwanted file
  delete_file(doc) {
    const file_index = this.document_list.indexOf(doc.doc_name.toString());

    // Delete the document from open docs map and the list
    if (file_index !== -1) {
      this.document_list.splice(file_index, 1);
      this.open_docs.delete(doc.doc_name.toString());
  
      // delete the actual file from disk
      try {
        fs.unlinkSync(path.join(this.doc_path, `${doc.doc_name}.json`));
        console.log(`Document ${doc.doc_name} deleted successfully.`);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  }

  // Update the name of the document
  rename_doc(doc, new_name) {
    const old_name = doc.doc_name.toString();
    doc.name_file(new_name); 

    const file_index = this.document_list.indexOf(old_name);
    if (file_index !== -1) {
      this.document_list[file_index] = new_name;
    }
  }
}

// Set up the WebSocket server and the file
const wss = new WebSocket.Server({ port: 8080 });
const fileCabinet = new FileCabinet('./documents/');

// Keeps track of which clients are editing which documents
const documentEditors = {}; 

const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

wss.on('connection', (ws) => {
  let currentDocName = null;

  // Handle incoming messages from clients
  ws.on('message', (message) => {
    try {
      // failing here
      console.log(isValidJSON(message), message)
      const msg = JSON.parse(message);
      const { action, doc_name, author, update } = msg;

      if (action === 'open') {
        // Open a document for editing
        const doc = fileCabinet.open_file(author, doc_name);
        currentDocName = doc_name;

        // Add this client to the list of editors for the document
        if (!documentEditors[doc_name]) {
          documentEditors[doc_name] = new Set();
        }
        documentEditors[doc_name].add(ws);

        // Send initial document content to the client
        ws.send(JSON.stringify({
          action: 'documentOpened',
          title: doc.doc_name.toString(),
          contents: doc.contents.toString()
        }));

      } else if (action === 'edit' && currentDocName) {
        // Apply the update to the document
        const doc = fileCabinet.open_file(author, currentDocName);
        doc.applyUpdate(update);  // Apply the Yjs update to the document

        // Forward the update only to clients editing the same document
        if (documentEditors[currentDocName]) {
          documentEditors[currentDocName].forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ action: 'update', update, doc_name: currentDocName }));
            }
          });
        }
      }

    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    // Handle disconnection
    if (currentDocName && documentEditors[currentDocName]) {
      documentEditors[currentDocName].delete(ws);

      // If no one is editing the document, we can potentially save the document here
      if (documentEditors[currentDocName].size === 0) {
        const doc = fileCabinet.open_file(null, currentDocName);
        doc.save();
      }
    }
    console.log('Client disconnected');
  });
});

console.log('Server listening on port 8080');

// const { setupWSConnection } = require('y-websocket/bin/utils');

// const server = new WebSocket.Server({ port: 1234 });
// server.on('connection', (conn, req) => {
//   setupWSConnection(conn, req);
// });

// console.log('WebSocket server running on ws://localhost:1234');
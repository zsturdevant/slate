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
    console.log('Initialized document with contents:', this.contents.toString());
    this.author_list = [author];
    this.path = path;
  }

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

  // function for applying an update to the 
  applyUpdate(update) {
    try {
      const updateArray = new Uint8Array(update);
      Y.applyUpdate(this.yDoc, updateArray);

      // start debugging stuff
      console.log('Document contents after update:', this.yDoc.getText('contents').toString());
      this.save();
      // end debugging stuff

    } catch (error) {
      console.error('Error applying update:', error);
    }
  }

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

    try {
      this.document_list = fs.readdirSync(doc_path);
    } catch (err) {
      console.error('Error reading directory:', err);
    }
  }

  open_file(author, doc_name) {
    if (this.open_docs.has(doc_name)) {
      return this.open_docs.get(doc_name);
    }

    const file_index = this.document_list.indexOf(`${doc_name}.json`);

    if (file_index === -1) {
      const doc = new Document(author, this.doc_path, doc_name);
      this.document_list.push(`${doc_name}.json`);
      this.open_docs.set(doc_name, doc);
      return doc;
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
}

const wss = new WebSocket.Server({ port: 8080 });
const fileCabinet = new FileCabinet('./documents/');

const documentEditors = {};

wss.on('connection', (ws) => {
  let currentDocName = null;

  ws.on('message', (message) => {
    console.log('Message received from client:', message);
    try {
      const msg = JSON.parse(message);
      const { action, doc_name, author, update } = msg;

      if (action === 'join') {
        console.log(`Client joined room: ${doc_name}`);
      } else if (action === 'open') {
        const doc = fileCabinet.open_file(author, doc_name);
        currentDocName = doc_name;

        if (!documentEditors[doc_name]) {
          documentEditors[doc_name] = new Set();
        }
        documentEditors[doc_name].add(ws);

        ws.send(
          JSON.stringify({
            action: 'documentOpened',
            title: doc.doc_name.toString(),
            contents: doc.contents.toString(),
          })
        );
      } else if (action === 'edit' && currentDocName) {
        const doc = fileCabinet.open_file(author, currentDocName);
        doc.applyUpdate(update);

        if (documentEditors[currentDocName]) {
          documentEditors[currentDocName].forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({ action: 'update', update, doc_name: currentDocName })
              );
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    if (currentDocName) {
      console.log(`Checking editors for document: ${currentDocName}`);
      const editors = documentEditors[currentDocName];
  
      if (editors) {
        editors.delete(ws);
        console.log(`Remaining editors for ${currentDocName}:`, editors.size);
  
        // Save the document if no editors are left
        if (editors.size === 0) {
          console.log(`No editors left for ${currentDocName}. Saving document.`);
          const doc = fileCabinet.open_file(null, currentDocName);
          if (doc && doc.save()) {
            console.log(`Document "${currentDocName}" saved successfully.`);
          } else {
            console.error(`Failed to save document: ${currentDocName}`);
          }
        }
      }
    }
  });

});

console.log('Server listening on port 8080');

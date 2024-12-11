const WebSocket = require('ws');
const fs = require('fs');
const Y = require('yjs');
const path = require('path');

class Document {

  
  constructor(author, path, doc_name = 'Untitled') {
    this.yDoc = new Y.Doc(); // Initialize Yjs document
    this.doc_name = this.yDoc.getText('title'); // Initialize the title (Y.Text object)
    
    // Set the document title (inserts it at the start)
    this.doc_name.insert(0, doc_name);
    
    // Initialize contents as Y.Text (empty at the beginning)
    this.contents = this.yDoc.getText('contents'); 
    
    // Log the current contents (will be empty initially)
    console.log('Initialized document with title:', this.doc_name.toString());
    console.log('Initialized document with contents:', this.contents.toString());

    // Initialize author list and path for saving the document
    this.author_list = [author];
    this.path = path;
    // this.yDoc = new Y.Doc();
    // this.doc_name = this.yDoc.getText('title');
    // this.doc_name.insert(0, doc_name);
    // this.contents = this.yDoc.getText('contents');
    // console.log('Initialized document with contents:', this.contents.toString());
    // this.author_list = [author];
    // this.path = path;
  }

  save() {
    const contents = this.yDoc.getText('contents');
    // const title = this.yDoc.getText('title').toString(); // i think we should be doing this eventually
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

      let updateArray;

      if (typeof update === 'object' && !Array.isArray(update)) {
        // Convert the object back into a Uint8Array
        updateArray = new Uint8Array(Object.values(update));
      } else {
        // Otherwise, assume it's already a Uint8Array
        updateArray = new Uint8Array(update);
      }

      console.log('Received update action:', update);

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
  
    const filePath = path.join(this.doc_path, `${doc_name}.json`);
    
    if (fs.existsSync(filePath)) {
      // If the document exists, load it from disk
      const doc = new Document(author, this.doc_path, doc_name);
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(data);
  
        doc.doc_name.insert(0, parsedData.title);
        doc.contents.insert(0, parsedData.contents);
        
        //store the document in the open_docs
        this.open_docs.set(doc_name, doc);  
        return doc;
      } catch (error) {
        console.error('Error loading document:', error);
        return null;
      }
    } else {
      // If the document doesn't exist, create a new one
      const doc = new Document(author, this.doc_path, doc_name);
      this.document_list.push(`${doc_name}.json`);
      this.open_docs.set(doc_name, doc);
      return doc;
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
      // } else if (action === 'edit' && currentDocName) {
      } else if (action === 'edit') {
        const doc = fileCabinet.open_file(author, doc_name);
        doc.applyUpdate(update);

        // if (documentEditors[currentDocName]) {
        if (documentEditors[doc_name]) {

          // documentEditors[currentDocName].forEach((client) => {
          documentEditors[doc_name].forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({ action: 'update', update, doc_name: doc_name })
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

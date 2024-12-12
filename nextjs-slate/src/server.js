const WebSocket = require('ws');
const fs = require('fs');
const Y = require('yjs');
const path = require('path');

class Document {
  constructor(path, doc_id, document_name) {
    this.yDoc = new Y.Doc(); // Initialize Yjs document
    this.doc_name = this.yDoc.getText('title');
    this.name_file(document_name);

    // Unique doc id
    this.doc_id = doc_id;
  
    // Initialize contents as Y.Text (empty at the beginning)
    this.contents = this.yDoc.getText('shared-text'); 
  
    // Log the current contents (will be empty initially)
    console.log('Initialized document with title:', this.doc_name.toString());
    console.log('Initialized document with contents:', this.contents.toString());
  
    // Initialize author list and path for saving the document
    this.path = path;
  }

  // get the doc id
  get_doc_name() {
    return this.doc_name.toString();
  }

  // get the doc id
  get_doc_id() {
    return this.doc_id;
  }

  // save the document if we want to
  save() {
    const contents = this.contents.toString(); // Convert to string
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

  // Apply update to Y.Doc and to other connected clients
  update_doc(update) {
    try {
      // Convert update to Uint8Array if needed
      const updateArray =
        update instanceof Uint8Array
          ? update
          : new Uint8Array(Object.values(update));
  
      //this.yDoc
      Y.logUpdate(updateArray);
  
      // Apply the update to the Y.Doc
      Y.applyUpdate(this.yDoc, updateArray);
  
      // Log the updated contents for debugging
      console.log('Document contents after update:', this.yDoc.getText('shared-text').toString());
  
      // Save the document after applying the update
      // this.save();
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
    this.open_docs = new Map(); // Map<doc_id, Document>
    this.doc_name_to_id = new Map(); //Map<doc_name, doc_id>
    this.next_id = 0;

    try {
      this.document_list = fs.readdirSync(doc_path);
    } catch (err) {
      console.error('Error reading directory:', err);
    }
  }

  // Open or create a document by its name
  open_file(doc_name) {
    const filePath = path.join(this.doc_path, `${doc_name}.json`);
    let doc_id;
    
    // if this is an existing document that is currrently open
    if (this.doc_name_to_id.has(doc_name)) {
      doc_id = this.doc_name_to_id.get(doc_name);
      return this.open_docs.get(doc_id); // return the existing document instance
    }

    // open existing document from disk or create a new one
    const doc = new Document(this.doc_path, toString(this.next_id), doc_name);

    doc_id = toString(this.next_id);
    this.next_id += 1;

    // if this doc has been accessed before but is not currently open
    if (fs.existsSync(filePath)) {

      try {
        const data = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(data);
  
        doc.name_file(parsedData.title);
        doc.contents.insert(0, parsedData.contents);
        
        //store the document in the open_docs
        this.doc_name_to_id.set(doc.get_doc_name(), doc.get_doc_id());
        this.open_docs.set(doc.get_doc_id(), doc);  
        return doc;

      } catch (error) {
        console.error('Error loading document:', error);
      }

    // this is a new doc that has never been opened
    } else {
      doc.save() // save new document to disk
      this.doc_name_to_id.set(doc.get_doc_name(), doc.get_doc_id());
      this.open_docs.set(doc.get_doc_id(), doc);
      return doc;
    }
  }

  // opens a file if it exists, if it does not opens a new file
  get_open_file(doc_name, doc_id) {
    if (this.open_docs.has(doc_id)) {
      return this.open_docs.get(doc_id);
    } else {
      return this.open_file(doc_name);
    }
  }

  get_connected_clients(doc_id) {
    return documentEditors[doc_id];
  }

  // broadcast update to connected clients
  broadcast_update(ws, doc, update) {
    const clients = this.get_connected_clients(doc.get_doc_id());
    if (clients) {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
        // if (client.readyState === WebSocket.OPEN && client != ws) {
          client.send(
            JSON.stringify({
              action: 'update',
              update: Array.from(update), // Ensure the update is sent properly
              doc_id: this.doc_id,
            })
          );
        }
      });
    } else {
      console.warn('No connected clients found for document:', this.doc_id);
    }
  }
}

const wss = new WebSocket.Server({ port: 8080 });
const fileCabinet = new FileCabinet('./documents/');

const documentEditors = {};

wss.on('connection', (ws) => {
  let current_doc_id = null;

  ws.on('message', (message) => {
    console.log('Message received from client:', message);
    try {
      const msg = JSON.parse(message);
      const { action, doc_name, doc_id, update } = msg;

      if (action === 'open') {

        const doc = fileCabinet.open_file(doc_name);
        current_doc_id = doc.get_doc_id();
        con
        console.log('Current doc_id:', current_doc_id);

        if (!documentEditors[current_doc_id]) {
          documentEditors[current_doc_id] = new Set();
        }
        documentEditors[current_doc_id].add(ws);

        ws.send(
          JSON.stringify({
            action: 'documentOpened',
            doc_id: current_doc_id,
            title: doc.doc_name.toString(),
            contents: doc.contents.toString(),
          })
        );
      } else if (action === 'edit') {
        const doc = fileCabinet.get_open_file(doc_name, doc_id);
        if (doc) {
          doc.update_doc(update);
          fileCabinet.broadcast_update(ws, doc, update);
        } else {
          console.warn(`Document with ID ${doc_id} not found`);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    if (current_doc_id) {
      console.log(`Checking editors for document: ${current_doc_id}`);
      const editors = documentEditors[current_doc_id];
  
      if (editors) {
        editors.delete(ws);
        console.log(`Remaining editors for ${current_doc_id}:`, editors.size);
  
        // Save the document if no editors are left
        if (editors.size === 0) {
          console.log(`No editors left for ${current_doc_id}. Saving document.`);
          const doc = fileCabinet.open_docs.get(current_doc_id);
          if (doc) {
            doc.save();
            console.log(`Document "${doc.doc_name}" saved successfully.`);
          }
        }
      }
    }
  });
});

console.log('Server listening on port 8080');

const WebSocket = require('ws');
const fs = require('fs');
const Y = require('yjs');
const path = require('path');

// File for storing metrics
const metricsPath = path.join(__dirname, 'metrics.json');

// Utility to log metrics
function log_metrics(action, docName, latency, docSize = null) {
  const metrics = fs.existsSync(metricsPath)
    ? JSON.parse(fs.readFileSync(metricsPath, 'utf-8'))
    : [];

  // Add a new metric entry
  metrics.push({ action, docName, latency, docSize, timestamp: Date.now() });

  // Write back the updated metrics
  fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2), 'utf-8');
}

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
  
    // Initialize author list and path for saving the document
    this.path = path;
  }

  // deletes the file associated with the doc
  delete() {
    const title = this.doc_name.toString();
    const filePath = path.join(this.path, `${title}.json`);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return;
      }
      console.log('File deleted successfully.');
    });
  }

  // get the doc name
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

  // Apply update to Y.Doc
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
      
      // tracking document size
      const size = this.contents.toString().length;
      console.log(`Document size after update: ${size} characters`);
  
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

  rename_doc(new_title) {
    try {
      const old_title = this.doc_name.toString();
      this.name_file(new_title); // Update the title in Y.Text
  
      // Rename the file on disk
      const oldFilePath = path.join(this.path, `${old_title}.json`);
      const newFilePath = path.join(this.path, `${new_title}.json`);
  
      if (fs.existsSync(oldFilePath)) {
        fs.renameSync(oldFilePath, newFilePath);
      }
  
      console.log(`Document renamed from "${old_title}" to "${new_title}"`);
      // save the document with the new title
      this.save();
    } catch (error) {
      console.error('Error renaming document:', error);
    }
  }
}


class FileCabinet {
  constructor(doc_path) {
    this.doc_path = doc_path;
    this.open_docs = new Map(); // Map<doc_id, Document>
    this.doc_name_to_id = new Map(); //Map<doc_name, doc_id>
    this.next_id = 0;
  }

  // deletes a file from the server
  delete_doc(doc){
    this.open_docs.delete(doc.doc_id);
    this.doc_name_to_id.delete(doc.doc_name);
    doc.delete();
  }

  // a method for getting a list of all the documents 
  get_docs() {
    try {
      const doc_list = fs.readdirSync(this.doc_path);
      return doc_list;
    } catch (err) {
      console.error('Error reading directory:', err);
      return [];
    }
  }

  open_file(doc_name) {
    console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nThis is the docname from open_file on server: ", doc_name);
    const filePath = path.join(this.doc_path, `${doc_name}.json`);
    let doc_id;
    
    // check if this document name already exists
    if (this.doc_name_to_id.has(doc_name)) {
      doc_id = this.doc_name_to_id.get(doc_name);
      return this.open_docs.get(doc_id); // return the existing document instance
    }

    // create a new document if no file exists
    const doc = new Document(this.doc_path, this.next_id.toString(), doc_name);

    doc.doc_id = this.next_id.toString();
    console.log('current doc number:', doc.doc_id);
    this.next_id = this.next_id + 1;
    console.log('Next doc number:', this.next_id.toString());
    

    // if this doc has been accessed before but is not currently open
    if (fs.existsSync(filePath)) {
      // load existing document from disk
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(data);
  
        doc.name_file(parsedData.title);
        doc.contents.insert(0, parsedData.contents);
        console.log('Load existing document:', parsedData.title);
        //console.log('Initialized document with contents:', doc.contents.toString());
        
        //store the document in the open_docs
        //this.doc_name_to_id.set(doc.get_doc_name(), doc.get_doc_id());
        //this.open_docs.set(doc.get_doc_id(), doc);  
        //return doc;
      } catch (error) {
        console.error('Error loading document:', error);
      }
    } else {
      // save new document to disk
      doc.save();
      console.log('Created new document:', doc_name);
    }
    /* this is a new doc that has never been opened
    } else {
      doc.save() // save new document to disk
      this.doc_name_to_id.set(doc.get_doc_name(), doc.get_doc_id());
      this.open_docs.set(doc.get_doc_id(), doc);
      return doc;
    }
      */
    
    // register the document in the mpapings
    this.doc_name_to_id.set(doc.get_doc_name(), doc.get_doc_id());
    this.open_docs.set(doc.get_doc_id(), doc);
    return doc;
  }

  // opens a file if it exists, if it does not opens a new file
  get_open_file(doc_name, doc_id) {
    if (this.open_docs.has(doc_id)) {
      return this.open_docs.get(doc_id);
    } else {
      return this.open_file(doc_name);
    }
  }

  rename_document(doc_id, new_name) {
    const doc = this.open_docs.get(doc_id);
    if (!doc) {
      console.warn(`Document with ID ${doc_id} not found`);
      return;
    }
  
    const old_name = doc.get_doc_name();
    doc.rename_doc(new_name);
  
    // Update mappings
    this.doc_name_to_id.delete(old_name);
    this.doc_name_to_id.set(new_name, doc_id);

    console.log(`Updated mappings for renamed document: ${old_name} -> ${new_name}`);
  }
  

  // find all the clients that are connected
  get_connected_clients(doc_id) {
    return documentEditors[doc_id];
  }

  // broadcast update to connected clients
  broadcast_update(ws, doc, update) {
    const clients = this.get_connected_clients(doc.get_doc_id());
    if (clients) {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client != ws) {
          client.send(
            JSON.stringify({
              action: 'update',
              update: Array.from(update),
              doc_id: this.doc_id,
            })
          );
        }
      });
    } else {
      console.warn('No connected clients found for document:', this.doc_id);
    }
  }

  // broadcast update to connected clients
  broadcast_rename(ws, doc, new_title) {
    const clients = this.get_connected_clients(doc.get_doc_id());
    if (clients) {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client != ws) {
          client.send(
            JSON.stringify({
              action: 'rename',
              old_name: doc_name,
              new_name: new_title,
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
    const startTime = Date.now(); // start timer for latency
    
    try {
      const msg = JSON.parse(message);
      const { action, doc_name, doc_id, new_title, update } = msg;

      // open a documents and send its contents to the client
      if (action === 'open') {
        const startTime = Date.now(); 
        const doc = fileCabinet.open_file(doc_name);
        current_doc_id = doc.get_doc_id();
        
        console.log('Current doc_id:', current_doc_id);

        if (!documentEditors[current_doc_id]) {
          documentEditors[current_doc_id] = new Set();
        }
        documentEditors[current_doc_id].add(ws);

        const update = Y.encodeStateAsUpdate(doc.yDoc); // Encode the full state of the document
        ws.send(
          JSON.stringify({
            action: 'documentOpened',
            update: Array.from(update), // Convert Uint8Array to an Array
            doc_id: current_doc_id,     // Include document identifier
            title: doc.get_doc_name(),  // include document title
          }),
          () => {
            const latency = Date.now() - startTime; // Measure latency
            log_metrics('open', doc_name, latency);
            console.log(`Latency for 'open' action: ${latency} ms`);
          }
        );
      } else if (action === 'edit') {
        const startTime = Date.now(); 
        const doc = fileCabinet.get_open_file(doc_name, doc_id);
        
        if (doc) {
          doc.update_doc(update);
          fileCabinet.broadcast_update(ws, doc, update);

          const docSize = doc.contents.toString().length; // Get document size
          ws.send(
            JSON.stringify({ action: 'ack', doc_name }),
            () => {
              const latency = Date.now() - startTime; // Measure latency
              log_metrics('edit', doc_name, latency, docSize); // Log latency & size
              console.log(`Latency for 'edit' action: ${latency} ms, size: ${docSize}`);
            }
          );
        } else {
          console.warn(`Document with ID ${doc_id} not found`);
        }
      } else if (action === 'delete_file') {
        const startTime = Date.now();
        const doc = fileCabinet.get_open_file(doc_name, doc_id);
      
        if (doc) {
          fileCabinet.delete_doc(doc); // Delete document
      
          // Notify connected clients
          const clients = documentEditors[doc_id];
          if (clients) {
            clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ action: 'delete', doc_id, doc_name }));
              }
            });
          }

        console.log(`Document "${doc_name}" deleted successfully.`);

        const latency = Date.now() - startTime; // Measure latency
        log_metrics('delete_file', doc_name, latency); // Log latency
        console.log(`Latency for 'delete_file' action: ${latency} ms`);
        } else {
          console.warn(`Document with ID ${doc_id} not found for deletion.`);
        }
      } else if (action === 'rename') {
        const startTime = Date.now();
        const doc = fileCabinet.get_open_file(doc_name, doc_id);

        if (doc) {
          fileCabinet.rename_document(doc_id, new_title);
          fileCabinet.broadcast_rename(ws, doc, new_title);

          const latency = Date.now() - startTime; // Measure latency
          log_metrics('rename', doc_name, latency); // Log latency
          console.log(`Latency for 'rename' action: ${latency} ms`);
        } else {
          console.warn(`Document with ID ${doc_id} not found for renaming.`);
        }
      } else if (action === 'list_files') {
        const docs = fileCabinet.get_docs();
        let new_docs = [];
        for (let filename of docs) {
          filename = filename.slice(0, filename.length - 5);
          new_docs.push(filename);
        }
        if (docs) {
          ws.send(
            JSON.stringify({
              action: 'doc_list',
              update: Array.from(new_docs),
            })
          );
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

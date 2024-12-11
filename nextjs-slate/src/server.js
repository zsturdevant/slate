const WebSocket = require('ws');
const fs = require('fs');
const Y = require('yjs');
const path = require('path');

// class Document {

  
//   // constructor(author, path, doc_id, doc_name = 'Untitled') {
//   constructor(path, doc_id, doc_name = 'Untitled') {
//     this.yDoc = new Y.Doc(); // Initialize Yjs document
//     this.doc_name = this.yDoc.getText('title'); // Initialize the title (Y.Text object)
  
//     // Unique doc id
//     this.doc_id = doc_id;
    
//     // Set the document title (only insert the name once)
//     if (this.doc_name.length === 0) {
//       this.doc_name.insert(0, doc_name); // Set the title only if it's not already set
//     }
  
//     // Initialize contents as Y.Text (empty at the beginning)
//     this.contents = this.yDoc.getText('shared-text'); 
  
//     // Log the current contents (will be empty initially)
//     console.log('Initialized document with title:', this.doc_name.toString());
//     console.log('Initialized document with contents:', this.contents.toString());
  
//     // Initialize author list and path for saving the document
//     this.path = path;
//   }

//   // get the doc id
//   get_doc_id() {
//     return this.doc_id;
//   }

//   save() {
//     const contents = this.contents.toString(); // Convert to string
//     const title = this.doc_name.toString();
  
//     try {
//       const filePath = path.join(this.path, `${title}.json`);
//       fs.writeFileSync(filePath, JSON.stringify({ title, contents }), 'utf8');
//       return true;
//     } catch (error) {
//       console.error('Error saving the file:', error);
//       return false;
//     }
//   }

//   update_doc(update) {
//     try {
//       // Convert update to Uint8Array if needed
//       const updateArray =
//         update instanceof Uint8Array
//           ? update
//           : new Uint8Array(Object.values(update));
  
//       console.log('Received update action:', updateArray);
//       this.yDoc
//       Y.logUpdate(updateArray);
  
//       // Apply the update to the Y.Doc
//       Y.applyUpdate(this.yDoc, updateArray);
  
//       // Log the updated contents for debugging
//       console.log('Document contents after update:', this.contents.toString());
  
//       // Save the document after applying the update
//       this.save();
//     } catch (error) {
//       console.error('Error applying update:', error);
//     }
//   }

//   name_file(new_name) {
//     this.doc_name.delete(0, this.doc_name.length);
//     this.doc_name.insert(0, new_name);
//   }
// }

class Document {
  constructor(path, doc_id, doc_name = 'Untitled') {
    this.yDoc = new Y.Doc(); // Initialize Yjs document
    this.doc_name = this.yDoc.getText('title'); // Initialize the title (Y.Text object)

    // Unique doc id
    this.doc_id = doc_id;
    
    // Set the document title (only insert the name once if it's empty)
    if (this.doc_name.toString().length === 0) {
      this.doc_name.insert(0, doc_name); // Set the title only if it's not already set
    }
  
    // Initialize contents as Y.Text (empty at the beginning)
    this.contents = this.yDoc.getText('shared-text'); 
  
    // Log the current contents (will be empty initially)
    console.log('Initialized document with title:', this.doc_name.toString());
    console.log('Initialized document with contents:', this.contents.toString());
  
    // Initialize author list and path for saving the document
    this.path = path;
  }

  // get the doc id
  get_doc_id() {
    return this.doc_id;
  }

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

  update_doc(update) {
    try {
      // Convert update to Uint8Array if needed
      const updateArray =
        update instanceof Uint8Array
          ? update
          : new Uint8Array(Object.values(update));
  
      console.log('Received update action:', updateArray);
      this.yDoc
      Y.logUpdate(updateArray);
  
      // Apply the update to the Y.Doc
      Y.applyUpdate(this.yDoc, updateArray);
  
      // Log the updated contents for debugging
      console.log('Document contents after update:', this.contents.toString());
  
      // Save the document after applying the update
      this.save();
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
    this.next_id = 0;

    try {
      this.document_list = fs.readdirSync(doc_path);
    } catch (err) {
      console.error('Error reading directory:', err);
    }
  }

  // open_file(author, doc_name) {
  open_file(doc_name) {
  
    const filePath = path.join(this.doc_path, `${doc_name}.json`);
    
    if (fs.existsSync(filePath)) {
      // If the document exists, load it from disk
      // const doc = new Document(author, this.doc_path, this.next_id, doc_name);
      const doc = new Document(this.doc_path, this.next_id, doc_name);
      this.next_id = this.next_id + 1;

      try {
        const data = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(data);
  
        doc.doc_name.insert(0, parsedData.title);
        doc.contents.insert(0, parsedData.contents);
        
        //store the document in the open_docs
        this.open_docs.set(doc.get_doc_id(), doc);  
        return doc;
      } catch (error) {
        console.error('Error loading document:', error);
        return null;
      }
    } else {
      // If the document doesn't exist, create a new one
      // const doc = new Document(author, this.doc_path, this.next_id, doc_name);
      const doc = new Document(this.doc_path, this.next_id, doc_name);
      this.next_id = this.next_id + 1;
      doc.save()
      this.document_list.push(`${doc_name}`);
      this.open_docs.set(doc_id, doc);
      return doc;
    }
  }

  // opens a file if it exists, if it does not opens a new file
  // get_open_file(author, doc_name, doc_id) {
  get_open_file(doc_name, doc_id) {
    if (this.open_docs.has(doc_name)) {
      return this.open_docs.get(doc_id);
    } else {
      // return this.open_file(author, doc_name)
      return this.open_file(doc_name);
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
      // const { action, doc_name, doc_id, author, update } = msg;
      const { action, doc_name, doc_id, update } = msg;

      if (action === 'open') {
        // const doc = fileCabinet.open_file(author, doc_name);
        const doc = fileCabinet.open_file(doc_name);
        current_doc_id = doc.get_doc_id();

        if (!documentEditors[current_doc_id]) {
          documentEditors[current_doc_id] = new Set();
        }
        documentEditors[current_doc_id].add(ws);

        ws.send(
          JSON.stringify({
            action: 'documentOpened',
            doc_id: doc.doc_id,
            title: doc.doc_name.toString(),
            contents: doc.contents.toString(),
          })
        );
      // } else if (action === 'edit' && currentDocName) {
      } else if (action === 'edit') {
        // const doc = fileCabinet.get_open_file(author, doc_name, doc_id);
        const doc = fileCabinet.get_open_file(doc_name, doc_id);
        doc.update_doc(update);

        // if (documentEditors[currentDocName]) {
          if (documentEditors[doc_id]) {
            documentEditors[doc_id].forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    action: 'update',
                    update: Array.from(update), // Ensure the update is sent properly
                    doc_id: doc_id,
                  })
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
    if (current_doc_id) {
      console.log(`Checking editors for document: ${current_doc_id}`);
      const editors = documentEditors[current_doc_id];
  
      if (editors) {
        editors.delete(ws);
        console.log(`Remaining editors for ${current_doc_id}:`, editors.size);
  
        // Save the document if no editors are left
        if (editors.size === 0) {
          console.log(`No editors left for ${current_doc_id}. Saving document.`);
          const doc = fileCabinet.get_open_file(this.open_docs.get(current_doc_id).doc_name, current_doc_id);
          if (doc && doc.save()) {
            console.log(`Document "${current_doc_id}" saved successfully.`);
          } else {
            console.error(`Failed to save document: ${current_doc_id}`);
          }
        }
      }
    }
  });

});

console.log('Server listening on port 8080');

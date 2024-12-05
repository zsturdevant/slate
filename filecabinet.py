from document import Document
import os

class File_Cabinet:

    def __init__(self, doc_path, document_list: list = []):
        self.doc_path = doc_path
        entries = os.listdir(doc_path)

        for entry in entries:
              # add opening all exiting documents to this
              document_list.append(entry)

        self.document_list = document_list

    # if the user creates a new document that doesn't already exist in the database, add it to the database
    def add_doc(self, author, doc_name):
        doc = Document([author], doc_name)

        if doc.name not in self.document_list:
            self.document_list.append(doc.name)
        return doc

    # open an existing document
    def open_doc(self, author, doc_name):
         if doc_name in self.document_list:
            path = self.doc_path + doc_name
            with open(path, 'r') as file:
                contents = []
                for next in file:
                    line = next.split(' ')
                    contents += line
                new_doc = Document(author, doc_name, contents)
                return new_doc
         else:
              return self.add_doc(author, doc_name)
    
    # Allow user to delete a document if desired
    def delete_doc(self, doc: Document):
         if doc.name in self.document_list:
            self.document_list.remove(doc.name)
         doc.delete(self.doc_path + doc.name)
         del doc


    # Functionality to rename an exixting document
    def rename_doc(self, doc: Document, new_name):
        self.document_list.remove(doc.name)
        doc.name_file(new_name)
        self.document_list.append(new_name)

    # once the user finishes editing the document/closes it, write document to the database and close the instance
    def close_doc(self, doc: Document):
          doc.save(self.doc_path)
          del doc
          return True
    
    #allow the user to save the file if they want to
    def save_doc(self, doc):
        doc.save(self.doc_path)
        return True
import Socket.IO
import os
import 

class Document:
    def __init__(self, author_list, doc_name, contents =[]):
        self.name = doc_name
        self.author_list = author_list

        # need to make this a crdt array
        self.contents = contents

    def name_file(self, name):
        self.doc_name = name
        return 1

    def add_author(self, new_author):
        self.author_list.append(new_author)
        return 1
    
    def remove_author(self, author_name):
            if self.author_list.contains(author_name):
                #TODO
                ##remove it
                print("need to do me still")

            else:
                return 0
            
            # if no one is editing the document then save it
            if self.author_list == []:
                 self.save()
                 
    # update this with crdt stuff
    def update_contents(self, update_list, position_list):
        if len(update_list) != len(position_list):
            print("unable to update, list and positions were of different sizes")
            return 0
        
        content_length = len(self.contents)

        for i in range(len(update_list)):
            update = update_list[i]
            position = position_list[i]

            if (position > content_length - 1):
                content_length += 1
                self.contents.append(update)
            
            else:
                self.contents[position] = update

        return True
    
    def send_contets(self, users):
         print("do me still")

    def delete(self, doc_path):
        try:
            os.remove(doc_path)
            return True
        except FileNotFoundError:
            print("File not found.")
            return False
        except PermissionError:
            print("invalid permission to delete this file.")
            return False
         
    
    def save(self):
        with open(self.doc_name, 'w') as file:
            contents = self.contents.join(' ')
            file.write(contents)

        return True

class Server:

    def __init__(self, doc_path, document_list = []):
         self.doc_path = doc_path
         entries = os.listdir(doc_path)
         for entry in entries:
              # add opening all exiting documents to this
              document_list.append(entry)

    # if the user creates a new document that doesn't already exist in the database, add it to the database
    def add_doc(self, author, doc_name):
        doc = Document([author], doc_name)
        self.document_list.append(doc)
        return doc

    # open an existing document
    def open_doc(self, author, doc_name):
         if self.entries.contains(doc_name):

            with open(doc_name, 'r') as file:
                lines = file.readlines()
                contents = lines.split(' ')
                new_doc = Document(author, doc_name, contents)
                return new_doc
         else:
              return self.add_doc(author, doc_name)
    
    # Allow user to delete a document 
    def delete_doc(self, doc, doc_path):
         doc.delete(doc_path)
         self.document_list.remove(doc)
         del doc


    # Functionality to rename an exixting document
    def rename_doc(self, doc, new_name):
         doc.name_file(new_name)
    
    def open_connection():
          return True
    
    # some functionality for keeping track of the user(s) who is on the doc
    # do we implement some sort of authentication or login?
    def user():
          return True

    
    # utilize CRDTpy and array stuff for the live editing the user is doing on the doc
    def edit_doc(doc, update_list, position_list):
        return doc.update_contents(update_list, position_list)

    # once the user finishes editing the document/closes it, write document to the database and close the instance
    def close_doc(self, doc):
          doc.save()
          self.document_list.remove(doc)
          del doc
          return True
    
# The main method that runs the server
if __name__ == "__main__":
    doc_path = "./documents"
    server = Server(doc_path, [])
    ## set up the server

    ## wait for clients, create a new thread for each client and handle their request stuff
    print("something useful")
          
          
    
    


    

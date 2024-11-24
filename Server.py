# import Socket.IO
import os
import concurrent.futures
from fastapi import FastAPI, WebSocket
from pycrdt import Doc, Array

class Document:
    def __init__(self, author_list = [], doc_name = "Untitled", contents =[]):

        self.name = doc_name
        self.author_list = author_list

        #pycrdt document that contains the array with the contents of the message
        doc = Doc()
        contents = Array()
        doc["array"]= contents
        self.doc = doc



    def name_file(self, name):
        self.name = name
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

                 
    # handles updates to the crdt list 
    def update_contents(self, operation_list, update_list, position_list):
        if len(update_list) != len(position_list):
            print("unable to update, list and positions were of different sizes")
            return False

        for i in range(len(update_list)):
            operation = operation_list[i]
            update = update_list[i]
            position = position_list[i]

            if operation == "insert":
                self.doc["array"].insert(position, update)

            elif operation == "append":
                self.doc["array"].append(update)

            elif operation == "delete":
                del self.doc["array"][position]

            elif operation == "replace":
                self.doc["array"][position] = update

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
        with open(self.name, 'w') as file:
            contents = self.doc["array"].to_py()
            contents = ' '.join(contents)
            file.write(contents)
        return True

class Server:

    def __init__(self, doc_path, document_list: list = []):
        self.doc_path = doc_path
        entries = os.listdir(doc_path)

        for entry in entries:
              # add opening all exiting documents to this
              document_list.append(entry)

        self.document_list = document_list

    # if the user creates a new document that doesn't already exist in the database, add it to the database
    def add_doc(self, author, doc_name):
        full_doc_name = self.doc_path + doc_name
        doc = Document([author], full_doc_name)
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
    def delete_doc(self, doc: Document, doc_path):
         doc.delete(doc_path)
         self.document_list.remove(doc)
         del doc


    # Functionality to rename an exixting document
    def rename_doc(self, doc: Document, new_name):
         doc.name_file(new_name)
    
    def open_connection():
          return True
    
    # some functionality for keeping track of the user(s) who is on the doc
    # do we implement some sort of authentication or login?
    def user():
          return True

    
    # utilize CRDTpy and array stuff for the live editing the user is doing on the doc
    def edit_doc(doc: Document, operation_list, update_list, position_list):
        return doc.update_contents(operation_list, update_list, position_list)

    # once the user finishes editing the document/closes it, write document to the database and close the instance
    def close_doc(self, doc: Document):
          doc.save()
          self.document_list.remove(doc)
          del doc
          return True
    
    # connects to the client 
    async def websocket_connection(websocket):
        print("hello")


    def handle_client(websocket: WebSocket):
        print("hello")

    

app = FastAPI()

@app.websocket("/ws")
async def websocket_connection(server: Server, doc: Document, websocket: WebSocket):
    await websocket.accept()
    doc.add_author(websocket)
    try:
        keep_going = True
        while keep_going:
            command:str = await websocket.receive_text_text()
            if command.startswith("edit"):
                for connection in doc.author_list:
                    if connection != websocket:
                        await connection.send_text(command)
            elif command.startswith("close"): 
                doc.author_list.remove(websocket)
                
                #close the document fully if the last user is finished
                if(doc.author_list.isEmpty()):
                    server.close_doc(doc)

                keep_going = False

    except Exception as e:
        print(f"WebSocket connection closed: {e}")


# The main method that runs the server
if __name__ == "__main__":
    doc_path = "./documents/"

    server = Server(doc_path, [])
    doc = server.add_doc("zach", "zach.txt")

    operation_list = ["append", "append", "append", "delete", "insert"]
    update_list = ["hello", "world", "my", "none", "silly"]
    position_list = [0, 0, 0, 2, 1]
    doc.update_contents(operation_list,update_list, position_list)

    operation_list = ["append"]
    update_list = ["hello"]
    position_list = [0]
    doc.update_contents(operation_list,update_list, position_list)

    

    # make a pool of workers to handle different clients 
    thread_pool = concurrent.futures.ThreadPoolExecutor(max_workers= 10)
    print(server.document_list)
    server.close_doc(doc)

    keep_going = True
    while keep_going:
        #wait for a websocket connection
        
        thread_pool.submit(handle_client, websocket)
        keep_going = False

    thread_pool.shutdown(wait=True)
    



    


          
          
    
    


    

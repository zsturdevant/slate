import Socket.IO
import os


class Server:

    class Document:
        def __init__(self, author_list, doc_name, contents =[]):
            self.name = doc_name
            self.author_list = author_list
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
                    return 1
             else:
                  return 0

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

            return 1
        
        def save(self):

            with open(self.doc_name, 'w') as file:
                contents = self.contents.join(' ')
                file.write(contents)

            return 1

    def __init__(self, document_list = []):
         doc_path ="./documents"
         entries = os.listdir(doc_path)
         for entry in entries:
              document_list.append(entry)

    def add_doc(self, author, doc_name):
         doc = Document([author], doc_name)

          
            
    
    # should we store a path to the database folder as a global variable?
    path_to_doc_database = "path?"
    
    # create a document database folder
    def open_database():
          return True
    
    def close_database():
          return True
    
    def open_connection():
          return True
    
    # some functionality for keeping track of the user(s) who is on the doc
    # do we implement some sort of authentication or login?
    def user():
          return True
    
    # if the user creates a new document that doesn't already exist in the database, add it to the database
    # How do we handle the case that the user tries to add a document name that already exists? 
    # Do we tell them they must create a new name for the document?
    def add_doc():
         return True
 
    #  when a user opens a document, an new instance of the server is created
    def open_doc():
          return True
    
    # utilize CRDTpy and array stuff for the live editing the user is doing on the doc
    def edit_doc():
            return True

    # once the user finishes editing the document/closes it, write document to the database and close the instance
    def close_doc():
          return True
    
    # The main method that runs the server
    if __name__ == "__main__":
        ## set up the server

        ## wait for clients, create a new thread for each client and handle their request stuff
        print("something useful")
          
          
    
    


    

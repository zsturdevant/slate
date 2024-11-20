import Socket.IO


class Server:
    def __init__(self):
            pass
    
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
          
          
    
    


    

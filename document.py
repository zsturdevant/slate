from y_py import YDoc
import os

class Document:
    def __init__(self, author_list = [], doc_name = "Untitled"):

        self.name = doc_name
        self.author_list = author_list
        self.doc = YDoc()


        # #pycrdt document that contains the array with the contents of the message
        # doc = Doc()
        # contents = Array()
        # doc["array"] = contents
        # self.doc = doc

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

                 
    # # handles updates to the crdt list 
    # def update_contents(self, operation, update, position):
    #     if operation == "insert":
    #         self.doc["array"].insert(position, update)

    #     elif operation == "append":
    #         self.doc["array"].append(update)

    #     elif operation == "delete":
    #         del self.doc["array"][position]

    #     elif operation == "replace":
    #         self.doc["array"][position] = update

    #     else:
    #         print("attempted to perform disallowed operation")
    #         return False

    #     return True
    

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
         
    # save the text contents of the document 
    def save(self, path):
        with open(path + self.name, 'w') as file:
            contents = self.doc.get_text(self.name)
            # contents = self.doc["array"].to_py()
            # contents = ' '.join(contents)
            file.write(contents)
        return True
    
    # returns the string contents 
    def get_contents(self):

        contents = self.doc.get_text(self.name).__str__()
        return contents
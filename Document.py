class Document:
    def __init__(self, author_list, doc_name, contents):
        self.name = doc_name
        self.author_list = author_list
        self.contents = contents

    def name_file(self, name):
        self.doc_name = name
        return 1


    def add_author(self, new_author):
        self.author_list.append(new_author)
        return 1

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

    


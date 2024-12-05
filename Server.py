import asyncio
from fastapi import FastAPI, WebSocket
from fastapi.responses import FileResponse
from y_py import YDoc, YText 
# from pycrdt import Doc, Array
import uvicorn

#the classes that we made
from document import Document
from filecabinet import File_Cabinet
    

# handle individual connections as they come
async def handle_connection(websocket: WebSocket, server: File_Cabinet):
    await websocket.accept()
    try:
        keep_going = True
        doc:Document = None
        while keep_going:
            command:str = await websocket.receive_text()
            breakdown = command.split(":")
            

            # send the client a list of all current documents 
            if breakdown[0] == "document_list":
                docs = []
                for name in server.document_list:
                    docs.append(name)
                text = ' '.join(docs)
                await websocket.send_text(text)
            
            # open the file on the server and send the full file text to the client
            elif breakdown[0] == "open":
                doc = server.open_doc(breakdown[1])
                text = doc.get_contents()
                await websocket.send_text(text)

            elif breakdown[0] == "update":
                if doc == None:
                    print("invalid operation, attempted to update a document that has not been opened")
                    continue

                #tell the other clients working on this document about the changes
                for connection in doc.author_list:
                    if connection != websocket:
                        await connection.send_text(command)

                com = breakdown[1]
                action = com.split(";")

                if action[0] == "insert":
                    pos_val = action[1]
                    position, value = pos_val.split(' ')
                    doc.update_contents(action[0], value, position)

                elif action[0] == "append":
                    value = action[1]
                    doc.update_contents(action[0], value)

                elif action[0] == "delete":
                    position = action[1]
                    doc.update_contents(position)

                elif action[0] == "replace":
                    pos_val = action[1]
                    position, value = pos_val.split(' ')
                    doc.update_contents(action[0], value, position)

            # close the connection with that user 
            elif breakdown[0] == "close": 
                doc.author_list.remove(websocket)

                #close the document fully if the last user is finished
                if(doc.author_list.isEmpty()):
                    server.close_doc(doc)

                keep_going = False

            elif breakdown[0] == "save":
                server.save_doc(doc)

            elif breakdown[0] == "delete":
                server.delete_doc(doc)

            elif breakdown[0] == "rename":
                server.rename_doc(doc, breakdown[1])

            else:
                print("invalid operation")
                await websocket.send_text(command + " was not a valid command")


    except Exception as e:
        print(f"Error during WebSocket communication: {e}")
        if websocket in doc.author_list:
            doc.author_list.remove(websocket)

app = FastAPI()
# set the document path and initalize a server
doc_path = "./documents/"
server = File_Cabinet(doc_path)

@app.websocket("/ws")
async def websocket_connection(websocket: WebSocket):
    # Hand off the connection to a new async task
    asyncio.create_task(handle_connection(websocket, server))

# the landing page if 
# @app.get('/favicon.ico')
# async def serve_index(data):
#     return()
#     return send_from_directory('./html', "index.html")

# @app.get("/script.js")
# async def serve_client():
#     return send_from_directory(".", "nextjs-slate")

# # the landing page if 
# @app.get('/')
# async def serve_index(data):
#     return FileResponse("html/index.html")

# the main method for running the server
if __name__ == "__main__":

   uvicorn.run("Server:app", host="127.0.0.1", port=8020, reload=True)


    
    


# # The main method for testing server functionality
# if __name__ == "__main__":
#     doc_path = "./documents/"
#     server = Server(doc_path, [])
#     # doc = server.add_doc("zach", "zach.txt")
#     doc = server.open_doc("zach", "zach.txt")
#     # server.close_doc(doc)


#     server.delete_doc(doc)

    


#     # operation_list = ["append", "append", "append", "delete", "insert"]
#     # update_list = ["hello", "world", "my", "none", "silly"]
#     # position_list = [0, 0, 0, 2, 1]
#     # doc.update_contents(operation_list,update_list, position_list)

#     # operation_list = ["append"]
#     # update_list = ["hello"]
#     # position_list = [0]
#     # doc.update_contents(operation_list,update_list, position_list)
#     # server.close_doc(doc)
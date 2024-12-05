import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const ydoc = new Y.Doc()
const provider = new WebsocketProvider('wss://your-websocket-server.com', 'slate', ydoc)

export { ydoc, provider }
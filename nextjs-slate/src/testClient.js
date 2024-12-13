import WebSocket from 'ws'; // Node WebSocket library
import * as Y from 'yjs';

const SERVER_URL = 'ws://localhost:8080';

// Utility to measure RTT
async function measureRTT(client, message) {
  const start = Date.now();
  return new Promise((resolve) => {
    client.onmessage = (event) => {
      const end = Date.now();
      resolve(end - start); // Calculate RTT
    };
    client.send(JSON.stringify(message));
  });
}

async function simulateClient(docName, id, iterations, payloadSize) {
  return new Promise((resolve) => {
    const ws = new WebSocket(SERVER_URL);
    const ydoc = new Y.Doc();
    const sharedText = ydoc.getText('shared-text');

    ws.onopen = async () => {
      console.log(`Client ${id} connected`);

      // Open the document
      ws.send(
        JSON.stringify({
          action: 'open',
          doc_name: docName,
        })
      );

      let totalRTT = 0;

      for (let i = 0; i < iterations; i++) {
        // Generate data of specified payload size
        const inputData = 'a'.repeat(payloadSize) + `_${id}_${i}`;

        // Measure RTT for an edit action
        sharedText.insert(0, inputData); // Simulate local changes
        const update = Y.encodeStateAsUpdate(ydoc);
        const rtt = await measureRTT(ws, {
          action: 'edit',
          doc_name: docName,
          update: Array.from(new Uint8Array(update)),
        });

        totalRTT += rtt;
        console.log(`Client ${id} Iteration ${i}: RTT = ${rtt} ms`);
      }

      console.log(`Client ${id} Average RTT: ${totalRTT / iterations} ms`);
      resolve(totalRTT / iterations); // Resolve average RTT
      ws.close();
    };

    ws.onerror = (err) => console.error(`Client ${id} error:`, err);
  });
}

async function main() {
  const docName = 'testDoc';
  const iterations = 10; // Number of RTT measurements
  const payloadSize = 100; // Characters per edit
  const clientPromises = [];

  for (let i = 0; i < 3; i++) {
    clientPromises.push(simulateClient(docName, i, iterations, payloadSize));
  }

  const rtts = await Promise.all(clientPromises);
  console.log('RTT Results:', rtts);
}

main();

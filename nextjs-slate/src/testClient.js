import WebSocket from 'ws'; // Node WebSocket library
import * as Y from 'yjs';

const SERVER_URL = 'ws://localhost:8080';
/* Uncomment for server IP address
const SERVER_URL = 'wss://3.14.217.132:8080';
*/

// Utility to measure RTT
async function measureRTT(client, message) {
  const start = Date.now();
  return new Promise((resolve) => {
    const onMessage = () => {
      const end = Date.now();
      client.removeEventListener('message', onMessage);
      resolve(end - start); // Calculate RTT
    };

    client.addEventListener('message', onMessage);
    client.send(JSON.stringify(message));
  });
}

// Function to simulate a client
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

        // Simulate local change and encode it
        sharedText.insert(0, inputData);
        const update = Y.encodeStateAsUpdate(ydoc);

        // Measure RTT for the edit action
        const rtt = await measureRTT(ws, {
          action: 'edit',
          doc_name: docName,
          update: Array.from(new Uint8Array(update)),
        });

        totalRTT += rtt;
        console.log(`Client ${id} Iteration ${i}: RTT = ${rtt} ms`);
      }

      const averageRTT = totalRTT / iterations;
      console.log(`Client ${id} Average RTT: ${averageRTT} ms`);
      resolve(averageRTT);
      ws.close();
    };

    ws.onerror = (err) => console.error(`Client ${id} error:`, err);
  });
}

// Main function to test both single-client RTT and scalability
async function main() {
  const docName = 'testDoc';
  const iterations = 10; // Number of RTT measurements
  const payloadSize = 100; // Fixed payload size for single-client RTT testing

  console.log('Testing single-client RTT using 3 clients:');
  const clients = [0, 1, 2].map((id) => simulateClient(docName, id, iterations, payloadSize));
  const clientRTTs = await Promise.all(clients);

  const singleClientAverageRTT = clientRTTs.reduce((sum, rtt) => sum + rtt, 0) / clientRTTs.length;
  console.log(`Single-client average RTT (3 clients): ${singleClientAverageRTT} ms\n`);

  // Scalability testing with varying document sizes
  console.log('Testing scalability with varying document sizes:');
  const docSizes = [100, 500, 1000, 5000, 10000, 50000, 100000]; // Document sizes in characters
  for (const size of docSizes) {
    console.log(`\nTesting document size: ${size} characters`);
    const scalabilityClients = [0, 1, 2].map((id) =>
      simulateClient(`${docName}_${size}`, id, iterations, size)
    );
    const scalabilityResults = await Promise.all(scalabilityClients);

    const averageRTT = scalabilityResults.reduce((sum, rtt) => sum + rtt, 0) / scalabilityResults.length;
    console.log(`Average RTT for document size ${size}: ${averageRTT} ms`);
  }
}

main();

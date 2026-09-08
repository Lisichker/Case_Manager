// Automated test for multi-user WebSocket server synchronization and room isolation
import { WebSocket } from 'ws';
import fs from 'node:fs';

const PORT = 5173;

async function runTest() {
  console.log('Testing WebSocket Multi-User Server & Room Isolation...');

  const ws1 = new WebSocket(`ws://127.0.0.1:${PORT}/ws?case=test_room_1`);
  const ws2 = new WebSocket(`ws://127.0.0.1:${PORT}/ws?case=test_room_1`);
  const ws3 = new WebSocket(`ws://127.0.0.1:${PORT}/ws?case=test_room_2`); // Different case room

  let client2ReceivedUpdate = false;
  let client3ReceivedUpdate = false;

  await Promise.all([
    new Promise(res => ws1.on('open', res)),
    new Promise(res => ws2.on('open', res)),
    new Promise(res => ws3.on('open', res))
  ]);
  console.log('✓ All 3 clients connected via WebSocket');

  // Set usernames
  ws1.send(JSON.stringify({ type: 'SET_USER', username: 'עו״ד דרון' }));
  ws2.send(JSON.stringify({ type: 'SET_USER', username: 'עו״ד מיכל' }));
  ws3.send(JSON.stringify({ type: 'SET_USER', username: 'עו״ד נפרד' }));

  ws2.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.type === 'SYNC_DOMAIN_DATA' && msg.data?.testMarker === 'TEST_FACT_UPDATE') {
      client2ReceivedUpdate = true;
      console.log('✓ Client 2 in room 1 received real-time update from Client 1!');
    }
  });

  ws3.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.type === 'SYNC_DOMAIN_DATA' && msg.data?.testMarker === 'TEST_FACT_UPDATE') {
      client3ReceivedUpdate = true;
    }
  });

  // Client 1 sends an update
  const payload = {
    testMarker: 'TEST_FACT_UPDATE',
    facts: {
      'fact_test': {
        id: 'fact_test',
        name: 'עובדת בדיקה מסונכרנת בזמן אמת',
        proved: true,
        disproved: false
      }
    },
    witnesses: {},
    statements: {},
    assertions: {},
    factSheets: {},
    factTable: { columns: [], rows: [], cells: {} }
  };

  ws1.send(JSON.stringify({
    type: 'UPDATE_CASE',
    data: payload
  }));

  // Wait 600ms for broadcast
  await new Promise(r => setTimeout(r, 600));

  ws1.close();
  ws2.close();
  ws3.close();

  if (!client2ReceivedUpdate) {
    throw new Error('Client 2 did not receive the synchronized update!');
  }

  if (client3ReceivedUpdate) {
    throw new Error('Client 3 in a different case room leaked data from room 1!');
  }
  console.log('✓ Case room isolation confirmed: Client 3 did not receive updates from Room 1.');

  // Verify server disk persistence
  const savedFilePath = './data/case_test_room_1.json';
  if (fs.existsSync(savedFilePath)) {
    const diskContent = JSON.parse(fs.readFileSync(savedFilePath, 'utf-8'));
    if (diskContent.testMarker === 'TEST_FACT_UPDATE') {
      console.log('✓ Server disk persistence verified: data saved to JSON file on disk.');
    } else {
      throw new Error('Disk file content mismatch');
    }
    // Clean up test file
    fs.unlinkSync(savedFilePath);
  } else {
    throw new Error('Expected saved JSON file on disk, but not found');
  }

  console.log('\nAll WebSocket multi-user real-time tests passed successfully!');
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

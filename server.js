import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5173;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// HTTP Server for serving static assets
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];

  // Health check endpoint for Render zero-downtime deploys
  if (reqPath === '/healthz' || reqPath === '/ping') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('OK');
    return;
  }

  if (reqPath === '/') reqPath = '/index.html';

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');

  // Block access to hidden dotfiles (e.g. .git, .env)
  if (safePath.startsWith('.') || safePath.includes('/.')) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  let filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(__dirname, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      res.end(content);
    });
  });
});

// Setup WebSocket Server on the same HTTP server
const wss = new WebSocketServer({ server, path: '/ws' });

// Track connected clients per case room
// Map of caseId -> Set of { ws, username, tabId }
const rooms = new Map();

function sanitizeCaseId(rawId) {
  if (!rawId || typeof rawId !== 'string') return 'default';
  const clean = rawId.replace(/[^a-zA-Z0-9_\u0590-\u05FF-]/g, '_').substring(0, 60);
  return clean || 'default';
}

function getCaseFilePath(caseId) {
  const safeId = sanitizeCaseId(caseId);
  return path.join(DATA_DIR, `case_${safeId}.json`);
}

function loadCaseData(caseId) {
  const filePath = getCaseFilePath(caseId);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error(`Error reading case file for ${caseId}:`, e);
    }
  }
  return null;
}

function saveCaseData(caseId, data) {
  const filePath = getCaseFilePath(caseId);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Error saving case file for ${caseId}:`, e);
  }
}

function broadcastToRoom(caseId, payload, excludeWs = null) {
  const room = rooms.get(caseId);
  if (!room) return;

  const messageStr = JSON.stringify(payload);
  for (const client of room) {
    if (client.ws !== excludeWs && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(messageStr);
      } catch (err) {
        console.warn('Error broadcasting to client:', err);
      }
    }
  }
}

function broadcastPresence(caseId) {
  const room = rooms.get(caseId);
  if (!room) return;

  const users = Array.from(room).map(c => ({
    username: c.username || 'משתמש',
    tabId: c.tabId
  }));

  broadcastToRoom(caseId, {
    type: 'PRESENCE_UPDATE',
    caseId,
    users
  });
}

wss.on('connection', (ws, req) => {
  // Parse caseId from URL query string ?case=...
  const urlParams = new URLSearchParams((req.url || '').split('?')[1] || '');
  const caseId = sanitizeCaseId(urlParams.get('case') || 'default');

  if (!rooms.has(caseId)) {
    rooms.set(caseId, new Set());
  }

  const clientInfo = {
    ws,
    username: 'עו״ד',
    tabId: 'tab_' + Math.random().toString(36).substring(2, 7)
  };
  rooms.get(caseId).add(clientInfo);

  console.log(`[WS] Client joined case: "${caseId}" (Active in room: ${rooms.get(caseId).size})`);

  // Send current state to newly connected client
  const savedData = loadCaseData(caseId);
  if (savedData) {
    ws.send(JSON.stringify({
      type: 'INIT_STATE',
      caseId,
      data: savedData
    }));
  } else {
    // If no saved file exists yet, request it or allow client to seed
    ws.send(JSON.stringify({
      type: 'REQUEST_SEED',
      caseId
    }));
  }

  broadcastPresence(caseId);

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message.toString());

      if (msg.type === 'UPDATE_CASE' && msg.data) {
        // Save to disk
        saveCaseData(caseId, msg.data);

        // Broadcast to all other clients in the same case
        broadcastToRoom(caseId, {
          type: 'SYNC_DOMAIN_DATA',
          caseId,
          data: msg.data,
          sender: msg.sender || clientInfo.tabId
        }, ws);
      } else if (msg.type === 'SET_USER' && msg.username) {
        clientInfo.username = msg.username.trim();
        if (msg.tabId) clientInfo.tabId = msg.tabId;
        broadcastPresence(caseId);
      } else if (msg.type === 'SEED_CASE' && msg.data) {
        // If file doesn't exist, seed it
        const current = loadCaseData(caseId);
        if (!current) {
          saveCaseData(caseId, msg.data);
          console.log(`[WS] Seeded new case file for "${caseId}"`);
        }
      }
    } catch (err) {
      console.error('[WS] Error processing message:', err);
    }
  });

  ws.on('close', () => {
    const room = rooms.get(caseId);
    if (room) {
      room.delete(clientInfo);
      if (room.size === 0) {
        rooms.delete(caseId);
      } else {
        broadcastPresence(caseId);
      }
    }
    console.log(`[WS] Client disconnected from case: "${caseId}"`);
  });

  ws.on('error', (err) => {
    console.warn('[WS] WebSocket client error:', err);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Court Case Manager running at http://localhost:${PORT}`);
});

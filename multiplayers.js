// Combined Node.js backend + minimal HTML frontend in one file
// Save this as "multiplayers.js" and run it with Node.js

const http = require("http");
const fs = require("fs");
const WebSocket = require("ws");

const PORT = 8080;

// HTML + JS client (served from root)
const clientHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Splatoonz Lobby</title>
  <style>
    body { font-family: sans-serif; background: #111; color: #0ff; text-align: center; padding: 2em; }
    input, button { padding: 0.5em; font-size: 1em; margin: 0.5em; }
  </style>
</head>
<body>
  <h1>🎮 Splatoonz Multiplayer Lobby</h1>
  <div>
    <button onclick="createRoom()">Create Room</button>
    <input id="roomCodeInput" placeholder="Enter room code" />
    <button onclick="joinRoom()">Join Room</button>
  </div>
  <div id="roomInfo"></div>
  <div id="playerCount"></div>

  <script>
    let ws;
    let roomCode = null;

    function connect() {
      ws = new WebSocket("ws://" + location.hostname + ":8080");
      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.type === "roomCreated" || data.type === "roomJoined") {
          roomCode = data.roomCode;
          document.getElementById("roomInfo").textContent = `Room Code: ${roomCode}`;
        } else if (data.type === "playersUpdate") {
          document.getElementById("playerCount").textContent = `Players in Lobby: ${data.players.length}`;
        }
      };
    }

    function createRoom() {
      if (!ws || ws.readyState !== WebSocket.OPEN) connect();
      ws.onopen = () => ws.send(JSON.stringify({ type: "createRoom" }));
    }

    function joinRoom() {
      const code = document.getElementById("roomCodeInput").value.toUpperCase();
      if (!ws || ws.readyState !== WebSocket.OPEN) connect();
      ws.onopen = () => ws.send(JSON.stringify({ type: "joinRoom", roomCode: code }));
    }
  </script>
</body>
</html>
`;

// Serve the HTML on root
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(clientHTML);
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocket.Server({ server });

const rooms = {}; // { [roomCode]: Set<WebSocket> }

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function broadcastRoom(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;
  const message = JSON.stringify({ type: "playersUpdate", players: Array.from(room).map((_, i) => ({ id: i })) });
  for (const client of room) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

wss.on("connection", (ws) => {
  ws.room = null;

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type === "createRoom") {
        let code;
        do { code = generateRoomCode(); } while (rooms[code]);
        rooms[code] = new Set([ws]);
        ws.room = code;
        ws.send(JSON.stringify({ type: "roomCreated", roomCode: code }));
        broadcastRoom(code);
      } else if (data.type === "joinRoom") {
        const code = data.roomCode;
        if (rooms[code]) {
          rooms[code].add(ws);
          ws.room = code;
          ws.send(JSON.stringify({ type: "roomJoined", roomCode: code }));
          broadcastRoom(code);
        } else {
          ws.send(JSON.stringify({ type: "error", message: "Room not found." }));
        }
      }
    } catch (e) {
      ws.send(JSON.stringify({ type: "error", message: "Invalid format." }));
    }
  });

  ws.on("close", () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room].delete(ws);
      if (rooms[ws.room].size === 0) delete rooms[ws.room];
      else broadcastRoom(ws.room);
    }
  });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

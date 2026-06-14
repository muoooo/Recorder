const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { randomBytes } = require('crypto');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// rooms: { [roomId]: { id, createdAt, users: { [socketId]: { name } } } }
const rooms = {};

function generateRoomId() {
  return randomBytes(3).toString('hex').toUpperCase(); // e.g. "A3F9B2"
}

function getRoomUsers(roomId) {
  if (!rooms[roomId]) return [];
  return Object.values(rooms[roomId].users);
}

io.on('connection', (socket) => {

  // Create a new room
  socket.on('create-room', ({ name }, callback) => {
    if (!name || !name.trim()) return callback({ error: 'Name is required' });

    let roomId;
    do { roomId = generateRoomId(); } while (rooms[roomId]);

    rooms[roomId] = { id: roomId, createdAt: Date.now(), users: {} };
    rooms[roomId].users[socket.id] = { name: name.trim() };

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.name = name.trim();

    callback({ roomId, users: getRoomUsers(roomId) });

    console.log(`[room ${roomId}] created by "${name.trim()}"`);
  });

  // Join an existing room
  socket.on('join-room', ({ name, roomId }, callback) => {
    if (!name || !name.trim()) return callback({ error: 'Name is required' });
    if (!roomId || !roomId.trim()) return callback({ error: 'Room ID is required' });

    const id = roomId.trim().toUpperCase();

    if (!rooms[id]) return callback({ error: 'Room not found. Check the code and try again.' });

    rooms[id].users[socket.id] = { name: name.trim() };
    socket.join(id);
    socket.data.roomId = id;
    socket.data.name = name.trim();

    const users = getRoomUsers(id);
    callback({ roomId: id, users });

    // Tell everyone else in the room
    socket.to(id).emit('user-joined', { name: name.trim(), users });

    console.log(`[room ${id}] "${name.trim()}" joined`);
  });

  // Disconnect: clean up
  socket.on('disconnect', () => {
    const { roomId, name } = socket.data;
    if (!roomId || !rooms[roomId]) return;

    delete rooms[roomId].users[socket.id];
    const users = getRoomUsers(roomId);

    if (users.length === 0) {
      delete rooms[roomId];
      console.log(`[room ${roomId}] empty, deleted`);
    } else {
      io.to(roomId).emit('user-left', { name, users });
      console.log(`[room ${roomId}] "${name}" left`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

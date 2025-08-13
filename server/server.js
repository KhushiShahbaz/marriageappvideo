require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');
const {Server} = require('socket.io');
const Message = require('./models/Message');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
});
// ✅ Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});
// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/sample', require('./routes/sample'));
const agencyRoutes= require('./routes/agency')
const authRoutes = require('./routes/auth');
const hallRoutes = require('./routes/halls');
const bookingRoutes = require('./routes/booking');
const userProfileRoutes= require('./routes/userProfile')
const ChatRoute=require('./routes/chat')
const menuRoutes = require('./routes/menus');
const matchPreferenceRoutes=require('./routes/matchPreference')
const paymentRoutes=require("./routes/paymentDetail")
const savedAccountRoutes = require('./routes/savedAccounts');
const visibilityRoutes = require("./routes/visibilityMatrix");
const agencyDashboardRoutes = require('./routes/AgencyDashboard');

app.use('/api/dashboard', agencyDashboardRoutes);
app.use("/api/visibility", visibilityRoutes);
app.use('/api/saved-accounts', savedAccountRoutes);
app.use('/api/auth', authRoutes);
// Register /api/users endpoint directly
app.use('/api', authRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/decorations', require('./routes/decorations'));
app.use('/api/bookings', bookingRoutes);
app.use('/api/booking', bookingRoutes);
app.use("/api/userProfile", userProfileRoutes)
app.use('/api/agency', agencyRoutes);
app.use('/api/chat',ChatRoute)
app.use('/api/menus', menuRoutes);
app.use('/api/match-preference', matchPreferenceRoutes)
app.use('/api/payments',paymentRoutes)
// Basic route
app.get('/', (req, res) => {
  res.send('Server is running');
});


// Store connected users and active calls
const connectedUsers = new Map();
const activeCalls = new Map();

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('joinSession', ({ sessionId }) => {
    socket.join(sessionId);
    console.log(`Joined session ${sessionId}`);
  });

  socket.on('joinRoom', ({ hallId, bookingId }) => {
    socket.join(`${hallId}-${bookingId}`);
    console.log(`Joined room ${hallId}-${bookingId}`);
  });

  socket.on('sendMessage', async (msg) => {
    const message = await Message.create(msg);
    io.to(`${msg.hallId}-${msg.bookingId}`).emit('receiveMessage', message);
  });
 // WebRTC Signaling for Video/Audio Calls
 socket.on('register', (userId) => {
  connectedUsers.set(userId, {  // ✅ User ID as key
    socketId: socket.id,
    userId: userId
  });
  console.log('Registered user:', userId, 'with socket:', socket.id);
});
  
socket.on('callUser', (data) => {
  console.log('--- CALL INITIATION ---');
  console.log('Caller:', data.from, 'Socket:', socket.id);
  console.log('Trying to call user:', data.userToCall);
  
  const targetUser = connectedUsers.get(data.userToCall);
  console.log('Target user found:', targetUser); // Should show socket info
  
  if (targetUser) {
    console.log('Emitting callUser to socket:', targetUser.socketId);
    io.to(targetUser.socketId).emit('callUser', {
      signal: data.signalData,
      from: data.from,
      callId: `${data.from}_${data.userToCall}_${Date.now()}`
    });
  } else {
    console.log('Target user not found!');
  }
});

  // Answer call
  socket.on('answerCall', (data) => {
    const { signal, to, callId } = data;
    console.log(`Call answered by ${socket.id} to ${to}`);
    
    // Update call status
    if (callId && activeCalls.has(callId)) {
      const call = activeCalls.get(callId);
      call.status = 'connected';
      call.connectTime = new Date();
      activeCalls.set(callId, call);
    }

    // Send answer signal back to caller
    io.to(to).emit('callAccepted', signal);
  });

  // End call
  socket.on('endCall', (data) => {
    const { to, callId } = data;
    console.log(`Call ended by ${socket.id}`);
    
    // Remove call from active calls
    if (callId) {
      activeCalls.delete(callId);
    }
    
    // Notify the other user
    if (to) {
      const targetUser = connectedUsers.get(to);
      if (targetUser) {
        io.to(targetUser.socketId).emit('callEnded');
      }
    }
    
    // Also broadcast to all connections of this user (in case of multiple tabs)
    socket.broadcast.emit('callEnded');
  });

  // Handle call rejection
  socket.on('rejectCall', (data) => {
    const { to, callId } = data;
    console.log(`Call rejected by ${socket.id}`);
    
    // Remove call from active calls
    if (callId) {
      activeCalls.delete(callId);
    }
    
    // Notify caller
    if (to) {
      const targetUser = connectedUsers.get(to);
      if (targetUser) {
        io.to(targetUser.socketId).emit('callRejected');
      }
    }
  });

  // Handle WebRTC signaling data
  socket.on('signal', (data) => {
    const { to, signal } = data;
    io.to(to).emit('signal', {
      signal,
      from: socket.id
    });
  });

  // Handle ICE candidates
  socket.on('ice-candidate', (data) => {
    const { to, candidate } = data;
    io.to(to).emit('ice-candidate', {
      candidate,
      from: socket.id
    });
  });


  // Get online users
  socket.on('getOnlineUsers', () => {
    const onlineUsers = Array.from(connectedUsers.values());
    socket.emit('onlineUsers', onlineUsers);
  });

  // Check if user is online
  socket.on('checkUserStatus', (data) => {
    const { userId } = data;
    const isOnline = connectedUsers.has(userId);
    socket.emit('userStatus', { userId, isOnline });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.get('/api/active-calls', (req, res) => {
  const calls = Array.from(activeCalls.values());
  res.json({ activeCalls: calls });
});

app.get('/api/online-users', (req, res) => {
  const users = Array.from(connectedUsers.values());
  res.json({ onlineUsers: users });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    connectedUsers: connectedUsers.size,
    activeCalls: activeCalls.size 
  });
});


server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

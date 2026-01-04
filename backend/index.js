const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

/* ======================
   TEMP IN-MEMORY STORE
====================== */
const USERS = {};   // userId -> user
const POSTS = [];   // post list

/* ======================
   TEST ROUTE
====================== */
app.get("/", (req, res) => {
  res.send("Backend running");
});

/* ======================
   REGISTER USER
====================== */
app.post("/register", (req, res) => {
  const name = req.body.name || "User";

  // safer temporary ID
  const userId =
    Date.now().toString() + Math.floor(Math.random() * 1000);

  USERS[userId] = {
    id: userId,
    name: name,
    createdAt: Date.now()
  };

  res.json(USERS[userId]);
});

/* ======================
   CREATE POST
====================== */
app.post("/post", (req, res) => {
  const { userId, text } = req.body;

  if (!userId || !text) {
    return res.status(400).json({
      error: "userId and text required"
    });
  }

  const post = {
    id: POSTS.length + 1,
    userId,
    text,
    time: Date.now()
  };

  POSTS.push(post);
  res.json(post);
});

/* ======================
   GET ALL POSTS
====================== */
app.get("/posts", (req, res) => {
  res.json(POSTS);
});

/* ======================
   SEARCH USER BY ID
====================== */
app.get("/user/:id", (req, res) => {
  const user = USERS[req.params.id];
  res.json(user || null);
});

/* ======================
   SOCKET.IO CHAT
====================== */
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) return;
    socket.join(userId);
    console.log("Joined room:", userId);
  });

  socket.on("send", (data) => {
    if (!data || !data.to || !data.msg) return;

    io.to(data.to).emit("receive", {
      from: data.from,
      msg: data.msg,
      time: Date.now()
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

/* ======================
   START SERVER
====================== */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Running on", PORT);
});

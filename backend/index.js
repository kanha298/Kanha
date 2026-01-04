const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors:{ origin:"*" } });

app.use(cors());
app.use(express.json());

/* ===== TEMP DATABASE (memory) ===== */
const USERS = {};
const POSTS = [];

/* ===== TEST ===== */
app.get("/", (req,res)=>{
  res.send("Backend running");
});

/* ===== REGISTER ===== */
app.post("/register",(req,res)=>{
  const userId = Date.now().toString();
  USERS[userId] = {
    id:userId,
    name:req.body.name || "User"
  };
  res.json(USERS[userId]);
});

/* ===== CREATE POST ===== */
app.post("/post",(req,res)=>{
  const post = {
    userId:req.body.userId,
    text:req.body.text,
    time:Date.now()
  };
  POSTS.push(post);
  res.json(post);
});

/* ===== GET POSTS ===== */
app.get("/posts",(req,res)=>{
  res.json(POSTS);
});

/* ===== SEARCH USER ===== */
app.get("/user/:id",(req,res)=>{
  res.json(USERS[req.params.id] || null);
});

/* ===== SOCKET CHAT ===== */
io.on("connection",(socket)=>{
  socket.on("join",(uid)=>{
    socket.join(uid);
  });

  socket.on("send",(data)=>{
    io.to(data.to).emit("receive",data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT,()=>console.log("Running on",PORT));

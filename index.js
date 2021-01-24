require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const routerNavigation = require("./src/routerNavigation");
const socket = require("socket.io");

const app = express();
app.use(cors());
// middleware
app.use(bodyParser.json()); // untuk row
app.use(bodyParser.urlencoded({ extended: false })); // untuk urlencoded
app.use(morgan("dev"));
app.use(express.static("uploads"));
app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Request-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use("/", routerNavigation);

// untuk socket.io
const http = require("http");
const server = http.createServer(app); //menyimpan data dari http
const io = socket(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Socket.io is Connected");
  socket.on("joinRoom", (data) => {
    socket.join(data);
  });

  socket.on("roomMsg", (data) => {
    socket.broadcast.to(data.room).emit("chatMsg", data); //Private Message memakai socket.emit
    socket.broadcast.emit("notify", data); // add notif
  });

  socket.on("changeRoom", (data) => {
    socket.leave(data.prevRoom);
    socket.join(data.newRoom);
  });

  socket.on("online", (data) => {
    socket.broadcast.emit("setOnline", data);
  });

  socket.on("offline", (data) => {
    socket.broadcast.emit("setOffline", data);
  });
});

app.get("*", (request, response) => {
  response.status(404).send("Path Not Found");
});

server.listen(process.env.PORT, () => {
  console.log(`Listening on PORT: ${process.env.PORT}`);
});

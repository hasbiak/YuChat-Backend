require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const routerNavigation = require("./src/routerNavigation");
const socket = require("socket.io");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use("/yuchat/fileuploadsyuchat/", express.static("uploads"));
app.use(express.static("uploads"));
app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Request-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use("/yuchat", routerNavigation);

const http = require("http");
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: "*",
  },
  path: "/yuchat/socket.io",
});

io.on("connection", (socket) => {
  console.log("Socket.io is Connected");
  socket.on("joinRoom", (data) => {
    socket.join(data);
  });

  socket.on("roomMsg", (data) => {
    socket.broadcast.to(data.room).emit("chatMsg", data);
    socket.broadcast.emit("notify", data);
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

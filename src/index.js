const http = require("http");
const path = require("path");
const express = require("express");
const socketio = require("socket.io");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");
//dynamic import to ES6
let MyFilter = undefined;
(async () => {
  const { Filter } = await import("bad-words");
  MyFilter = Filter;
})();

const app = express();
const server = http.createServer(app);
const io = socketio(server); // give socket io access to the server

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

//serve static files from public folder
app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  //JOIN
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room); //let socket join the room
    socket.emit(
      "welcome",
      generateMessage("Hi there...Welcome to our chat app")
    );

    socket.broadcast
      .to(user.room) //let other know username has joined
      .emit("message", generateMessage(`${username} has joined`));

    // success callback on client side
    callback();
  });

  //MESSAGE
  socket.on("message", (message, acknowlegmentcallback) => {
    const filter = new MyFilter();
    if (filter.isProfane(message)) {
      socket.emit("message", generateMessage("Profanity is not allowed"));
      return acknowlegmentcallback("Profanity detected in message");
    }
    io.emit("message", generateMessage(message));
    //acknowlegment packet is sent to client when server receives the message and acknowledgment callback is invoked at clientside
    acknowlegmentcallback();
  });

  //DISCONNECT
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      //no need to exclude indevisual socket with socket.broadcast as socket has already left
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left`)
      );
    }
    return;
  });

  //LOCATION
  socket.on("locationMessage", (position, ackCallback) => {
    io.emit("locationMessage", generateLocationMessage(position));
    ackCallback();
  });
});
server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});

/** readme
 

io.emit - sends to everyone(including the sender)
socket.emit - sends event to socket(sender)
socket.broadcast.emit - sends event to all other sockets except the one that sent the event
socket.on("eventname") - listen for events
socket.to("room-name").emit - sends event to a specific room

WHY WE NEED HTTP SERVER

app.listen is a shorthand provided by Express. Internally, it calls http.createServer(app) for you and starts the 
server listening on the specified port. However, when you use app.listen(port), you don’t have direct access to the 
http.Server instance created by Express. This becomes a problem for Socket.IO, which needs to attach itself to the 
http.Server instance.

Why Socket.IO Needs http.Server

Socket.IO works on top of the HTTP protocol but also uses the WebSocket protocol for real-time communication.
It needs to "hook into" the same HTTP server that serves your Express application to handle WebSocket upgrades. 
By explicitly creating the server with http.createServer(app) and passing it to Socket.IO, you allow Socket.IO to:

Intercept WebSocket upgrade requests.
Share the same port as your HTTP server.


 */

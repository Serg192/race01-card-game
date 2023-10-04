const { Server } = require("socket.io");
const props = require("./properties");
const jwt = require("jsonwebtoken");

function parseCookies(cookies) {
  const c = {};
  cookies.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts.shift().trim();
    const value = decodeURIComponent(parts.join("=").trim());
    c[name] = value;
  });

  return c;
}

function initSocket(server) {
  const io = new Server(server);

  io.use((socket, next) => {
    const cookies = parseCookies(socket.request.headers.cookie);

    if (cookies.token != undefined) {
      jwt.verify(cookies.token, props.SECRET, (err, decoded) => {
        if (err) {
          return next(new Error("Authentication error"));
        }
        socket.decoded = decoded;
        next();
      });
    } else {
      next(new Error("Authentication error"));
    }
  }).on("connection", (socket) => {
    socket.on("search-room", (data) => {
      onSearchRoom(io, socket, data);
    });
    socket.on("stop-search-room", (data) => {
      onStopSearch(io, socket, data);
    });

    socket.on("my-picture", (data) => {
      onOpponentImage(io, socket, data);
    });

    socket.on("card-dropped", (data) => {
      onCardDropped(io, socket, data);
    });

    socket.on("next-turn", (data) => {
      onNextTurn(io, socket, data);
    });

    socket.on("my-timer", (data) => {
      onTimer(io, socket, data);
    });
  });

  return io;
}

let usersSearchingForRoom = [];
function onSearchRoom(io, soсket, data) {
  if (usersSearchingForRoom.includes(data.login)) return;
  usersSearchingForRoom.push(data.login);
  soсket.join(`${usersSearchingForRoom[0]} room`);
  if (usersSearchingForRoom.length == 2) {
    io.to(`${usersSearchingForRoom[0]} room`).emit("room-found", {
      first: usersSearchingForRoom[0],
      second: usersSearchingForRoom[1],
      room_name: `${usersSearchingForRoom[0]} room`,
    });
    usersSearchingForRoom = [];
  }
}

function onStopSearch(io, soсket, data) {
  usersSearchingForRoom = usersSearchingForRoom.filter(
    (login) => login != data.login
  );
}

function onOpponentImage(io, socket, data) {
  socket.broadcast
    .to(data.room)
    .emit("opponent-picture", { picture: data.picture });
}

function onCardDropped(io, socket, data) {
  socket.broadcast
    .to(data.room)
    .emit("opponent-dropped-a-card", { cardID: data.cardID });
}

function onNextTurn(io, socket, data) {
  socket.broadcast.to(data.room).emit("my-turn");
}

function onTimer(io, socket, data) {
  socket.broadcast.to(data.room).emit("opponent-timer", { sec: data.sec });
}

module.exports = { initSocket };

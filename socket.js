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
  });

  return io;
}

let usersSearchingForRoom = [];
function onSearchRoom(io, soсket, data) {
  console.log("User: " + data.login + " searching for room");
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

module.exports = { initSocket };

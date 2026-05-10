const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
   res.sendFile(path.join(__dirname, "public", "china.html"));
});

io.on("connection", (socket) => {

    console.log("Gracz połączony:", socket.id.slice(0,6));

    socket.broadcast.emit("playerJoined", socket.id);

    socket.on("disconnect", () => {

        console.log("Gracz rozłączony:", socket.id.slice(0,6));

        socket.broadcast.emit("playerLeft", socket.id);
    });

});

const PORT = 3000;

server.listen(PORT, () => {
    console.log("Serwer działa:");
    console.log("http://localhost:" + PORT);
});
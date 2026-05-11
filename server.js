const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "china.html"));
});

app.get("/china.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "china.html"));
});

const rooms = {};
function sendRoomsList() {

    const publicRooms = [];

    for (const roomId in rooms) {

        publicRooms.push({
            roomId,
            count: rooms[roomId].players.length
        });
    }

    io.emit("roomsList", publicRooms);
}
function generateRoomId() {
    return Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase();
}

io.on("connection", (socket) => {
sendRoomsList();
    console.log("ONLINE:", socket.id.slice(0,6));

    // ===== CREATE ROOM =====
    socket.on("createRoom", (nick) => {

        const roomId = generateRoomId();

        rooms[roomId] = {
            host: socket.id,
            players: [
                {
                    id: socket.id,
                    nick: nick,
                    admin: true
                }
            ]
        };

        socket.join(roomId);

        socket.emit("roomCreated", {
            roomId,
            players: rooms[roomId].players
        });

        console.log("ROOM CREATED:", roomId);
		sendRoomsList();
    });

    // ===== JOIN ROOM =====
    socket.on("joinRoom", data => {

        const room = rooms[data.roomId];

        if (!room) {

            socket.emit("joinError", "Pokój nie istnieje");
            return;
        }

        if (room.players.length >= 4) {

            socket.emit("joinError", "Pokój pełny");
            return;
        }

        room.players.push({
            id: socket.id,
            nick: data.nick,
            admin: false
        });

        socket.join(data.roomId);

        io.to(data.roomId).emit(
            "roomUpdated",
            room.players
        );

        console.log(
            data.nick,
            "JOINED",
            data.roomId
        );
		sendRoomsList();
    });

    // ===== START GAME =====
socket.on("startGame", roomId => {

    const room = rooms[roomId];

    if (!room) return;

    if (room.host !== socket.id) return;

    const COLORS = [
        "RED",
        "BLUE",
        "GREEN",
        "YELLOW"
    ];

    const onlinePlayers = [];

    room.players.forEach((p, i) => {

        onlinePlayers.push({
            nick: p.nick,
            color: COLORS[i]
        });
    });

    while (onlinePlayers.length < 4) {

        const color =
            COLORS[onlinePlayers.length];

        onlinePlayers.push({
            nick: "CPU " + color,
            color
        });
    }

    io.to(roomId).emit(
        "gameStarted",
        onlinePlayers
    );
});
    // ===== ONLINE DICE =====
    socket.on("rollDice", roomId => {

        const value =
            Math.floor(Math.random() * 6) + 1;

        io.to(roomId).emit(
            "diceRolled",
            value
        );
    });
    // ===== DISCONNECT =====
    socket.on("disconnect", () => {

        for (const roomId in rooms) {

            const room = rooms[roomId];

            room.players =
                room.players.filter(
                    p => p.id !== socket.id
                );

            io.to(roomId).emit(
                "roomUpdated",
                room.players
            );

            if (room.players.length === 0) {

                delete rooms[roomId];
                sendRoomsList();
                console.log(
                    "ROOM REMOVED:",
                    roomId
                );
            }
        }

        console.log(
            "OFFLINE:",
            socket.id.slice(0,6)
        );
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {

    console.log("SERVER START");
});
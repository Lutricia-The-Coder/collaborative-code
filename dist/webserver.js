"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWebSocketServer = startWebSocketServer;
exports.broadcastMessage = broadcastMessage;
const ws_1 = require("ws");
let wss;
function startWebSocketServer(port) {
    wss = new ws_1.WebSocketServer({ port });
    wss.on("connection", (socket) => {
        console.log("WebSocket client connected");
        socket.send(JSON.stringify({ message: "Connected to code review updates" }));
        socket.on("close", () => {
            console.log("WebSocket client disconnected");
        });
    });
    console.log(`WebSocket server running on ws://localhost:${port}`);
}
function broadcastMessage(message) {
    if (!wss) {
        return;
    }
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

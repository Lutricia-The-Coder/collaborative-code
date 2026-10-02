import { WebSocketServer, WebSocket } from "ws";

let wss: WebSocketServer;

export function startWebSocketServer(port: number) {
    wss = new WebSocketServer({ port });

    wss.on("connection", (socket) => {
        console.log("WebSocket client connected");

        socket.send(JSON.stringify({message: "Connected to code review updates"}));
        socket.on("close", () => {
            console.log("WebSocket client disconnected");
        });
    });
    console.log(`WebSocket server running on ws://localhost:${port}`);
}

export function broadcastMessage(message: object) {
    if (!wss) {
        return;
    }
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
} 
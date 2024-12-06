import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid'; // Install UUID package

enum Type {
    Join = "Join",
    Chat = "Chat",
}

interface message {
    type: Type.Chat | Type.Join;
    payload: {
        message: string;
    };
}

interface SaveSocket {
    Socket: WebSocket;
    RoomId: string;
    SocketId: string;
}

const wss = new WebSocketServer({ port: 8080 });

wss.on('error', (err) => {
    console.error('WebSocket Server Error:', err);
});

let allSockets: SaveSocket[] = [];

wss.on('connection', (socket) => {
    const socketId = uuidv4(); // Generate a unique ID
    console.log("User connected with ID:", socketId);

    socket.on("message", (rawMessage: Buffer) => {
        try {
             // Convert Buffer to string first
             const messageStr = rawMessage.toString();
             console.log("Raw message received:", messageStr);
 
             const parsedSocket: message = JSON.parse(messageStr);
             console.log("Parsed message:", parsedSocket);
            if (!parsedSocket.type || !parsedSocket.payload || !parsedSocket.payload.message) {
                console.error("Invalid message format");
                return;
            }

            if (parsedSocket.type === Type.Join) {
                const newSocketEntry: SaveSocket = {
                    Socket: socket,
                    RoomId: parsedSocket.payload.message,
                    SocketId: socketId, 
                };

                allSockets.push(newSocketEntry);
                console.log("newSocketEntry=>", newSocketEntry);
                console.log("allSockets=>", allSockets);

                allSockets.forEach((soc) => {
                    if (soc.Socket.readyState === WebSocket.OPEN) {
                        const obj = {
                            msg : "new User Joined the room",
                            socketId: soc.SocketId
                        }
                        soc.Socket.send(JSON.stringify(obj));
                    }
                });
            } else {
                const userRoom = allSockets.find((soc) => soc.Socket === socket)?.RoomId;
                console.log("User's Room ID:", userRoom);

                if (userRoom) {
                    allSockets.forEach((soc) => {
                        if (soc.RoomId === userRoom && soc.Socket.readyState === WebSocket.OPEN) {
                            const obj = {
                                msg : parsedSocket.payload.message,
                                socketId: socketId, 
                            }
                            soc.Socket.send(JSON.stringify(obj));
                        }
                    });
                }
            }
        } catch (err) {
            console.error("Invalid JSON received:", err);
        }
    });

    socket.on('close', () => {
        console.log("User disconnected");
        allSockets = allSockets.filter(soc => soc.Socket !== socket);
    });
});

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importStar(require("ws"));
const uuid_1 = require("uuid"); // Install UUID package
var Type;
(function (Type) {
    Type["Join"] = "Join";
    Type["Chat"] = "Chat";
})(Type || (Type = {}));
const wss = new ws_1.WebSocketServer({ port: 8080 });
wss.on('error', (err) => {
    console.error('WebSocket Server Error:', err);
});
let allSockets = [];
wss.on('connection', (socket) => {
    const socketId = (0, uuid_1.v4)(); // Generate a unique ID
    console.log("User connected with ID:", socketId);
    socket.on("message", (rawMessage) => {
        var _a;
        try {
            // Convert Buffer to string first
            const messageStr = rawMessage.toString();
            console.log("Raw message received:", messageStr);
            const parsedSocket = JSON.parse(messageStr);
            console.log("Parsed message:", parsedSocket);
            if (!parsedSocket.type || !parsedSocket.payload || !parsedSocket.payload.message) {
                console.error("Invalid message format");
                return;
            }
            if (parsedSocket.type === Type.Join) {
                const newSocketEntry = {
                    Socket: socket,
                    RoomId: parsedSocket.payload.message,
                    SocketId: socketId,
                };
                allSockets.push(newSocketEntry);
                console.log("newSocketEntry=>", newSocketEntry);
                console.log("allSockets=>", allSockets);
                allSockets.forEach((soc) => {
                    if (soc.Socket.readyState === ws_1.default.OPEN) {
                        const obj = {
                            msg: "new User Joined the room",
                            socketId: soc.SocketId
                        };
                        soc.Socket.send(JSON.stringify(obj));
                    }
                });
            }
            else {
                const userRoom = (_a = allSockets.find((soc) => soc.Socket === socket)) === null || _a === void 0 ? void 0 : _a.RoomId;
                console.log("User's Room ID:", userRoom);
                if (userRoom) {
                    allSockets.forEach((soc) => {
                        if (soc.RoomId === userRoom && soc.Socket.readyState === ws_1.default.OPEN) {
                            const obj = {
                                msg: parsedSocket.payload.message,
                                socketId: socketId,
                            };
                            soc.Socket.send(JSON.stringify(obj));
                        }
                    });
                }
            }
        }
        catch (err) {
            console.error("Invalid JSON received:", err);
        }
    });
    socket.on('close', () => {
        console.log("User disconnected");
        allSockets = allSockets.filter(soc => soc.Socket !== socket);
    });
});

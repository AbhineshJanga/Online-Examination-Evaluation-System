// public/js/socket.js

// Prevent multiple connections
if (!window.socket) {
    window.socket = io();

    window.socket.on("connect", () => {
        console.log("🟢 Global Socket Connected:", window.socket.id);
    });

    window.socket.on("disconnect", (reason) => {
        console.log("🔴 Socket Disconnected:", reason);
    });
}
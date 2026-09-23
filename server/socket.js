let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      // no-op, room for future presence tracking
    });
  });
}

function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.io has not been initialized yet");
  }
  return ioInstance;
}

/** Broadcast a new announcement to every connected client. */
function broadcastAnnouncement(announcement) {
  if (!ioInstance) return;
  ioInstance.emit("announcement:new", announcement);
}

/** Broadcast a locked/overridden result so the public leaderboard updates live. */
function broadcastResult(payload) {
  if (!ioInstance) return;
  ioInstance.emit("result:update", payload);
}

module.exports = {
  initSocket,
  getIO,
  broadcastAnnouncement,
  broadcastResult,
};

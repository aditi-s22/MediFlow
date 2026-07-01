import { Server } from "socket.io";

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_ORIGIN || "*" },
  });

  io.on("connection", (socket) => {
    // Client sends joinDoctorRoom when Doctor Dashboard or Patient Dashboard mounts.
    // This puts the socket into a named room so queue updates reach only relevant clients.
    socket.on("joinDoctorRoom", (doctorId) => {
      socket.join(`doctor_${doctorId}`);
    });

    // Socket.io automatically removes the socket from all rooms on disconnect.
    // No manual cleanup is needed.
    socket.on("disconnect", () => {});
  });

  return io;
};

export default initSocket;

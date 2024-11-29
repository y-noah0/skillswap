const { connect } = require("mongoose");
const  RoomMessageModel  = require("../backend/models/RoomMessagesModel"); // Adjust the path as necessary
const mongoose = require("mongoose");
const io = require("socket.io")(8800, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

mongoose.connect("mongodb://localhost:27017/yourDatabaseName", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


var activeUsers = [];

io.on("connection", (socket) => {
  // add new user
  socket.on("new-user-add", (newUserId) => {
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({
        userId: newUserId,
        socketId: socket.id,
      });
    }
    console.log("connected user:", activeUsers);
    io.emit("get-users", activeUsers);
  });

  // get message on one
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit("receive-message", data);
    }
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    try {
      io.to(data.roomId).emit("receive_message", data);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("user disconnected:", activeUsers);
    io.emit("get-users", activeUsers);
  });
});

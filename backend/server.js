const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const SkillRoutes = require("./routes/SkillRoutes");
const ChatRoutes = require("./routes/ChatRoutes");
const userRoutes = require("./routes/userRoutes");
const MessageRoutes = require("./routes/MessageRoutes");
const RoomRoutes = require("./routes/RoomRoutes");
const BlogPostRoutes = require("./routes/BlogPostRoutes");
const ServerRoutes = require("./routes/ServerRoutes");
const ChannelRoutes = require("./routes/ChannelRoutes");

mongoose.connect("mongodb://localhost:27017/skillswap").then((res) => {
  app.listen(3000, () => {
    console.log("listening to port: 3000");
  });
});

app.set("view engine", "ejs");

app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(cors());

app.use("/user", authRoutes);
app.use("/chat", ChatRoutes);
app.use("/message", MessageRoutes);
app.use("/skill", SkillRoutes);
app.use("/room", RoomRoutes);
app.use("/blog", BlogPostRoutes);
app.use("/server", ServerRoutes);
app.use("/channel", ChannelRoutes);
app.use(userRoutes);

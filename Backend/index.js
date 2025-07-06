import express from "express"
import mongoose from "mongoose"
import emailRoutes from "./routes/email.js";
import cors from "cors";
import 'dotenv/config';
import morgan from "morgan";
import http from "http";
import { setSocketIO } from "./routes/email.js";

import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors:{
    origin : process.env.FRONTEND_URL
  }
});

setSocketIO(io);

io.on("connection", (socket)=>{
  console.log("a user is connected"+socket.id);

  socket.on("join_inbox", (emailId)=> {
    console.log(`Socket ${socket.id} joined inbox ${emailId}`);
    socket.join(emailId);
  });

  socket.on("disconnect", ()=>{
    console.log("A user disconnected");
  })
})

//TODO : enter the frontend URL for the cors
app.use(cors());
app.use(morgan("combined"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

const port = process.env.PORT || 3000;

app.get("/", (req, res)=>{
  return res.status(200).json({status:"working"});
});

app.use("/api/email", emailRoutes);


mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("MongoDB connected");
  server.listen(port, () => {
    console.log("Server running "+port);
  });
});
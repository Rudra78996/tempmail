import express from "express"
import mongoose from "mongoose"
import emailRoutes from "./routes/email.js";
import cors from "cors";
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());

const port = process.env.PORT || 3000;

app.use("/api/email", emailRoutes);


mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("MongoDB connected");
  app.listen(port, () => {
    console.log("Server running");
  });
});
import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import connectDB from "./db/db.js"
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import scoreRoutes from "./routes/scoreRoutes.js";
import charityRoutes from "./routes/charityRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import drawRoutes from "./routes/drawRoutes.js";
import drawEntryRoutes from "./routes/drawEntryRoutes.js";
import winnerRoutes from "./routes/winnerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
// dotenv config
dotenv.config();

// mongodb config
connectDB()

const app = express();

app.use(express.json());

app.use(cors())


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
// Webhook BEFORE express.json()
app.use("/api/admin", adminRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/draw-entries", drawEntryRoutes);
app.use("/api/winners", winnerRoutes);

app.get("/", (req, res) => {
  res.send("hello world");
});


app.listen(process.env.PORT, () => {
  console.log(`server is running on ${process.env.PORT}`);
});
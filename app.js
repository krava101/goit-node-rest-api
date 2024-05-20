import express from "express";
import router from "./routes/index.js";
import morgan from "morgan";
import cors from "cors";
import 'dotenv/config';
import './server.js';

const app = express();

app.use(morgan("tiny"));
app.use(cors());

app.use('/', router);

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ status, message: message });
});

app.listen(5050, () => {
  console.log("Server is running. Use our API on port: 5050");
});
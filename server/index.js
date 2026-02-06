import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import "dotenv/config";
import routes from "./src/routes/index.js";

// Initialize Supabase (logs connection status)
import "./src/supabase.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1", routes);

const port = process.env.PORT || 5000;

const server = http.createServer(app);

if (process.env.VITE_VERCEL_ENV !== "production" && process.env.NODE_ENV !== "production") {
  server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

export default app;
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
  const envStatus = {
    tmdbBaseUrl: !!process.env.TMDB_BASE_URL,
    tmdbKey: !!process.env.TMDB_KEY,
    supabaseUrl: !!process.env.SUPABASE_URL,
    supabaseKey: !!process.env.SUPABASE_ANON_KEY,
    port: process.env.PORT || 'not set',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VITE_VERCEL_ENV
  };

  console.log("Health Check - Env Status:", envStatus);

  res.status(200).json({
    status: "ok",
    env: envStatus
  });
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
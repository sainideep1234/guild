import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectToDb } from "./config/db.js";
import adminRouter from "./routes/admin.js";
import userRouter from "./routes/user.js";

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.error = () => {};
  console.warn = () => {};
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve uploaded files statically ──────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ── Connect DB & Start ────────────────────────────────────────────────────────
connectToDb();
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

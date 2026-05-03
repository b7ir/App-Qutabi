import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");

function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return { channels: [], exams: [] };
  }
}

function writeDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/channels", (req, res) => {
    const db = readDB();
    res.json(db.channels);
  });

  app.get("/api/exams", (req, res) => {
    const db = readDB();
    res.json(db.exams);
  });

  // Simple Add API with Password check
  app.post("/api/exams", (req, res) => {
    const { password, ...examData } = req.body;
    if (password !== "Bradost@1991") { // تێپەڕەوشەی بنەڕەتی
      return res.status(403).json({ error: "تێپەڕەوشە هەڵەیە" });
    }
    
    const db = readDB();
    const newExam = { id: Date.now().toString(), ...examData };
    db.exams.push(newExam);
    writeDB(db);
    res.status(201).json(newExam);
  });

  app.post("/api/channels", (req, res) => {
    const db = readDB();
    const newChannel = { id: Date.now().toString(), ...req.body };
    db.channels.push(newChannel);
    writeDB(db);
    res.status(201).json(newChannel);
  });

  // Delete Exam API
  app.delete("/api/exams/:id", (req, res) => {
    const { password } = req.body;
    const { id } = req.params;

    if (password !== "1234") {
      return res.status(403).json({ error: "تێپەڕەوشە هەڵەیە" });
    }

    const db = readDB();
    const initialLength = db.exams.length;
    db.exams = db.exams.filter((e: any) => e.id !== id);
    
    if (db.exams.length === initialLength) {
      return res.status(404).json({ error: "ئەسیلەکە نەدۆزرایەوە" });
    }

    writeDB(db);
    res.json({ message: "بە سەرکەوتوویی سڕایەوە" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

// inspection-backend/index.js

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Detection from "./models/Detection.js";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB error:", err));

const uploadsDir = path.resolve("./uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// POST /api/detections
app.post("/api/detections", async (req, res) => {
    try {
    const detection = new Detection(req.body);
    await detection.save();
    res.status(201).json({ message: "Detection saved", detection });
    } catch (err) {
    res.status(400).json({ error: err.message });
    }
});

// GET /api/detections
app.get("/api/detections", async (req, res) => {
    try {
    const query = {};
    if (req.query.name) query.name = req.query.name;
    if (req.query.equipment) query.equipment = req.query.equipment;
    if (req.query.posture) query.posture = req.query.posture;

    const detections = await Detection.find(query).sort({ timestamp: -1 });
    res.json(detections);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
});

// POST /api/upload-frame
app.post("/api/upload-frame", upload.single("frame"), async (req, res) => {
    try {
        const { name, timestamp, posture, equipment, position, camera_id } = req.body;
        if (!name || !timestamp || !posture || !equipment || !position) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        let posObj = position;
        if (typeof position === "string") {
            try {
                posObj = JSON.parse(position);
            } catch {
                return res.status(400).json({ error: "Position must be an object or JSON string" });
            }
        }
        const detection = new Detection({
            name,
            timestamp,
            posture,
            equipment,
            position: posObj,
            camera_id: camera_id || undefined,
            image_path: req.file ? `/uploads/${path.basename(req.file.path)}` : undefined

        });
        await detection.save();
        res.status(201).json({ message: "Frame uploaded and detection saved", detection });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

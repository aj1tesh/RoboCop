// models/Detection.js

import mongoose from "mongoose";

const DetectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    timestamp: { type: Date, required: true },
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true }
    },
    equipment: { type: String, required: true },
    posture: { type: String, required: true },
    camera_id: { type: String, default: "JETSON-01" },
    image_path: { type: String }
});

export default mongoose.model("Detection", DetectionSchema);

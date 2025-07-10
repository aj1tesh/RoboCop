import axios from "axios";
import FormData from "form-data";
import fs from "fs";

async function testUploadFrame() {
    const form = new FormData();
    form.append("name", "Jane Smith");
    form.append("timestamp", new Date().toISOString());
    form.append("position", JSON.stringify({ x: 1.23, y: 4.56 }));
    form.append("equipment", "Hard-Hat");
    form.append("posture", "sitting");
    form.append("camera_id", "JETSON-02");
    form.append("frame", fs.createReadStream("./hh.png")); // Replace with a real image path

    try {
        const res = await axios.post("http://localhost:5000/api/upload-frame", form, {
            headers: form.getHeaders()
        });
        console.log("Response:", res.data);
    } catch (err) {
        if (err.response) {
            console.error("Error:", err.response.data);
        } else {
            console.error("Error:", err.message);
        }
    }
}

testUploadFrame(); 
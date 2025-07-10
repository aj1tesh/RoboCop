import axios from "axios";

async function testPostDetection() {
    const detection = {
        name: "John Doe",
        timestamp: new Date().toISOString(),
        position: { x: 12.34, y: 56.78 },
        equipment: "Hard-Hat",
        posture: "standing",
        camera_id: "JETSON-01"
    };
    try {
        const res = await axios.post("http://localhost:5000/api/detections", detection);
        console.log("Response:", res.data);
    } catch (err) {
        if (err.response) {
            console.error("Error:", err.response.data);
        } else {
            console.error("Error:", err.message);
        }
    }
}

testPostDetection(); 
import socket
import cv2
import numpy as np
from flask import Flask, Response
import threading

app = Flask(__name__)
frame_to_send = None

# 🧠 This function will receive frames over socket from your friend
def socket_receiver():
    global frame_to_send 
    host = '0.0.0.0'  # Listen on all interfaces (LAN accessible)
    port = 9999

    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((host, port))
    server_socket.listen(1)

    print(f"[✅] Waiting for incoming video stream on port {port}...")
    conn, addr = server_socket.accept()
    print(f"[📡] Connected to: {addr}")

    data = b""
    payload_size = 4  # First 4 bytes = frame size

    try:
        while True:
            while len(data) < payload_size:
                packet = conn.recv(4096)
                if not packet:
                    break
                data += packet
            if not data:
                break

            frame_size = int.from_bytes(data[:payload_size], byteorder='big')
            data = data[payload_size:]

            while len(data) < frame_size:
                packet = conn.recv(4096)
                if not packet:
                    break
                data += packet

            frame_data = data[:frame_size]
            data = data[frame_size:]

            frame = cv2.imdecode(np.frombuffer(frame_data, dtype=np.uint8), cv2.IMREAD_COLOR)
            if frame is not None:
                _, jpeg = cv2.imencode('.jpg', frame)
                frame_to_send = jpeg.tobytes()
    except Exception as e:
        print(f"[❌] Socket Error: {e}")
    finally:
        conn.close()
        server_socket.close()
        print("[🔌] Disconnected from sender")

# 🧠 This function streams the MJPEG feed from memory
def generate_mjpeg():
    global frame_to_send
    while True:
        if frame_to_send is not None:
            yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame_to_send + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_mjpeg(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# 🔁 Start both receiver and Flask
if __name__ == "__main__":
    threading.Thread(target=socket_receiver, daemon=True).start()
    app.run(host='0.0.0.0', port=5000, debug=False)

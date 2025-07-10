from flask import Flask, Response
import subprocess

app = Flask(__name__)

@app.route('/video.mp4')
def video():
    cmd = [
        "ffmpeg",
        "-f", "mjpeg",
        "-fflags", "nobuffer",
        "-flags", "low_delay",
        "-strict", "experimental",
        "-re",
        "-i", "http://192.168.0.101:5000/processed",
        "-an",
        "-vcodec", "libx264",
        "-preset", "ultrafast",
        "-tune", "zerolatency",
        "-f", "mp4",
        "-movflags", "frag_keyframe+empty_moov+default_base_moof",
        "pipe:1"
    ]

    def generate():
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        try:
            while True:
                chunk = process.stdout.read(1024)
                if not chunk:
                    break
                yield chunk
        finally:
            process.kill()

    return Response(generate(), mimetype='video/mp4')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

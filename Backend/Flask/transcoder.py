from flask import Flask, Response
import subprocess

app = Flask(__name__)

@app.route('/video.mp4')
def stream_mp4():
    ffmpeg_cmd = [
        'ffmpeg',
        '-i', 'http://192.168.62.13:5000/processed',  # ← your MJPEG feed
        '-f', 'mp4',
        '-vcodec', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
        '-an',
        '-'
    ]

    def generate():
        print("🎬 Transcoding MJPEG to MP4 stream...")
        process = subprocess.Popen(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        try:
            while True:
                chunk = process.stdout.read(1024)
                if not chunk:
                    break
                yield chunk
        except Exception as e:
            print(f"[ERROR] {e}")
        finally:
            process.kill()

    return Response(generate(), mimetype='video/mp4')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)

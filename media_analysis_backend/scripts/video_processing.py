import cv2
import os
import tempfile
from moviepy.editor import VideoFileClip

FRAMES_DIR = "frames"
AUDIO_DIR = "audio"

os.makedirs(FRAMES_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

def process_video(uploaded_file):
    """
    uploaded_file:
      - Flask: request.files["video"]
      - FastAPI: UploadFile
    """

    # -------- SAVE UPLOADED VIDEO TEMPORARILY --------
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        temp_video.write(uploaded_file.read())
        VIDEO_PATH = temp_video.name

    print(f"🎥 Processing uploaded video: {VIDEO_PATH}")

    # -------- FRAME EXTRACTION --------
    cap = cv2.VideoCapture(VIDEO_PATH)

    if not cap.isOpened():
        raise RuntimeError("❌ Cannot open uploaded video")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        raise RuntimeError("❌ Invalid FPS")

    frame_interval = max(int(fps), 1)

    frame_count = 0
    saved_count = 0
    timestamps = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            timestamp = frame_count / fps
            frame_path = os.path.join(FRAMES_DIR, f"frame_{saved_count}.jpg")
            cv2.imwrite(frame_path, frame)
            timestamps.append(timestamp)
            saved_count += 1

        frame_count += 1

    cap.release()
    print(f"✅ Extracted {saved_count} frames")

    # -------- AUDIO EXTRACTION --------
    try:
        clip = VideoFileClip(VIDEO_PATH)
        if clip.audio:
            audio_path = os.path.join(AUDIO_DIR, "audio.wav")
            clip.audio.write_audiofile(audio_path, logger=None)
            print("🔊 Audio extracted")
        else:
            print("⚠️ No audio track found")
        clip.close()
    finally:
        os.remove(VIDEO_PATH)  # cleanup temp file

    return {
        "frames_saved": saved_count,
        "timestamps": timestamps,
        "audio_saved": True
    }
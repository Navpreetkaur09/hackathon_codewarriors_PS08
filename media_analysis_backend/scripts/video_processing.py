import cv2
import os
from moviepy.editor import VideoFileClip
# Updated path: scripts/smple.mp4
VIDEO_PATH = os.path.join("scripts", "smple.mp4")
FRAMES_DIR = "frames"
AUDIO_DIR = "audio"
# Ensure output directories exist
os.makedirs(FRAMES_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)
# -------- FRAME EXTRACTION --------
print(f"Trying to open video at: {os.path.abspath(VIDEO_PATH)}")
cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    print(f"❌ Error: Video not found at {VIDEO_PATH} or cannot be opened")
    # Debugging info
    if not os.path.exists("scripts"):
        print("⚠️ 'scripts' directory does not exist in the current location.")
    elif not os.path.exists(VIDEO_PATH):
        print(f"⚠️ 'smple.mp4' not found inside 'scripts'.")
    exit()
fps = cap.get(cv2.CAP_PROP_FPS)
if fps <= 0:
    print("❌ Error: Invalid FPS (0 or less).")
    exit()
frame_interval = int(fps)
if frame_interval == 0:
    frame_interval = 1
frame_count = 0
saved_count = 0
timestamps = []
print(f"🎥 Processing video: {VIDEO_PATH}")
print(f"📊 FPS: {fps:.2f}, Frame Interval: {frame_interval}")
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
print(f"✅ Extracted {saved_count} frames to '{FRAMES_DIR}'")
# -------- AUDIO EXTRACTION --------
try:
    clip = VideoFileClip(VIDEO_PATH)
    if clip.audio:
        audio_path = os.path.join(AUDIO_DIR, "audio.wav")
        clip.audio.write_audiofile(audio_path)
        print(f"🔊 Audio extracted successfully to '{audio_path}'")
    else:
        print("⚠️ No audio track found")
    clip.close()
except Exception as e:
    print(f"❌ Error extracting audio: {e}")
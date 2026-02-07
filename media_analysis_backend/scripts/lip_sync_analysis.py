import cv2
import numpy as np
from moviepy.editor import VideoFileClip

VIDEO_PATH = "scripts/smple.mp4"

# -------------------------------
# Step 1: Mouth movement signal
# -------------------------------
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

cap = cv2.VideoCapture(VIDEO_PATH)

mouth_signal = []
frame_count = 0
mouth_frames = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_count += 1
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=3,
        minSize=(60, 60)
    )

    if len(faces) == 0:
        continue

    x, y, w, h = max(faces, key=lambda b: b[2] * b[3])
    mouth_frames += 1

    # Mouth ROI (lower third of face)
    roi = gray[y + int(0.6 * h): y + h, x: x + w]

    if roi.size == 0:
        continue

    mouth_signal.append(np.mean(roi))

cap.release()

print(f"Frames processed: {frame_count}")
print(f"Frames with mouth ROI: {mouth_frames}")

if len(mouth_signal) < 30:
    print("❌ Not enough visual mouth data")
    print("Lip-sync Risk Score: 1.0")
    exit()

mouth_signal = np.array(mouth_signal)
mouth_signal = (mouth_signal - mouth_signal.mean()) / (mouth_signal.std() + 1e-6)

# -------------------------------
# Step 2: Audio energy signal
# -------------------------------
try:
    clip = VideoFileClip(VIDEO_PATH)

    if clip.audio is None:
        raise RuntimeError("No audio track")

    audio = clip.audio.to_soundarray(fps=44100)
    clip.close()

    # Convert to mono
    audio_mono = np.mean(audio, axis=1)

    AUDIO_WINDOW = 2048
    audio_energy = []

    for i in range(0, len(audio_mono), AUDIO_WINDOW):
        window = audio_mono[i:i + AUDIO_WINDOW]
        if len(window) == 0:
            continue
        rms = np.sqrt(np.mean(window ** 2))
        audio_energy.append(rms)

    audio_energy = np.array(audio_energy)

    if len(audio_energy) < 10:
        raise RuntimeError("Audio decode failed")

    audio_energy = (audio_energy - audio_energy.mean()) / (audio_energy.std() + 1e-6)

except Exception as e:
    print(f"⚠️ Audio processing failed: {e}")
    print("Lip-sync Risk Score: 1.0")
    exit()

# -------------------------------
# Step 3: Compare signals
# -------------------------------
min_len = min(len(mouth_signal), len(audio_energy))
mouth_signal = mouth_signal[:min_len]
audio_energy = audio_energy[:min_len]

correlation = np.corrcoef(mouth_signal, audio_energy)[0, 1]
correlation = 0 if np.isnan(correlation) else correlation

# Higher mismatch → higher risk
lip_sync_risk = np.clip(1 - (correlation + 1) / 2, 0, 1)

print(f"🔊 Mouth-Audio Correlation: {correlation:.2f}")
print(f"👄 Lip-sync Risk Score: {lip_sync_risk:.2f}")

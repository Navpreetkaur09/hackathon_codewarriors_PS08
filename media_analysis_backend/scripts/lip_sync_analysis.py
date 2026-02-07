import cv2
import numpy as np
import os
from moviepy.editor import VideoFileClip

# -------------------------------
# Paths
# -------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEO_PATH = os.path.join(SCRIPT_DIR, "smple.mp4")

# -------------------------------
# Parameters
# -------------------------------
FPS_ASSUMED = 30
AUDIO_WINDOW_SIZE = 1024

# -------------------------------
# Load face detector
# -------------------------------
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# -------------------------------
# Step 1: Mouth movement signal
# -------------------------------
cap = cv2.VideoCapture(VIDEO_PATH)

mouth_signal = []

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.3,
        minNeighbors=5
    )

    if len(faces) == 0:
        continue

    # Use largest face
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])

    # Approximate mouth region: lower 40% of face
    mouth_y1 = y + int(0.6 * h)
    mouth_y2 = y + h
    mouth_roi = gray[mouth_y1:mouth_y2, x:x+w]

    if mouth_roi.size == 0:
        continue

    # Mouth movement proxy: pixel intensity variance
    mouth_signal.append(np.var(mouth_roi))

cap.release()

mouth_signal = np.array(mouth_signal)

if len(mouth_signal) < 20:
    print("❌ Not enough visual data")
    exit()

# Normalize
mouth_signal = (mouth_signal - mouth_signal.mean()) / (mouth_signal.std() + 1e-6)

# -------------------------------
# Step 2: Audio energy signal
# -------------------------------
clip = VideoFileClip(VIDEO_PATH)
audio = clip.audio.to_soundarray(fps=44100)
clip.close()

# Convert to mono
audio_mono = np.mean(audio, axis=1)

energy_signal = []

for i in range(0, len(audio_mono), AUDIO_WINDOW_SIZE):
    window = audio_mono[i:i + AUDIO_WINDOW_SIZE]
    if len(window) == 0:
        continue
    rms = np.sqrt(np.mean(window ** 2))
    energy_signal.append(rms)

energy_signal = np.array(energy_signal)

# Normalize
energy_signal = (energy_signal - energy_signal.mean()) / (energy_signal.std() + 1e-6)

# -------------------------------
# Step 3: Align signals
# -------------------------------
min_len = min(len(mouth_signal), len(energy_signal))
mouth_signal = mouth_signal[:min_len]
energy_signal = energy_signal[:min_len]

# -------------------------------
# Step 4: Correlation (NumPy only)
# -------------------------------
correlation = np.corrcoef(mouth_signal, energy_signal)[0, 1]

if np.isnan(correlation):
    correlation = 0.0

correlation = max(0.0, correlation)

# -------------------------------
# Step 5: Lip-sync risk score
# -------------------------------
lip_sync_risk = 1.0 - correlation
lip_sync_risk = float(np.clip(lip_sync_risk, 0.0, 1.0))

# -------------------------------
# Output
# -------------------------------
print("\n--- Lip Sync Analysis ---")
print(f"Correlation score : {correlation:.3f}")
print(f"Lip-sync risk     : {lip_sync_risk:.3f}")

import cv2
import os
import numpy as np

# -------------------------------
# Paths (absolute, VS Code safe)
# -------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEO_PATH = os.path.join(SCRIPT_DIR, "smple.mp4")

# -------------------------------
# Parameters
# -------------------------------
FPS_ASSUMED = 30          # Approx FPS
MIN_FRAMES = 150          # ~5 seconds
HR_LOW = 0.8              # Hz (48 BPM)
HR_HIGH = 3.0             # Hz (180 BPM)

# -------------------------------
# Load face detector
# -------------------------------
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# -------------------------------
# Step 1: Load video
# -------------------------------
cap = cv2.VideoCapture(VIDEO_PATH)

if not cap.isOpened():
    print("❌ Cannot open video:", VIDEO_PATH)
    exit()

green_signal = []
frame_count = 0

# -------------------------------
# Step 2: Process frames
# -------------------------------
while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_count += 1
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.3,
        minNeighbors=5
    )

    if len(faces) == 0:
        continue

    # Use the largest detected face
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    face_roi = frame[y:y+h, x:x+w]

    # Green channel averaging
    green = face_roi[:, :, 1]
    green_signal.append(np.mean(green))

cap.release()

print(f"Frames processed: {frame_count}")
print(f"Signal length: {len(green_signal)}")

if len(green_signal) < MIN_FRAMES:
    print("❌ Not enough frames for rPPG analysis")
    exit()

# -------------------------------
# Step 3: rPPG signal processing
# -------------------------------
signal = np.array(green_signal)

# Remove DC component
signal = signal - np.mean(signal)

# FFT
fft_vals = np.abs(np.fft.rfft(signal))
freqs = np.fft.rfftfreq(len(signal), d=1.0 / FPS_ASSUMED)

# Heart-rate frequency band
band_mask = (freqs >= HR_LOW) & (freqs <= HR_HIGH)
band_fft = fft_vals[band_mask]

if len(band_fft) == 0:
    print("❌ No valid frequency band detected")
    exit()

# -------------------------------
# Step 4: Pulse consistency
# -------------------------------
peak_power = np.max(band_fft)
total_power = np.sum(band_fft) + 1e-6

pulse_consistency = peak_power / total_power
pulse_consistency = float(np.clip(pulse_consistency, 0.0, 1.0))

# -------------------------------
# Step 5: Risk score (0–1)
# -------------------------------
risk_score = 1.0 - pulse_consistency
risk_score = float(np.clip(risk_score, 0.0, 1.0))

# -------------------------------
# Results
# -------------------------------
print("\n--- rPPG Analysis Result ---")
print(f"Pulse consistency : {pulse_consistency:.3f}")
print(f"Risk score        : {risk_score:.3f}")

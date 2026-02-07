import cv2
import numpy as np

# Load face detector
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

def process_video_rppg(VIDEO_PATH):
    cap = cv2.VideoCapture(VIDEO_PATH)

    if not cap.isOpened():
        raise IOError("Cannot open video")

    green_signal = []
    frame_count = 0
    face_found_frames = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # More forgiving face detection
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=3,
            minSize=(60, 60)
        )

        if len(faces) == 0:
            continue

        # Pick largest face
        x, y, w, h = max(faces, key=lambda b: b[2] * b[3])
        face_found_frames += 1

        # Forehead ROI (best for rPPG)
        roi_y1 = y
        roi_y2 = y + h // 4
        roi_x1 = x + w // 4
        roi_x2 = x + 3 * w // 4

        roi = frame[roi_y1:roi_y2, roi_x1:roi_x2]

        if roi.size == 0:
            continue

        # Extract green channel mean
        green_mean = np.mean(roi[:, :, 1])
        green_signal.append(green_mean)

    cap.release()

    print(f"Frames processed: {frame_count}")
    print(f"Frames with face detected: {face_found_frames}")
    print(f"Signal length: {len(green_signal)}")

    # -------------------------------
    # rPPG analysis
    # -------------------------------
    if len(green_signal) < 60:
        print("❌ Not enough frames for rPPG analysis")
        return None

    signal = np.array(green_signal)
    signal = (signal - signal.mean()) / (signal.std() + 1e-6)

    fft = np.abs(np.fft.rfft(signal))
    freqs = np.fft.rfftfreq(len(signal), d=1 / 30)

    # Human heart rate band (0.75–3 Hz)
    mask = (freqs >= 0.75) & (freqs <= 3.0)

    if np.sum(mask) == 0:
        print("❌ No valid frequency band detected")
        return None

    pulse_strength = np.max(fft[mask]) / (np.mean(fft) + 1e-6)

    # Normalize to 0–1 risk
    risk_score = np.clip(1 - pulse_strength / 5.0, 0, 1)

    print(f"❤️ rPPG Risk Score: {risk_score:.2f}")
    return risk_score
import cv2
import numpy as np
import os

def gan_frequency_risk(video_path, max_frames=120):
    """
    Detects GAN-related frequency artifacts in video frames.
    Returns a risk score between 0 and 1.
    """

    # ---------- PATH CHECK ----------
    if not os.path.exists(video_path):
        print("❌ Video file not found:", video_path)
        return 0.0

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print("❌ OpenCV cannot open the video")
        return 0.0

    fft_energies = []
    frame_count = 0

    while frame_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break

        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Resize for stable FFT
        gray = cv2.resize(gray, (256, 256))

        # 2D FFT
        fft = np.fft.fft2(gray)
        fft_shift = np.fft.fftshift(fft)
        magnitude = np.log(np.abs(fft_shift) + 1e-8)

        # Radial frequency analysis
        h, w = magnitude.shape
        cy, cx = h // 2, w // 2

        y, x = np.ogrid[:h, :w]
        radius = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)

        high_freq_mask = radius > min(h, w) * 0.25

        high_freq_energy = np.mean(magnitude[high_freq_mask])
        total_energy = np.mean(magnitude)

        fft_energies.append(high_freq_energy / (total_energy + 1e-6))
        frame_count += 1

    cap.release()

    if len(fft_energies) < 20:
        print("⚠️ Not enough visual data for frequency analysis")
        return 0.0

    fft_energies = np.array(fft_energies)

    energy_std = np.std(fft_energies)
    energy_mean = np.mean(fft_energies)

    # GANs often produce overly consistent frequency patterns
    consistency_score = energy_mean / (energy_std + 1e-6)

    # Normalize to 0–1
    risk_score = np.clip((consistency_score - 1.0) / 3.0, 0, 1)

    return float(risk_score)
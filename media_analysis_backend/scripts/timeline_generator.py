import cv2
import json
import math
import os
import hashlib
import time


def get_video_duration(video_path):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    cap.release()

    if fps == 0:
        return 0

    return frames / fps


def assign_risk(score):
    if score < 0.3:
        return "green"
    elif score < 0.6:
        return "yellow"
    return "red"


def generate_explanation(level):
    if level == "green":
        return "No significant manipulation indicators detected."
    elif level == "yellow":
        return "Minor inconsistencies detected in this segment."
    return "Strong manipulation indicators detected."


def generate_timeline(video_path, segment_length=2):
    duration = get_video_duration(video_path)
    segments = math.ceil(duration / segment_length)

    timeline = []

    for i in range(segments):
        start = round(i * segment_length, 2)
        end = round(min(start + segment_length, duration), 2)

        # TEMP risk score (later replaced by ML outputs)
        risk_score = round(abs(math.sin(i)) * 0.85, 2)
        risk_level = assign_risk(risk_score)

        timeline.append({
            "segment_id": i + 1,
            "start_time": start,
            "end_time": end,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "confidence_interval": [
                round(max(0, risk_score - 0.05), 2),
                round(min(1, risk_score + 0.05), 2)
            ],
            "explanation": generate_explanation(risk_level)
        })

    return timeline


def save_timeline(video_path):
    os.makedirs("outputs", exist_ok=True)

    timeline = generate_timeline(video_path)

    with open("outputs/timeline.json", "w") as f:
        json.dump(timeline, f, indent=4)

    return timeline
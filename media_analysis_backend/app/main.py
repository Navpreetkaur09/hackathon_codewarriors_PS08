# 1️⃣ IMPORTS (top of file)
from fastapi import FastAPI, UploadFile, File
import shutil
import os

from scripts.video_processing import extract_frames
from scripts.face_extraction import extract_faces
from scripts.rppg_analysis import compute_rppg_risk
from scripts.lip_sync_analysis import compute_lip_sync_risk
from scripts.gan_frequency_analysis import compute_gan_risk
from scripts.risk_fusion import combine_risk_scores
from scripts.timeline_generator import generate_timeline
from scripts.forensic_report import generate_forensic_report


# 2️⃣ APP CREATION (entry object)
app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# 3️⃣ ENDPOINTS (written directly below)
@app.post("/analyze")
async def analyze_video(file: UploadFile = File(...)):
    video_path = f"{UPLOAD_DIR}/{file.filename}"

    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    frames_info = extract_frames(video_path)
    face_data = extract_faces(frames_info)

    visual_risk = compute_gan_risk(frames_info)
    biological_risk = compute_rppg_risk(face_data)
    av_sync_risk = compute_lip_sync_risk(video_path)
    fingerprint_risk = 0.3

    credibility, combined_risk = combine_risk_scores(
        visual_risk,
        biological_risk,
        av_sync_risk,
        fingerprint_risk
    )

    timeline = generate_timeline(video_path, combined_risk)

    pdf_path = generate_forensic_report(
        timeline=timeline,
        video_name=file.filename
    )

    return {
        "credibility_score": credibility,
        "timeline": timeline,
        "forensic_report": pdf_path
    }
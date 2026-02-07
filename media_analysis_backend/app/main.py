from fastapi import FastAPI
from app.routes import router

app = FastAPI(title="Media Analysis Backend")

app.include_router(router)
from services.video_processing import extract_frames_and_audio

timestamps = extract_frames_and_audio(
    video_path="uploaded_videos/sample.mp4",
    output_dir="processed_data/sample"
)
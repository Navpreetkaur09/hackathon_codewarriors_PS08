from fastapi import APIRouter, UploadFile, File
from app.utils import save_upload_file, generate_job_id

router = APIRouter()

@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    job_id = generate_job_id()
    file_path = save_upload_file(file, job_id)

    return {
        "job_id": job_id,
        "filename": file.filename,
        "saved_path": file_path,
        "status": "uploaded"
    }
import os
import uuid
from fastapi import UploadFile

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def generate_job_id():
    return str(uuid.uuid4())

def save_upload_file(file: UploadFile, job_id: str):
    extension = file.filename.split(".")[-1]
    filename = f"{job_id}.{extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    return file_path
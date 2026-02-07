from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import hashlib
import time
import os


def generate_signature(data):
    return hashlib.sha256(data.encode()).hexdigest()


def generate_forensic_report(timeline, video_name):
    os.makedirs("outputs", exist_ok=True)
    pdf_path = "outputs/forensic_report.pdf"

    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 16)
    c.drawString(40, height - 40, "FORENSIC VIDEO ANALYSIS REPORT")

    c.setFont("Helvetica", 10)
    c.drawString(40, height - 70, f"Video File: {video_name}")
    c.drawString(40, height - 85, f"Generated On: {time.ctime()}")

    y = height - 120
    c.setFont("Helvetica", 9)

    for segment in timeline:
        if y < 100:
            c.showPage()
            y = height - 50

        c.drawString(40, y, f"Segment {segment['segment_id']} | {segment['start_time']}s - {segment['end_time']}s")
        c.drawString(60, y - 12, f"Risk Level: {segment['risk_level']}  (Score: {segment['risk_score']})")
        c.drawString(60, y - 24, f"Confidence Interval: {segment['confidence_interval']}")
        c.drawString(60, y - 36, f"Explanation: {segment['explanation']}")

        y -= 55

    signature = generate_signature(str(timeline))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(40, 50, f"Digital Signature (SHA-256): {signature}")

    c.save()
    return pdf_path
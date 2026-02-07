import cv2
import os

# Load the face detection model (comes with OpenCV)
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# Get absolute path of THIS script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Image path (must be in same folder as this file)
IMAGE_PATH = os.path.join(SCRIPT_DIR, "face.jpg")

print("Looking for image at:", IMAGE_PATH)

# Read image safely
img = cv2.imread(IMAGE_PATH)

# Check if image loaded
if img is None:
    print("❌ ERROR: Image not found or cannot be opened")
    exit()

print("✅ Image loaded successfully")

# Convert to grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Detect faces
faces = face_cascade.detectMultiScale(
    gray,
    scaleFactor=1.3,
    minNeighbors=5
)

print(f"Detected {len(faces)} face(s)")

# Draw rectangles around faces
for (x, y, w, h) in faces:
    cv2.rectangle(img, (x, y), (x + w, y + h), (255, 0, 0), 2)

# Save output instead of showing (more reliable in VS Code)
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "face_output.jpg")
cv2.imwrite(OUTPUT_PATH, img)

print("✅ Output saved to:", OUTPUT_PATH)

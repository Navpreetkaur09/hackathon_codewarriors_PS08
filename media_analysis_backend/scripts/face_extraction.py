import cv2
import os

# Load the face detection model (comes with OpenCV)
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

def detect_face(IMAGE_PATH):
    print("Looking for image at:", IMAGE_PATH)

    # Read image safely
    img = cv2.imread(IMAGE_PATH)

    # Check if image loaded
    if img is None:
        print("❌ ERROR: Image not found or cannot be opened")
        return

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

    # Save output
    output_dir = "outputs"
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, "face_output.jpg")
    cv2.imwrite(output_path, img)

    print("✅ Output saved to:", output_path)
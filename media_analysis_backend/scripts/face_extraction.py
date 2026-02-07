import cv2

# Load the face detection model (comes with OpenCV)
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# Read an image from the same folder
img = cv2.imread("face.jpg")

# Check if image loaded
if img is None:
    print("ERROR: Image not found. Put face.jpg in the same folder.")
    exit()

# Convert to grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Detect faces
faces = face_cascade.detectMultiScale(
    gray,
    scaleFactor=1.3,
    minNeighbors=5
)

# Draw rectangles around faces
for (x, y, w, h) in faces:
    cv2.rectangle(img, (x, y), (x + w, y + h), (255, 0, 0), 2)

# Show result
cv2.imshow("Face Detection", img)
cv2.waitKey(0)
cv2.destroyAllWindows()

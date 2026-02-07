Frontend (HTML + JS)
        |
        |  HTTP Request (video file)
        v
FastAPI Backend
        |
        ├── Video & Audio Extraction
        ├── Frame Processing
        ├── rPPG Analysis
        └── Credibility Score Calculation
        |
        v
JSON Response (Risk + Score + Timestamps)

project-root/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── services/
│   │       ├── video_processing.py
│   │       └── rppg_analysis.py
│   └── requirements.txt
│
└── frontend/
    └── index.html
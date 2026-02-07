from risk_fusion import segment_risk_scores
from timeline_generator import save_timeline
from forensic_report import generate_forensic_report


def run_full_analysis(video_path):
    """
    This function simulates a full forensic pipeline.
    Later, replace dummy values with real model outputs.
    """

    # ---- TEMP simulated segment-wise risks ----
    visual =      [0.2, 0.4, 0.8, 0.3, 0.6]
    biological =  [0.3, 0.5, 0.7, 0.2, 0.4]
    av_sync =     [0.1, 0.6, 0.9, 0.4, 0.5]
    fingerprint = [0.2, 0.3, 0.6, 0.3, 0.4]

    # ---- Combine risks ----
    combined_segment_risks = segment_risk_scores(
        visual, biological, av_sync, fingerprint
    )

    # ---- Generate timeline JSON ----
    timeline = save_timeline(video_path)

    # Inject combined risk into timeline
    for i, segment in enumerate(timeline):
        if i < len(combined_segment_risks):
            segment["final_risk_score"] = round(combined_segment_risks[i], 2)

    # ---- Generate forensic PDF ----
    generate_forensic_report(timeline, video_path)

    print("✔ Full forensic analysis completed")


if __name__ == "__main__":
    run_full_analysis("uploads/sample.mp4")
# risk_fusion.py
import numpy as np

# -------------------------------
# CONFIGURABLE WEIGHTS
# -------------------------------
WEIGHTS = {
    "visual": 0.30,
    "biological": 0.30,
    "av_sync": 0.20,
    "fingerprint": 0.20
}

def combine_risk_scores(
    visual_risk,
    biological_risk,
    av_sync_risk,
    fingerprint_risk
):
    """
    Inputs: risk scores in range [0, 1]
    Returns:
      - overall credibility score (0–100)
      - combined risk score (0–1)
    """

    combined_risk = (
        WEIGHTS["visual"] * visual_risk +
        WEIGHTS["biological"] * biological_risk +
        WEIGHTS["av_sync"] * av_sync_risk +
        WEIGHTS["fingerprint"] * fingerprint_risk
    )

    combined_risk = float(np.clip(combined_risk, 0, 1))

    # Credibility = inverse of risk
    credibility_score = int((1 - combined_risk) * 100)

    return credibility_score, combined_risk


def segment_risk_scores(
    visual_segments,
    biological_segments,
    av_sync_segments,
    fingerprint_segments
):
    """
    Inputs: lists of risk scores per segment (all same length)
    Output: list of per-segment combined risk scores
    """

    segment_count = min(
        len(visual_segments),
        len(biological_segments),
        len(av_sync_segments),
        len(fingerprint_segments)
    )

    segment_risks = []

    for i in range(segment_count):
        _, risk = combine_risk_scores(
            visual_segments[i],
            biological_segments[i],
            av_sync_segments[i],
            fingerprint_segments[i]
        )
        segment_risks.append(risk)

    return segment_risks
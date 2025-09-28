import os
import sys
import json
import random

# ---------- CONFIG ----------
class_names = ["Heerup", "Kvium", "Rembrandt", "Sheriff"]

# ---------- PREDICT FUNCTION ----------
def predict(img_path):
    if not os.path.exists(img_path):
        return {"error": f"Image file not found: {img_path}"}

    # Generate random classification
    predicted_class = random.choice(class_names)
    confidence = round(random.uniform(60, 99), 2)

    # Generate other metrics
    grain_weight = round(random.uniform(0.2, 1.0), 2)
    gsw = round(random.uniform(-0.5, 1.0), 2)
    psii = round(random.uniform(0.2, 1.0), 2)
    fertilizer = round(random.uniform(0, 1.0), 2)

    # Fertilizer requirement logic
    if fertilizer < 0.5:
        fertilizer_status = "Required"
    elif 0.5 <= fertilizer <= 0.7:
        fertilizer_status = "May be Required"
    else:
        fertilizer_status = "Not Required"

    # Crop health logic
    if fertilizer_status == "Required" or grain_weight < 0.4 or gsw < 0 or psii < 0.3:
        crop_status = "Unhealthy / Diseased"
    else:
        crop_status = "Healthy"

    return {
        "predicted_class": predicted_class,
        "confidence": f"{confidence}%",
        "grain_weight": grain_weight,
        "gsw": gsw,
        "psii": psii,
        "fertilizer_status": fertilizer_status,
        "crop_status": crop_status,
    }

# ---------- MAIN ----------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python app.py <image_path>"}))
        sys.exit(1)

    img_path = sys.argv[1]
    result = predict(img_path)
    print(json.dumps(result, ensure_ascii=False))

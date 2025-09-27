import os
import sys
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# ---------- SUPPRESS TF LOGS ----------
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # ERROR only
tf.get_logger().setLevel('ERROR')

# ---------- CONFIG ----------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "final_model.h5")
class_names = ["Heerup", "Kvium", "Rembrandt", "Sheriff"]

# ---------- LOAD MODEL ----------
try:
    model = load_model(MODEL_PATH, compile=False)
except Exception as e:
    print(json.dumps({"error": f"Could not load model: {str(e)}"}))
    sys.exit(1)

# ---------- PREDICT FUNCTION ----------
def predict(img_path):
    if not os.path.exists(img_path):
        return {"error": f"Image file not found: {img_path}"}

    try:
        # Preprocess image
        img = image.load_img(img_path, target_size=(150, 150))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) / 255.0

        # Get predictions
        predictions = model.predict(img_array, verbose=0)

        if isinstance(predictions, list) and len(predictions) >= 2:
            class_probs = predictions[0][0]
            other_metrics = predictions[1][0]
        else:
            return {"error": "Unexpected model output format."}

        # Classification
        predicted_index = int(np.argmax(class_probs))
        predicted_class = class_names[predicted_index]
        confidence = round(float(np.max(class_probs)) * 100, 2)

        # Other metrics
        grain_weight = round(float(other_metrics[0]), 2)
        gsw = round(float(other_metrics[1]), 2)
        psii = round(float(other_metrics[2]), 2)
        fertilizer = round(float(other_metrics[3]), 2)

        # ---------- Fertilizer requirement logic (CORRECTED) ----------
        if fertilizer < 0.5:
            fertilizer_status = "Required"
        elif 0.5 <= fertilizer <= 0.7:
            fertilizer_status = "May be Required"
        else:
            fertilizer_status = "Not Required"

        # ---------- Crop Health Logic ----------
        if (
            fertilizer_status == "Required"
            or grain_weight < 0.4
            or gsw < 0
            or psii < 0.3
        ):
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

    except Exception as e:
        return {"error": str(e)}

# ---------- MAIN ----------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python app.py <image_path>"}))
        sys.exit(1)

    img_path = sys.argv[1]
    result = predict(img_path)
    print(json.dumps(result, ensure_ascii=False))

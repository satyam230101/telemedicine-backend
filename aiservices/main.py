from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def predict_disease(text):
    text = text.lower()

    if "sugar" in text or "glucose" in text:
        return "Diabetes"
    if "bp" in text or "pressure" in text:
        return "Hypertension"
    if "cholesterol" in text:
        return "Heart Disease"

    return "No major disease detected"


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    content = await file.read()

    try:
        text = content.decode("utf-8")
    except:
        text = ""

    disease = predict_disease(text)

    return {"predicted_disease": disease}
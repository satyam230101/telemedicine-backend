import fs from "fs";
import path from "path";

export const analyzeReport = (filename) => {
  try {
    const filePath = path.join("uploads", filename);
    const text = fs.readFileSync(filePath, "utf-8").toLowerCase();

    if (text.includes("glucose") || text.includes("sugar")) return "Diabetes";
    if (text.includes("bp") || text.includes("blood pressure") || text.includes("hypertension")) return "Hypertension";
    if (text.includes("cholesterol") || text.includes("ldl") || text.includes("hdl")) return "Heart Disease";
    if (text.includes("hemoglobin") || text.includes("anaemia") || text.includes("anemia")) return "Anemia";
    if (text.includes("thyroid") || text.includes("tsh") || text.includes("thyroxine")) return "Thyroid Disorder";
    if (text.includes("creatinine") || text.includes("kidney") || text.includes("renal")) return "Kidney Disease";

    return "No major disease detected";
  } catch (err) {
    console.warn("Could not read file for analysis:", err.message);
    return "Analysis unavailable";
  }
};
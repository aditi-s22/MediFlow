import mongoose from "mongoose";

const predictionLogSchema = new mongoose.Schema(
  {
    symptoms: {
      type: String,
      required: true,
      trim: true,
    },
    predictedDepartment: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
    },
    chosenDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const PredictionLog = mongoose.model("PredictionLog", predictionLogSchema);

export default PredictionLog;

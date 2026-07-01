import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import PredictionLog from "../models/PredictionLog.js";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Clinical symptom keywords by department for dynamic justifications
const DEPT_KEYWORDS = {
  Cardiology: ["chest pain", "chest tightness", "shortness of breath", "heart", "pulse", "palpitations", "pressure", "angina", "blood pressure", "ankles", "feet"],
  Neurology: ["headache", "migraine", "dizziness", "vertigo", "balance", "numbness", "tingling", "vision", "speech", "seizure", "tremor", "weakness"],
  Dermatology: ["rash", "acne", "dry skin", "itchy", "mole", "hives", "eczema", "psoriasis", "blister", "dandruff", "hair", "peeling", "nail"],
  Orthopedics: ["joint", "knee", "backache", "shoulder", "wrist", "ankle", "hip", "neck", "sciatica", "stiffness", "arthritis", "elbow", "bone"],
  ENT: ["sore throat", "ear", "sinus", "nose", "swallow", "hearing", "voice", "nosebleed", "congestion", "cough", "sneezing"],
  Pediatrics: ["child", "baby", "toddler", "infant", "rash", "fever", "colic", "teething", "chickenpox", "wheezing", "vomiting"],
  Gynecology: ["period", "menstrual", "bleeding", "pelvic", "discharge", "itching", "hot flash", "breast", "pregnancy", "cramps"],
  Psychiatry: ["depressed", "anxiety", "panic", "insomnia", "sleep", "mood", "hallucination", "paranoia", "worry", "stress", "fear"],
  Dentistry: ["toothache", "tooth", "gum", "bleeding", "cavity", "jaw", "mouth", "chewing", "decay"],
  "General Medicine": ["fever", "cough", "fatigue", "weakness", "stomach", "nausea", "vomiting", "diarrhea", "reflux", "appetite", "weight", "checkup"]
};

// @route   POST /api/ml/recommend
// @desc    Analyze symptoms, predict department via FastAPI, query and rank specialists
const getRecommendation = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({ message: "Symptom description is required" });
    }

    // 1. Call FastAPI Service
    let prediction;
    try {
      const mlUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";
      const mlRes = await fetch(`${mlUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      if (!mlRes.ok) {
        throw new Error("FastAPI service returned error code");
      }
      prediction = await mlRes.json();
    } catch (err) {
      console.error("FastAPI error:", err.message);
      return res.status(503).json({ message: "Unable to generate a recommendation right now." });
    }

    const { department, confidence } = prediction;

    // Determine Match Category
    let matchCategory = "Low Match";
    if (confidence >= 0.85) {
      matchCategory = "High Match";
    } else if (confidence >= 0.70) {
      matchCategory = "Medium Match";
    }

    // Extract matching symptom keywords for dynamic justifications
    const inputLower = symptoms.toLowerCase();
    const matchedSymptoms = [];
    const keywords = DEPT_KEYWORDS[department] || [];
    keywords.forEach((kw) => {
      if (inputLower.includes(kw)) {
        matchedSymptoms.push(kw);
      }
    });

    if (matchedSymptoms.length === 0) {
      matchedSymptoms.push("general symptoms");
    }

    // 2. Fetch doctors matching the predicted department
    const doctors = await User.find({ role: "doctor", specialization: department });
    if (doctors.length === 0) {
      // Create a log anyway
      const log = await PredictionLog.create({
        symptoms,
        predictedDepartment: department,
        confidence,
        chosenDoctor: null,
      });

      return res.json({
        predictionLogId: log._id,
        department,
        confidence,
        matchCategory,
        matchedSymptoms,
        doctors: [],
        message: "No doctors currently found in the recommended department."
      });
    }

    // 3. Compute active queue lengths for matching doctors today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const doctorIds = doctors.map((d) => d._id);
    const todayAppointments = await Appointment.find({
      doctor: { $in: doctorIds },
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: "confirmed",
      queueNumber: { $ne: null },
    });

    const queueLengths = {};
    doctorIds.forEach((id) => {
      queueLengths[id.toString()] = todayAppointments.filter(
        (a) => a.doctor.toString() === id.toString()
      ).length;
    });

    // 4. Score and Rank Doctors
    const todayDay = DAYS_OF_WEEK[new Date().getDay()];

    const scoredDoctors = doctors.map((doc) => {
      const rating = doc.rating || 4.8;
      const experience = doc.experience || 5;
      const isAvailableToday = doc.availableDays?.includes(todayDay) ? 1.0 : 0.0;
      const queueLength = queueLengths[doc._id.toString()] || 0;

      // Normalizations
      const normalizedRating = rating / 5.0;
      const availabilityScore = isAvailableToday;
      const queueLengthScore = Math.max(0, 10 - queueLength) / 10.0;
      const normalizedExperience = Math.min(1.0, experience / 30.0);

      // Ranking Score formula: 40% Rating, 30% Availability, 20% Queue Length, 10% Experience
      const score =
        0.4 * normalizedRating +
        0.3 * availabilityScore +
        0.2 * queueLengthScore +
        0.1 * normalizedExperience;

      return {
        doctor: doc,
        score,
        queueLength,
        isAvailableToday: isAvailableToday > 0,
      };
    });

    // Sort by final score descending
    scoredDoctors.sort((a, b) => b.score - a.score);

    // 5. Register log in PredictionLog collection
    const log = await PredictionLog.create({
      symptoms,
      predictedDepartment: department,
      confidence,
      chosenDoctor: null,
    });

    // 6. Return response payload
    res.json({
      predictionLogId: log._id,
      department,
      confidence,
      matchCategory,
      matchedSymptoms,
      doctors: scoredDoctors.map((sd) => {
        const docObj = sd.doctor.toObject();
        delete docObj.password;
        return {
          ...docObj,
          rankingScore: sd.score,
          queueLength: sd.queueLength,
          isAvailableToday: sd.isAvailableToday,
        };
      }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/ml/analytics
// @desc    Fetch aggregated ML recommendation analytics for the Admin dashboard
const getMLAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin privileges required" });
    }

    const totalPredictions = await PredictionLog.countDocuments();
    if (totalPredictions === 0) {
      return res.json({
        totalPredictions: 0,
        averageConfidence: 0,
        mostPredictedDepartments: [],
        mostRecommendedDoctors: [],
        mostSearchedSymptoms: [],
        predictionVolumeOverTime: [],
      });
    }

    // 1. Average confidence
    const confidenceAggregate = await PredictionLog.aggregate([
      { $group: { _id: null, avgConf: { $avg: "$confidence" } } },
    ]);
    const averageConfidence = confidenceAggregate[0]?.avgConf || 0;

    // 2. Most predicted departments
    const deptAggregate = await PredictionLog.aggregate([
      { $group: { _id: "$predictedDepartment", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    const mostPredictedDepartments = deptAggregate.map((item) => ({
      department: item._id,
      count: item.count,
    }));

    // 3. Most recommended / chosen doctors
    const docAggregate = await PredictionLog.aggregate([
      { $match: { chosenDoctor: { $ne: null } } },
      { $group: { _id: "$chosenDoctor", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "doctorDetails",
        },
      },
      { $unwind: "$doctorDetails" },
    ]);

    const mostRecommendedDoctors = docAggregate.map((item) => ({
      name: item.doctorDetails.name,
      specialization: item.doctorDetails.specialization,
      count: item.count,
    }));

    // 4. Most searched symptoms (recent searches)
    const recentSearches = await PredictionLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("symptoms predictedDepartment confidence");

    // 5. Prediction volume over time (daily query runs)
    const volumeAggregate = await PredictionLog.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 10 }
    ]);
    const predictionVolumeOverTime = volumeAggregate.map((item) => ({
      date: item._id,
      count: item.count
    }));

    res.json({
      totalPredictions,
      averageConfidence,
      mostPredictedDepartments,
      mostRecommendedDoctors,
      mostSearchedSymptoms: recentSearches,
      predictionVolumeOverTime,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getRecommendation, getMLAnalytics };

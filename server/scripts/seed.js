import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";

dotenv.config();

const SEED_PASSWORD = "changeMe123";

const doctorsData = [
  {
    name: "Dr. Ananya Sharma",
    email: "ananya.sharma@mediflow.com",
    phone: "9876543201",
    gender: "female",
    role: "doctor",
    specialization: "Cardiology",
    experience: 14,
    consultationFee: 1200,
    availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    age: 42,
    qualification: "MBBS, MD, DM (Cardiology)",
    hospitalExperience: "Consultant Cardiologist at Fortis Hospital (5 years), Senior Resident at AIIMS (4 years)",
    languagesSpoken: ["English", "Hindi", "Punjabi"],
    aboutDoctor: "Dedicated Cardiologist with a passion for preventive medicine, cardiac rehabilitation, and non-invasive imaging.",
    availableDays: ["Monday", "Wednesday", "Friday"],
    profilePicture: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
    rating: 4.8,
    reviewCount: 680,
    patientsTreated: 2450,
    hospitalName: "MediFlow Heart & Vascular Institute",
    clinicAddress: "Suite 302, Cardio Wing, MediFlow General Hospital, Sector 62, Noida",
    medicalRegistrationNumber: "MCI-48201",
    biography: "Dr. Ananya Sharma is a highly recognized Cardiologist with over 14 years of clinical experience. After completing her DM in Cardiology from AIIMS New Delhi, she worked extensively in advanced cardiac care, specializing in heart failure management, coronary artery disease, and hypertension. She believes in patient-centric care and emphasizes lifestyle modifications alongside medical treatment.",
    status: "active"
  },
  {
    name: "Dr. Rohan Mehta",
    email: "rohan.mehta@mediflow.com",
    phone: "9876543202",
    gender: "male",
    role: "doctor",
    specialization: "Neurology",
    experience: 18,
    consultationFee: 1500,
    availableSlots: ["10:00 AM", "11:00 AM", "12:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"],
    age: 48,
    qualification: "MBBS, MD, DM (Neurology)",
    hospitalExperience: "Head of Neurology at Max Healthcare (8 years), Senior Consultant at Apollo Hospitals (6 years)",
    languagesSpoken: ["English", "Hindi", "Gujarati"],
    aboutDoctor: "Experienced Neurologist specializing in stroke management, chronic migraines, epilepsy, and neuromuscular disorders.",
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    profilePicture: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop",
    rating: 4.9,
    reviewCount: 920,
    patientsTreated: 3100,
    hospitalName: "MediFlow Neurosciences Center",
    clinicAddress: "Suite 405, Neuro Block, MediFlow General Hospital, Sector 62, Noida",
    medicalRegistrationNumber: "MCI-39102",
    biography: "Dr. Rohan Mehta is an eminent Neurologist with an illustrious career spanning 18 years. He completed his specialization in Neurology from NIMHANS and has been pioneer in implementing advanced stroke protocol programs. Dr. Mehta holds multiple publications in national and international medical journals and is active in community outreach workshops for Parkinson's disease awareness.",
    status: "active"
  },
  {
    name: "Dr. Priya Nair",
    email: "priya.nair@mediflow.com",
    phone: "9876543203",
    gender: "female",
    role: "doctor",
    specialization: "Dermatology",
    experience: 9,
    consultationFee: 800,
    availableSlots: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM", "04:30 PM"],
    age: 36,
    qualification: "MBBS, MD (Dermatology, Venereology & Leprosy)",
    hospitalExperience: "Consultant Dermatologist at Kaya Skin Clinic (4 years), Specialist Resident at KMC Manipal (3 years)",
    languagesSpoken: ["English", "Malayalam", "Tamil", "Hindi"],
    aboutDoctor: "Passionate Dermatologist and Cosmetologist specialized in acne treatment, anti-aging therapies, and clinical skin disorders.",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    profilePicture: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=400&auto=format&fit=crop",
    rating: 4.7,
    reviewCount: 340,
    patientsTreated: 1200,
    hospitalName: "MediFlow Advanced Skin & Laser Center",
    clinicAddress: "Suite 101, Ground Floor, MediFlow General Hospital, Sector 62, Noida",
    medicalRegistrationNumber: "MCI-52194",
    biography: "Dr. Priya Nair has established herself as a trusted name in dermatology over the last 9 years. After finishing her post-graduation from Manipal University, she completed an advanced fellowship in aesthetic dermatology in South Korea. She is known for her clinical acumen in managing persistent eczema, psoriasis, and pediatric skin conditions, ensuring that patient education remains a key pillar of her treatment strategy.",
    status: "active"
  },
  {
    name: "Dr. Arjun Kapoor",
    email: "arjun.kapoor@mediflow.com",
    phone: "9876543204",
    gender: "male",
    role: "doctor",
    specialization: "Orthopedics",
    experience: 16,
    consultationFee: 1000,
    availableSlots: ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"],
    age: 45,
    qualification: "MBBS, MS (Orthopedics), MCh (Joint Reconstructive Surgery)",
    hospitalExperience: "Senior Orthopedic Surgeon at Medanta - The Medicity (6 years), Consultant at Moolchand Hospital (5 years)",
    languagesSpoken: ["English", "Hindi", "Urdu"],
    aboutDoctor: "Specialist Orthopedic Surgeon focusing on joint replacements, sports injuries, arthroscopic surgery, and complex fractures.",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    profilePicture: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop",
    rating: 4.8,
    reviewCount: 550,
    patientsTreated: 2200,
    hospitalName: "MediFlow Bone & Joint Institute",
    clinicAddress: "Suite 211, Orthopedic Block, MediFlow General Hospital, Sector 62, Noida",
    medicalRegistrationNumber: "MCI-27653",
    biography: "Dr. Arjun Kapoor is a skilled orthopedic surgeon with 16 years of expertise in joint reconstructive surgeries and trauma care. He holds a prestigious fellowship in joint replacement from Germany. Dr. Kapoor has successfully performed over 1,500 primary and revision joint replacements. He routinely manages athletic injuries and has consultancies with local sports clubs to optimize recovery timelines.",
    status: "active"
  },
  {
    name: "Dr. Sneha Iyer",
    email: "sneha.iyer@mediflow.com",
    phone: "9876543205",
    gender: "female",
    role: "doctor",
    specialization: "Pediatrics",
    experience: 11,
    consultationFee: 900,
    availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"],
    age: 38,
    qualification: "MBBS, MD (Pediatrics), DCH (Diploma in Child Health)",
    hospitalExperience: "Consultant Pediatrician at Rainbow Children's Hospital (4 years), Attending Physician at Sir Ganga Ram Hospital (3 years)",
    languagesSpoken: ["English", "Tamil", "Hindi"],
    aboutDoctor: "Caring Pediatrician focused on child development, immunizations, childhood nutrition, and acute pediatric illnesses.",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"],
    profilePicture: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?q=80&w=400&auto=format&fit=crop",
    rating: 4.6,
    reviewCount: 410,
    patientsTreated: 1850,
    hospitalName: "MediFlow Mother & Child Center",
    clinicAddress: "Suite 120, Pediatric Wing, MediFlow General Hospital, Sector 62, Noida",
    medicalRegistrationNumber: "MCI-41982",
    biography: "Dr. Sneha Iyer has over 11 years of experience in pediatric medicine, with a particular focus on neonatology and child development assessment. Known for her gentle approach, she coordinates comprehensive growth milestones programs, pediatric immunizations, and asthma management clinic. She takes pride in helping parents navigate the first years of child care with empathy and clear communication.",
    status: "active"
  },
  {
    name: "Dr. Vikram Rao",
    email: "vikram.rao@mediflow.com",
    phone: "9876543206",
    gender: "male",
    role: "doctor",
    specialization: "ENT",
    experience: 13,
    consultationFee: 850,
    availableSlots: ["10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"],
    age: 43,
    qualification: "MBBS, MS (Otolaryngology - Head & Neck Surgery)",
    hospitalExperience: "ENT Consultant at Yashoda Hospital (5 years), Senior Specialist at Columbia Asia (4 years)",
    languagesSpoken: ["English", "Telugu", "Kannada", "Hindi"],
    aboutDoctor: "Dedicated ENT Specialist with expertise in nasal allergy management, hearing disorders, and micro-ear surgeries.",
    availableDays: ["Monday", "Wednesday", "Friday"],
    profilePicture: "https://images.unsplash.com/photo-1582750433449-649352e3ff13?q=80&w=400&auto=format&fit=crop",
    rating: 4.7,
    reviewCount: 290,
    patientsTreated: 1100,
    hospitalName: "MediFlow ENT Care Clinic",
    clinicAddress: "Suite 203, Second Floor, MediFlow General Hospital, Sector 62, Noida",
    medicalRegistrationNumber: "MCI-31295",
    biography: "Dr. Vikram Rao is an accomplished ENT Surgeon with 13 years of clinical practice. His surgical interest lies in endoscopic sinus surgery, tympanoplasty, and voice disorders. Dr. Rao uses the latest diagnostic tools for early detection of pediatric hearing loss and runs a specialized clinic for allergic rhinitis. He is a member of the Association of Otolaryngologists of India.",
    status: "active"
  },
  {
    name: "Dr. Neha Desai",
    email: "neha.desai@mediflow.com",
    phone: "9876543207",
    gender: "female",
    role: "doctor",
    specialization: "Gynecology",
    experience: 12,
    consultationFee: 1100,
    availableSlots: ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "03:30 PM", "05:00 PM"],
    age: 40,
    qualification: "MBBS, MS (Obstetrics & Gynecology), DNB, FMAS (Fellow in Minimal Access Surgery)",
    hospitalExperience: "Senior Obstetrician at Cloudnine Hospitals (6 years), Consultant at Apollo Cradle (3 years)",
    languagesSpoken: ["English", "Hindi", "Marathi"],
    aboutDoctor: "Experienced Gynecologist specializing in high-risk pregnancies, minimal access laparoscopic surgeries, and adolescent health.",
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    profilePicture: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?q=80&w=400&auto=format&fit=crop",
    rating: 4.9,
    reviewCount: 730,
    patientsTreated: 2800,
    hospitalName: "MediFlow Women's Health Pavilion",
    clinicAddress: "Suite 310, Gynecology Block, MediFlow General Hospital, Sector 62, Noida",
    medicalRegistrationNumber: "MCI-45890",
    biography: "Dr. Neha Desai is a compassionate Gynecologist and Obstetrician with over 12 years of clinical excellence. She specializes in laparoscopic gynecological surgeries, menopause management, and high-risk pregnancy counseling. She believes in empowering women through preventive screening programs for cervical cancer and offers dedicated adolescent health consultations to foster long-term health education.",
    status: "active"
  },
  {
    name: "Dr. Karan Malhotra",
    email: "karan.malhotra@mediflow.com",
    phone: "9876543208",
    gender: "male",
    role: "doctor",
    specialization: "Dentistry",
    experience: 8,
    consultationFee: 600,
    availableSlots: ["10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"],
    age: 35,
    qualification: "BDS, MDS (Orthodontics and Dentofacial Orthopedics)",
    hospitalExperience: "Senior Dentist at Clove Dental (4 years), Resident Dentist at PGIMS Rohtak (3 years)",
    languagesSpoken: ["English", "Hindi", "Punjabi"],
    aboutDoctor: "Orthodontist and General Dentist specializing in dental alignments, painless root canals, and cosmetic dental treatments.",
    availableDays: ["Tuesday", "Wednesday", "Thursday", "Saturday"],
    profilePicture: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop",
    rating: 4.6,
    reviewCount: 180,
    patientsTreated: 750,
    hospitalName: "MediFlow Dental Clinic",
    clinicAddress: "Suite 104, Ground Floor, MediFlow General Hospital, Sector 62, Noida",
    medicalRegistrationNumber: "DCI-19803",
    biography: "Dr. Karan Malhotra is an expert Dentist and Orthodontist with 8 years of practice. He specializes in designing modern aligners, cosmetic smile makeovers, and laser-assisted dental therapies. Dr. Malhotra advocates for preventive oral hygiene and works closely with schools to conduct dental checkup and awareness campaigns for children. He maintains a friendly, anxiety-free atmosphere in his clinic.",
    status: "active"
  },
  {
    name: "Dr. Meera Joshi",
    email: "meera.joshi@mediflow.com",
    phone: "9876543209",
    gender: "female",
    role: "doctor",
    specialization: "Psychiatry",
    experience: 17,
    consultationFee: 1300,
    availableSlots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"],
    age: 46,
    qualification: "MBBS, MD (Psychiatry), DPM (Diploma in Psychological Medicine)",
    hospitalExperience: "Senior Consultant at IHBAS Delhi (7 years), Head of Psychiatry Department at Fortis Healthcare (5 years)",
    languagesSpoken: ["English", "Hindi", "Marathi", "Gujarati"],
    aboutDoctor: "Compassionate Psychiatrist specializing in stress management, anxiety disorders, cognitive behavioral therapy, and child psychology.",
    availableDays: ["Wednesday", "Thursday", "Friday"],
    profilePicture: "https://images.unsplash.com/photo-1651008011612-e70841f9a51b?q=80&w=400&auto=format&fit=crop",
    rating: 4.8,
    reviewCount: 640,
    patientsTreated: 2100,
    hospitalName: "MediFlow Mental Health Clinic",
    clinicAddress: "Suite 222, Second Floor, MediFlow General Hospital, Sector 62, Noida",
    medicalRegistrationNumber: "MCI-37651",
    biography: "Dr. Meera Joshi is a highly respected Psychiatrist with 17 years of dedication to mental health. After graduating from Grant Medical College Mumbai, she has focused on comprehensive mental health plans combining therapy and medication. She manages advanced stress management, panic disorder, adult ADHD, and family counseling. She is a strong advocate for removing the stigma surrounding mental health in India.",
    status: "active"
  },
  {
    name: "Dr. Aditya Kulkarni",
    email: "aditya.kulkarni@mediflow.com",
    phone: "9876543210",
    gender: "male",
    role: "doctor",
    specialization: "General Medicine",
    experience: 20,
    consultationFee: 700,
    availableSlots: ["08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"],
    age: 50,
    qualification: "MBBS, MD (General Medicine)",
    hospitalExperience: "Director of Internal Medicine at Max Hospital (7 years), Senior Physician at Apollo Hospitals (8 years)",
    languagesSpoken: ["English", "Marathi", "Hindi", "Kannada"],
    aboutDoctor: "Senior Consultant Physician offering comprehensive treatment for acute and chronic lifestyle diseases, diabetes, and infections.",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    profilePicture: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?q=80&w=400&auto=format&fit=crop",
    rating: 4.9,
    reviewCount: 1150,
    patientsTreated: 5200,
    hospitalName: "MediFlow Internal Medicine Division",
    clinicAddress: "Suite 110, First Floor, MediFlow General Hospital, Sector 62, Noida",
    medicalRegistrationNumber: "MCI-21948",
    biography: "Dr. Aditya Kulkarni is a leading General Physician with 20 years of rich experience. He has been instrumental in setting up comprehensive diagnostic clinics for managing chronic conditions like Diabetes Mellitus, Hypertension, and Infectious Diseases. He believes in a holistic approach to medicine, focusing on early detection and preventative healthcare programs for corporate clients and local communities.",
    status: "active"
  }
];

const patientsRaw = [
  { name: "Aarav Sharma", email: "aarav.sharma@example.com", phone: "9876543210", gender: "male", age: 28 },
  { name: "Aditya Verma", email: "aditya.verma@example.com", phone: "9876543211", gender: "male", age: 34 },
  { name: "Amit Patel", email: "amit.patel@example.com", phone: "9876543212", gender: "male", age: 45 },
  { name: "Anil Kumar", email: "anil.kumar@example.com", phone: "9876543213", gender: "male", age: 52 },
  { name: "Arjun Singh", email: "arjun.singh@example.com", phone: "9876543214", gender: "male", age: 31 },
  { name: "Devendra Joshi", email: "devendra.joshi@example.com", phone: "9876543215", gender: "male", age: 60 },
  { name: "Girish Nair", email: "girish.nair@example.com", phone: "9876543216", gender: "male", age: 25 },
  { name: "Harish Gupta", email: "harish.gupta@example.com", phone: "9876543217", gender: "male", age: 39 },
  { name: "Kunal Shah", email: "kunal.shah@example.com", phone: "9876543218", gender: "male", age: 29 },
  { name: "Manish Reddy", email: "manish.reddy@example.com", phone: "9876543219", gender: "male", age: 41 },
  { name: "Nitin Rao", email: "nitin.rao@example.com", phone: "9876543220", gender: "male", age: 48 },
  { name: "Pranav Iyer", email: "pranav.iyer@example.com", phone: "9876543221", gender: "male", age: 22 },
  { name: "Rahul Deshmukh", email: "rahul.deshmukh@example.com", phone: "9876543222", gender: "male", age: 33 },
  { name: "Sanjay Mishra", email: "sanjay.mishra@example.com", phone: "9876543223", gender: "male", age: 50 },
  { name: "Suresh Pillai", email: "suresh.pillai@example.com", phone: "9876543224", gender: "male", age: 65 },
  { name: "Vikram Sen", email: "vikram.sen@example.com", phone: "9876543225", gender: "male", age: 37 },
  { name: "Vivek Bhat", email: "vivek.bhat@example.com", phone: "9876543226", gender: "male", age: 27 },
  { name: "Yash Choudhary", email: "yash.choudhary@example.com", phone: "9876543227", gender: "male", age: 23 },
  { name: "Abhishek Bannerjee", email: "abhishek.b@example.com", phone: "9876543228", gender: "male", age: 30 },
  { name: "Sandip Bose", email: "sandip.bose@example.com", phone: "9876543229", gender: "male", age: 43 },
  { name: "Aanya Gupta", email: "aanya.gupta@example.com", phone: "9876543230", gender: "female", age: 26 },
  { name: "Aditi Rao", email: "aditi.rao@example.com", phone: "9876543231", gender: "female", age: 31 },
  { name: "Ananya Hegde", email: "ananya.hegde@example.com", phone: "9876543232", gender: "female", age: 29 },
  { name: "Deepika Padukone", email: "deepika.p@example.com", phone: "9876543233", gender: "female", age: 35 },
  { name: "Divya Nair", email: "divya.nair@example.com", phone: "9876543234", gender: "female", age: 24 },
  { name: "Isha Ambani", email: "isha.a@example.com", phone: "9876543235", gender: "female", age: 38 },
  { name: "Kavita Krishnamurthy", email: "kavita.k@example.com", phone: "9876543236", gender: "female", age: 55 },
  { name: "Meera Bai", email: "meera.bai@example.com", phone: "9876543237", gender: "female", age: 62 },
  { name: "Neha Kakkar", email: "neha.kakkar@example.com", phone: "9876543238", gender: "female", age: 32 },
  { name: "Pooja Hegde", email: "pooja.hegde@example.com", phone: "9876543239", gender: "female", age: 27 },
  { name: "Priya Anand", email: "priya.anand@example.com", phone: "9876543240", gender: "female", age: 33 },
  { name: "Ritu Kumar", email: "ritu.kumar@example.com", phone: "9876543241", gender: "female", age: 49 },
  { name: "Shalini Pandey", email: "shalini.pandey@example.com", phone: "9876543242", gender: "female", age: 25 },
  { name: "Sneha Reddy", email: "sneha.reddy@example.com", phone: "9876543243", gender: "female", age: 40 },
  { name: "Sunita Williams", email: "sunita.williams@example.com", phone: "9876543244", gender: "female", age: 51 },
  { name: "Tanvi Shah", email: "tanvi.shah@example.com", phone: "9876543245", gender: "female", age: 28 },
  { name: "Uma Bharati", email: "uma.bharati@example.com", phone: "9876543246", gender: "female", age: 58 },
  { name: "Vidya Balan", email: "vidya.balan@example.com", phone: "9876543247", gender: "female", age: 42 },
  { name: "Yamini Reddy", email: "yamini.reddy@example.com", phone: "9876543248", gender: "female", age: 36 },
  { name: "Zoya Akhtar", email: "zoya.akhtar@example.com", phone: "9876543249", gender: "female", age: 44 }
];

const specialtySymptoms = {
  "Cardiology": [
    "Chest discomfort and palpitations",
    "High blood pressure monitoring",
    "Post-workout shortness of breath",
    "Routine cardiology review",
    "Cardiovascular risk assessment"
  ],
  "Neurology": [
    "Persistent migraine and dizziness",
    "Chronic tension headaches",
    "Numbness in peripheral extremities",
    "Post-concussion follow-up",
    "Unexplained tremors review"
  ],
  "Dermatology": [
    "Severe cystic acne outbreak",
    "Persistent skin rash and itching",
    "Atypical mole assessment",
    "Scalp scaling and hair loss",
    "Dry eczema patch treatment"
  ],
  "Orthopedics": [
    "Severe knee joint pain",
    "Chronic lower back stiffness",
    "Sprained right ankle review",
    "Shoulder rotator cuff issues",
    "Osteoarthritis checkup"
  ],
  "Pediatrics": [
    "Fever and pediatric cold symptoms",
    "Childhood vaccination milestone",
    "Growth milestones assessment",
    "Allergic cough consult",
    "Infant diet and colic guide"
  ],
  "ENT": [
    "Acute sore throat and ear ache",
    "Chronic sinus congestion",
    "Tinnitus and ringing in ears",
    "Allergic rhinitis consultation",
    "Difficulty swallowing follow-up"
  ],
  "Gynecology": [
    "Routine prenatal trimester checkup",
    "PCOS diagnostic consultation",
    "Irregular menstrual cycle review",
    "Annual gynecological check",
    "Pelvic pain evaluation"
  ],
  "Dentistry": [
    "Toothache and cavity diagnosis",
    "Routine dental scaling and cleaning",
    "Wisdom tooth pain assessment",
    "Bleeding gums consultation",
    "Broken filling replacement"
  ],
  "Psychiatry": [
    "Chronic anxiety and sleep issues",
    "Depression screening and therapy",
    "Corporate stress burnout review",
    "Adult ADHD assessment",
    "Mood swing disorder follow-up"
  ],
  "General Medicine": [
    "General physical exam and checkup",
    "Severe seasonal allergies and cold",
    "Mild indigestion and gastric acidity",
    "Chronic fatigue evaluation",
    "Routine vaccination checkup"
  ]
};

const getRelativeDate = (daysOffset) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d;
};

const runSeeder = async () => {
  try {
    await connectDB();

    console.log("Clearing existing users and appointments...");
    await Appointment.deleteMany({});
    await User.deleteMany({});

    console.log("Seeding Admin account...");
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || SEED_PASSWORD, salt);

    const admin = await User.create({
      name: process.env.ADMIN_NAME || "MediFlow Administrator",
      email: (process.env.ADMIN_EMAIL || "admin@mediflow.com").toLowerCase().trim(),
      password: adminPasswordHashed,
      phone: process.env.ADMIN_PHONE || "9999999999",
      role: "admin",
      gender: "male",
    });
    console.log(`Seeded admin: ${admin.email}`);

    console.log("Seeding Doctors...");
    const doctorPassHashed = await bcrypt.hash(SEED_PASSWORD, salt);
    const seededDoctors = [];

    for (const doc of doctorsData) {
      const docUser = await User.create({
        ...doc,
        password: doctorPassHashed,
      });
      seededDoctors.push(docUser);
    }
    console.log(`Seeded ${seededDoctors.length} doctors.`);

    console.log("Seeding Patients...");
    const seededPatients = [];
    for (const pat of patientsRaw) {
      const patPassHashed = await bcrypt.hash("patient123", salt);
      const patUser = await User.create({
        ...pat,
        role: "patient",
        password: patPassHashed,
      });
      seededPatients.push(patUser);
    }
    console.log(`Seeded ${seededPatients.length} patients.`);

    console.log("Generating 100 realistic appointments...");
    // Let's generate:
    // 50 Past (completed/cancelled)
    // 20 Today (mixed)
    // 15 Tomorrow (confirmed)
    // 15 Next Week (confirmed/cancelled)
    
    // We will distribute the workload:
    // Cardiology (Dr. Ananya Sharma), Neurology (Dr. Rohan Mehta), Orthopedics (Dr. Arjun Kapoor), General Medicine (Dr. Aditya Kulkarni) are busy (60% of appointments)
    // The others are moderate/low.
    
    const busyDoctors = seededDoctors.filter(d => 
      ["Cardiology", "Neurology", "Orthopedics", "General Medicine"].includes(d.specialization)
    );
    const normalDoctors = seededDoctors.filter(d => 
      !["Cardiology", "Neurology", "Orthopedics", "General Medicine"].includes(d.specialization)
    );

    const pickDoctor = () => {
      // 70% chance to pick busy doctor, 30% chance for others
      if (Math.random() < 0.7) {
        return busyDoctors[Math.floor(Math.random() * busyDoctors.length)];
      } else {
        return normalDoctors[Math.floor(Math.random() * normalDoctors.length)];
      }
    };

    const pickPatient = () => {
      return seededPatients[Math.floor(Math.random() * seededPatients.length)];
    };

    const appointmentsToInsert = [];

    // 1. Past appointments: daysOffset -6 to -1 (50 appointments)
    for (let i = 0; i < 50; i++) {
      const doctor = pickDoctor();
      const patient = pickPatient();
      const daysOffset = -Math.floor(Math.random() * 6) - 1; // -1 to -6
      const date = getRelativeDate(daysOffset);
      const time = doctor.availableSlots[Math.floor(Math.random() * doctor.availableSlots.length)];
      const symptoms = specialtySymptoms[doctor.specialization];
      const reason = symptoms[Math.floor(Math.random() * symptoms.length)];
      const status = Math.random() < 0.85 ? "completed" : "cancelled";

      appointmentsToInsert.push({
        patient: patient._id,
        doctor: doctor._id,
        appointmentDate: date,
        appointmentTime: time,
        reason,
        status,
        queueNumber: status === "completed" ? Math.floor(Math.random() * 5) + 1 : null,
      });
    }

    // 2. Today's appointments: daysOffset 0 (20 appointments)
    for (let i = 0; i < 20; i++) {
      const doctor = pickDoctor();
      const patient = pickPatient();
      const date = getRelativeDate(0);
      
      // Select slot
      const time = doctor.availableSlots[Math.floor(Math.random() * doctor.availableSlots.length)];
      const symptoms = specialtySymptoms[doctor.specialization];
      const reason = symptoms[Math.floor(Math.random() * symptoms.length)];
      
      // Status today: completed, confirmed (waiting/serving), or cancelled
      const rand = Math.random();
      let status = "confirmed";
      let queueNumber = null;
      let estimatedWait = null;

      if (rand < 0.4) {
        status = "completed";
        queueNumber = i + 1;
      } else if (rand < 0.9) {
        status = "confirmed";
        // Check-in status is confirmed. Some checked in (queue number assigned), some not.
        if (Math.random() < 0.7) {
          queueNumber = Math.floor(Math.random() * 8) + 1;
          estimatedWait = queueNumber * 10;
        }
      } else {
        status = "cancelled";
      }

      appointmentsToInsert.push({
        patient: patient._id,
        doctor: doctor._id,
        appointmentDate: date,
        appointmentTime: time,
        reason,
        status,
        queueNumber,
        estimatedWait,
      });
    }

    // 3. Tomorrow's appointments: daysOffset 1 (15 appointments)
    for (let i = 0; i < 15; i++) {
      const doctor = pickDoctor();
      const patient = pickPatient();
      const date = getRelativeDate(1);
      const time = doctor.availableSlots[Math.floor(Math.random() * doctor.availableSlots.length)];
      const symptoms = specialtySymptoms[doctor.specialization];
      const reason = symptoms[Math.floor(Math.random() * symptoms.length)];

      appointmentsToInsert.push({
        patient: patient._id,
        doctor: doctor._id,
        appointmentDate: date,
        appointmentTime: time,
        reason,
        status: "confirmed",
      });
    }

    // 4. Next Week's appointments: daysOffset 2 to 7 (15 appointments)
    for (let i = 0; i < 15; i++) {
      const doctor = pickDoctor();
      const patient = pickPatient();
      const daysOffset = Math.floor(Math.random() * 6) + 2; // 2 to 7
      const date = getRelativeDate(daysOffset);
      const time = doctor.availableSlots[Math.floor(Math.random() * doctor.availableSlots.length)];
      const symptoms = specialtySymptoms[doctor.specialization];
      const reason = symptoms[Math.floor(Math.random() * symptoms.length)];
      const status = Math.random() < 0.9 ? "confirmed" : "cancelled";

      appointmentsToInsert.push({
        patient: patient._id,
        doctor: doctor._id,
        appointmentDate: date,
        appointmentTime: time,
        reason,
        status,
      });
    }

    await Appointment.insertMany(appointmentsToInsert);
    console.log(`Seeded ${appointmentsToInsert.length} appointments successfully.`);

    console.log("Database seeded successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed database:", error);
    process.exit(1);
  }
};

runSeeder();

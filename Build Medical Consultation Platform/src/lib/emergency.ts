// Red-flag patterns for emergency detection on consultation submission.
// If matched, show an immediate emergency banner before the form submits.

const EMERGENCY_PATTERNS_AR = [
  "ألم في الصدر",
  "ضيق في التنفس",
  "نزيف حاد",
  "نزيف شديد",
  "فقدان الوعي",
  "سقط مغشيًا",
  "لا يتنفس",
  "توقف القلب",
  "سكتة دماغية",
  "شلل مفاجئ",
  "تشنجات",
  "انتحار",
  "أفكار انتحارية",
  "إيذاء النفس",
  "ابتلع سمًا",
  "تسمم",
  "حرق شديد",
  "حادث",
  "إصابة بالغة",
  "طارئ",
  "اسعاف",
  "إسعاف",
  "ألم حاد جداً",
]

const EMERGENCY_PATTERNS_EN = [
  "chest pain",
  "can't breathe",
  "cannot breathe",
  "difficulty breathing",
  "severe bleeding",
  "heavy bleeding",
  "loss of consciousness",
  "passed out",
  "not breathing",
  "cardiac arrest",
  "heart attack",
  "stroke",
  "seizure",
  "convulsion",
  "suicidal",
  "want to die",
  "kill myself",
  "overdose",
  "poisoning",
  "severe burn",
  "accident",
  "emergency",
  "unconscious",
  "paralysis",
]

export function detectEmergency(text: string): boolean {
  if (!text || text.trim().length < 3) return false
  const lower = text.toLowerCase()
  return (
    EMERGENCY_PATTERNS_AR.some((p) => lower.includes(p)) ||
    EMERGENCY_PATTERNS_EN.some((p) => lower.includes(p))
  )
}

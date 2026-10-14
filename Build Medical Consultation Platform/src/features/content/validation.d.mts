export function validateContent(input: {
  kind: string
  title: string
  body: string
  category: string
}): {
  ok: boolean
  message: string
}
export function validateVerification(input: {
  name: string
  specialty: string
  license: string
  experience: string | number
  consent: boolean
}): {
  ok: boolean
  message: string
}
type ReportInput = {
  contentId: string
  reason: string
}
export function validateReport(
  input: ReportInput,
): {
  ok: boolean
  message: string
}

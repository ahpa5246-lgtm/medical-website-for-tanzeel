// Closed by default. Browser flags are NOT database permissions.
export const publicPreview = import.meta.env.VITE_PUBLIC_PREVIEW === "true"
export const consultationsEnabled =
  !publicPreview && import.meta.env.VITE_CONSULTATIONS_ENABLED === "true"

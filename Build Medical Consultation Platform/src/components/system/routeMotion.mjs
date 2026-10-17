export function animateRouteEntry(element, preference) {
  if (!element?.animate || preference?.matches) return () => {}
  let animation
  try {
    animation = element.animate(
      [
        { opacity: 0.2, transform: "translateY(6px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 180, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    )
  } catch {
    return () => {}
  }
  let canceled = false
  const cancel = () => {
    if (!canceled) {
      animation.cancel()
      canceled = true
    }
  }
  const onChange = (event) => {
    if (event.matches) cancel()
  }
  preference?.addEventListener?.("change", onChange)
  return () => {
    cancel()
    preference?.removeEventListener?.("change", onChange)
  }
}

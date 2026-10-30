import { type ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Routes, useLocation } from "react-router-dom"

const enter = { opacity: 1, y: 0 }
const exit = { opacity: 0, y: -5 }

export default function AnimatedPublicRoutes({
  children,
}: {
  children: ReactNode
}) {
  const location = useLocation()
  const reduceMotion = Boolean(useReducedMotion())

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        data-page-transition
        data-motion={reduceMotion ? "off" : "on"}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={enter}
        exit={reduceMotion ? undefined : exit}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }
        }
      >
        <Routes location={location}>{children}</Routes>
      </motion.div>
    </AnimatePresence>
  )
}

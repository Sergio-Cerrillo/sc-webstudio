"use client"

import type React from "react"

import { useState, useRef, type ReactNode, useEffect } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useTheme } from "next-themes"

interface RotatingCardProps {
  children: ReactNode
  className?: string
}

export default function RotatingCard({ children, className = "" }: RotatingCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => setMounted(true), [])

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseX = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateXValue = useTransform(mouseY, [-100, 100], [10, -10])
  const rotateYValue = useTransform(mouseX, [-100, 100], [-10, 10])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    x.set(e.clientX - centerX)
    y.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  // Determine dynamic styles safely after mount
  const dynamicStyles = mounted
    ? {
        rotateX: isHovered ? rotateXValue : 0,
        rotateY: isHovered ? rotateYValue : 0,
        transformStyle: "preserve-3d" as const,
      }
    : {
        // Default non-animated state for SSR and pre-mount
        transformStyle: "preserve-3d" as const,
        rotateX: 0,
        rotateY: 0,
      }

  return (
    <motion.div
      ref={ref}
      className={`relative perspective-1000 rounded-xl shadow-lg dark:shadow-2xl transition-shadow duration-300 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={dynamicStyles} // Apply styles determined after mount
      whileHover={{ scale: 1.05 }} // This will apply only client-side, which is fine for hover effects
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

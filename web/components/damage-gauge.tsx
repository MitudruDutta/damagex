"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface DamageGaugeProps {
  grade: string
  confidence: number
}

// Determine if the category indicates damage or normal
const DAMAGE_CATEGORIES = new Set([
  "front breakage",
  "front crushed",
  "rear breakage",
  "rear crushed",
  "breakage",
  "crushed"
])

const isDamaged = (category: string): boolean => {
  return DAMAGE_CATEGORIES.has(category.toLowerCase())
}

// Get color config - pure black and white
const getColorConfig = (confidence: number): { 
  color: string
  glowColor: string
  bgGradient: string
} => {
  // Use white for all categories, vary only the intensity
  if (confidence >= 0.8) {
    return {
      color: "#FFFFFF",
      glowColor: "rgba(255, 255, 255, 0.4)",
      bgGradient: "from-white/20 to-white/5",
    }
  } else if (confidence >= 0.5) {
    return {
      color: "#E0E0E0",
      glowColor: "rgba(224, 224, 224, 0.3)",
      bgGradient: "from-white/15 to-white/5",
    }
  } else {
    return {
      color: "#A0A0A0",
      glowColor: "rgba(160, 160, 160, 0.2)",
      bgGradient: "from-white/10 to-white/5",
    }
  }
}

export function DamageGauge({ grade, confidence }: DamageGaugeProps) {
  const [mounted, setMounted] = useState(false)
  
  // Clamp confidence between 0 and 1 to prevent visual anomalies
  const normalizedConfidence = Math.min(1, Math.max(0, confidence))
  
  const config = getColorConfig(normalizedConfidence)
  const damaged = isDamaged(grade)
  
  // Convert confidence to angle (0-180 degrees for semicircle)
  const angle = normalizedConfidence * 180

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center p-6">
      {/* Background glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-3xl"
        style={{ background: config.glowColor }}
      />

      {/* Gauge container */}
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Background arc */}
        <svg 
          viewBox="0 0 200 100" 
          className="w-full h-full"
        >
          {/* Track */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          {mounted && (
            <motion.path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke={config.color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="283"
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 - (283 * normalizedConfidence) }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
              style={{
                filter: `drop-shadow(0 0 8px ${config.glowColor})`,
              }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="text-3xl font-bold tracking-tighter"
            style={{ color: config.color }}
          >
            {(normalizedConfidence * 100).toFixed(0)}%
          </motion.span>
        </div>

        {/* Needle indicator */}
        {mounted && (
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom"
            initial={{ rotate: -90 }}
            animate={{ rotate: -90 + angle }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            style={{ height: "70px" }}
          >
            <div 
              className="w-1 h-full rounded-full mx-auto"
              style={{ 
                background: `linear-gradient(to top, ${config.color}, transparent)`,
              }}
            />
            <div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
              style={{ 
                background: config.color,
                boxShadow: `0 0 10px ${config.glowColor}`,
              }}
            />
          </motion.div>
        )}
      </div>

      {/* Grade label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        className="mt-6 text-center space-y-2"
      >
        <span
          className={`
            inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider
            bg-gradient-to-r ${config.bgGradient} border
          `}
          style={{ 
            color: config.color,
            borderColor: `${config.color}30`,
          }}
        >
          {grade}
        </span>
        <p className="text-xs text-white/50">
          {damaged ? "Damage Detected" : "No Damage Detected"}
        </p>
      </motion.div>
    </div>
  )
}

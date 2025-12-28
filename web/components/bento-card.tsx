"use client"

import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface BentoCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  className?: string
  glowColor?: "blue" | "orange" | "none"
}

export function BentoCard({ 
  children, 
  className, 
  glowColor = "none",
  ...props 
}: BentoCardProps) {
  const glowStyles = {
    blue: "hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:border-electric-500/30",
    orange: "hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:border-signal-500/30",
    none: "",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-black/40 backdrop-blur-xl border border-white/10",
        "transition-all duration-300",
        glowStyles[glowColor],
        className
      )}
      {...props}
    >
      {/* Top gradient highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {children}
    </motion.div>
  )
}

interface BentoCardHeaderProps {
  label?: string
  title?: string
  icon?: ReactNode
  className?: string
}

export function BentoCardHeader({ label, title, icon, className }: BentoCardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between p-6 pb-4", className)}>
      <div className="space-y-1">
        {label && (
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
            {label}
          </span>
        )}
        {title && (
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
        )}
      </div>
      {icon && (
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
          {icon}
        </div>
      )}
    </div>
  )
}

interface BentoCardContentProps {
  children: ReactNode
  className?: string
}

export function BentoCardContent({ children, className }: BentoCardContentProps) {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  )
}

interface BentoStatCardProps {
  label: string
  value: string | number
  subValue?: string
  icon?: ReactNode
  trend?: "up" | "down" | "neutral"
  className?: string
}

export function BentoStatCard({ 
  label, 
  value, 
  subValue, 
  icon,
  trend = "neutral",
  className 
}: BentoStatCardProps) {
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-foreground/50",
  }

  return (
    <BentoCard className={cn("p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
            {label}
          </span>
          <div className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subValue && (
              <p className={cn("text-sm font-medium", trendColors[trend])}>
                {subValue}
              </p>
            )}
          </div>
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            {icon}
          </div>
        )}
      </div>
    </BentoCard>
  )
}

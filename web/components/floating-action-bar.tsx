"use client"

import { motion } from "framer-motion"
import { ScanLine } from "lucide-react"

interface FloatingActionBarProps {
  onNewScan: () => void
}

export function FloatingActionBar({ onNewScan }: FloatingActionBarProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.5 
      }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <motion.button
        onClick={onNewScan}
        type="button"
        aria-label="Start new scan"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold bg-foreground text-background hover:opacity-90 transition-all shadow-2xl border border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground"
      >
        <ScanLine className="w-5 h-5" />
        <span>New Scan</span>
      </motion.button>
    </motion.div>
  )
}
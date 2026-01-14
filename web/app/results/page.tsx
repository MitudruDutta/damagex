"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Target, 
  Clock, 
  Activity,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Percent,
  ScanLine,
  AlertTriangle,
  ImageOff
} from "lucide-react"
import { DamageGauge } from "@/components/damage-gauge"
import { BentoCard, BentoCardHeader, BentoCardContent, BentoStatCard } from "@/components/bento-card"
import { FlowButton } from "@/components/ui/flow-button"
import Image from "next/image"

interface PredictionResult {
  category: string
  confidence: number
  details?: Record<string, number>
  imageUrl: string
  processingTime?: string
  isValid?: boolean
  warning?: string | null
}

export default function ResultsPage() {
  const router = useRouter()
  const [data, setData] = useState<PredictionResult | null>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const storedData = sessionStorage.getItem("damagex_result")
    if (!storedData) {
      router.replace("/")
      return
    }
    try {
      const parsed = JSON.parse(storedData)
      // Validate required fields exist
      if (!parsed.category || parsed.confidence === undefined || !parsed.imageUrl) {
        console.error("Invalid result data", parsed)
        router.replace("/")
        return
      }
      // Check if imageUrl is a blob URL (which may be stale)
      if (parsed.imageUrl.startsWith("blob:")) {
        console.warn("Blob URL detected - may be stale after navigation")
      }
      setData(parsed)
    } catch (e) {
      console.error("Failed to parse result data", e)
      sessionStorage.removeItem("damagex_result")
      router.replace("/")
    }
  }, [router])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-electric-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Safe access to details with fallback
  const details = data.details || {}
  const detailsCount = Object.keys(details).length

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return { label: "High confidence", trend: "up" as const }
    if (confidence >= 0.5) return { label: "Medium confidence", trend: "neutral" as const }
    return { label: "Low confidence", trend: "down" as const }
  }

  const confidenceLevel = getConfidenceLevel(data.confidence)

  return (
    <div className="min-h-screen pb-24">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>Analysis Complete</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-electric-400">Results</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Damage Classification Report
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-generated classification of your vehicle image
          </p>
        </motion.div>

        {/* Warning Banner - Show if image may not be valid */}
        {data.warning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-500">Image Validation Warning</p>
              <p className="text-sm text-yellow-500/80 mt-1">{data.warning}</p>
            </div>
          </motion.div>
        )}

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Large Image Card - Spans 2 columns and 2 rows */}
          <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-2">
            <BentoCard className="h-full" glowColor="blue">
              <BentoCardHeader 
                label="Analyzed Image"
                title="Input Image"
                icon={<Target className="w-4 h-4" />}
              />
              <BentoCardContent className="pt-4">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-surface-200">
                  {imageError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <ImageOff className="w-12 h-12 mb-2" />
                      <span className="text-sm">Image unavailable</span>
                    </div>
                  ) : (
                    <Image
                      src={data.imageUrl}
                      alt="Analyzed Vehicle"
                      fill
                      className="absolute inset-0 w-full h-full object-cover"
                      unoptimized
                      onError={() => setImageError(true)}
                    />
                  )}
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Damage Grade Gauge - Spans 2 columns */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <BentoCard className="h-full" glowColor="orange">
              <BentoCardHeader
                label="Classification Result"
                title="Predicted Category"
                icon={<Activity className="w-4 h-4" />}
              />
              <BentoCardContent className="flex items-center justify-center py-2">
                <DamageGauge grade={data.category} confidence={data.confidence} />
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Stat Cards - Bottom Row */}
          <motion.div variants={itemVariants}>
            <BentoStatCard
              label="Confidence Score"
              value={`${(data.confidence * 100).toFixed(1)}%`}
              subValue={confidenceLevel.label}
              trend={confidenceLevel.trend}
              icon={<Percent className="w-4 h-4" />}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <BentoStatCard
              label="Top Category"
              value={data.category}
              subValue="Primary classification"
              icon={<CheckCircle className="w-4 h-4" />}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <BentoStatCard
              label="Processing Time"
              value={data.processingTime ? `${data.processingTime}s` : "N/A"}
              subValue="Analysis duration"
              icon={<Clock className="w-4 h-4" />}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <BentoStatCard
              label="Categories Analyzed"
              value={detailsCount > 0 ? detailsCount.toString() : "N/A"}
              subValue="Classification options"
              icon={<Activity className="w-4 h-4" />}
            />
          </motion.div>

          {/* Detailed Breakdown - Full Width (only show if details exist) */}
          {detailsCount > 0 && (
            <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-4">
              <BentoCard>
                <BentoCardHeader
                  label="Classification Details"
                  title="AI Confidence Breakdown"
                  icon={<Sparkles className="w-4 h-4" />}
                />
                <BentoCardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(details)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, score], index) => {
                        const isTop = index === 0
                        const percentage = (score * 100).toFixed(1)
                        
                        return (
                          <motion.div
                            key={category}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${isTop ? 'text-foreground font-semibold' : 'text-foreground'}`}>
                                {category}
                              </span>
                              <span className={`text-sm tabular-nums ${isTop ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                                {percentage}%
                              </span>
                            </div>
                            <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: 0.7 + index * 0.1, ease: "easeOut" }}
                                className={`absolute inset-y-0 left-0 rounded-full ${
                                  isTop 
                                    ? 'bg-foreground' 
                                    : 'bg-foreground/30'
                                }`}
                              />
                            </div>
                            {isTop && (
                              <span className="inline-flex items-center gap-1 text-xs text-foreground">
                                <CheckCircle className="w-3 h-3" />
                                Primary Match
                              </span>
                            )}
                          </motion.div>
                        )
                      })}
                  </div>
                </BentoCardContent>
              </BentoCard>
            </motion.div>
          )}
        </motion.div>

        {/* New Scan Section - Separated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <p className="text-sm text-foreground/50 font-medium">Ready for another analysis?</p>
          <FlowButton
            text="New Scan"
            icon={<ScanLine className="w-4 h-4" />}
            onClick={() => {
              sessionStorage.removeItem("damagex_result")
              router.push("/")
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}

"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ScannerUpload } from "@/components/scanner-upload"
import { AlertCircle, Loader2, Zap, Shield, Clock, ServerOff } from "lucide-react"
import { FlowButton } from "@/components/ui/flow-button"

export default function Home() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking")

  // Check backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api/v1/predict/"
        
        // Parse URL and build health endpoint at root
        const url = new URL(apiUrl, window.location.origin)
        const healthUrl = `${url.origin}/health`
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const response = await fetch(healthUrl, {
          method: "GET",
          signal: controller.signal,
        }).catch(() => null)
        
        clearTimeout(timeoutId)
        
        if (response && response.ok) {
          setBackendStatus("online")
        } else {
          setBackendStatus("offline")
        }
      } catch {
        setBackendStatus("offline")
      }
    }
    
    checkBackend()
    // Re-check every 30 seconds
    const interval = setInterval(checkBackend, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    if (!selectedFile) {
      setFile(null)
      setPreviewUrl("")
      setError(null)
      return
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP).")
      setFile(null)
      setPreviewUrl("")
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.")
      setFile(null)
      setPreviewUrl("")
      return
    }

    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
    setError(null)
  }, [previewUrl])

  const handleAnalyze = async () => {
    if (!file) return

    setIsScanning(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    const startTime = Date.now()

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api/v1/predict/"
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      })

      const contentType = response.headers.get("content-type")
      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.detail || "Analysis failed")
        } else {
          throw new Error(`Server Error: ${response.status} ${response.statusText}`)
        }
      }

      const data = await response.json()
      const endTime = Date.now()
      const processingTime = ((endTime - startTime) / 1000).toFixed(2)
      
      // Convert file to base64 for persistence across navigation
      const reader = new FileReader()
      reader.onloadend = () => {
        try {
          sessionStorage.setItem("damagex_result", JSON.stringify({
            category: data.class || data.category || "Unknown",
            confidence: data.confidence || 0,
            details: data.all_scores || data.details || {},
            imageUrl: reader.result as string, // base64 data URL
            processingTime: processingTime,
            isValid: data.is_valid !== undefined ? data.is_valid : true,
            warning: data.warning || null,
          }))
          router.push("/results")
        } catch (storageErr) {
          console.error("Session storage error:", storageErr)
          setError("Failed to save analysis result locally. Your browser storage might be full.")
        }
      }
      reader.onerror = () => {
        setError("Failed to process image for results page.")
      }
      reader.readAsDataURL(file)

    } catch (err) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Cannot connect to backend server. Please ensure the backend is running.")
      } else {
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      }
    } finally {
      setIsScanning(false)
    }
  }

  const features = [
    { icon: Zap, label: "AI Analysis", desc: "Deep learning powered" },
    { icon: Shield, label: "6 Categories", desc: "Front/Rear damage types" },
    { icon: Clock, label: "Fast", desc: "Seconds to analyze" },
  ]

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Backend Offline Banner */}
      <AnimatePresence>
        {backendStatus === "offline" && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 backdrop-blur-sm shadow-lg text-xs">
              <ServerOff className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Server Offline</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-electric-600/10 text-electric-400 border border-electric-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-electric-500 animate-pulse" />
              Powered by Computer Vision
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter">
              AI-Powered{" "}
              <span className="gradient-text">Vehicle Damage</span>
              <br />
              Analysis
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload a photo of your vehicle and get instant AI damage classification.
            </p>
          </motion.div>

          {/* Scanner Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ScannerUpload
              file={file}
              previewUrl={previewUrl}
              onFileSelect={handleFileSelect}
              isScanning={isScanning}
            />
          </motion.div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="max-w-2xl mx-auto"
              >
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analyze Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center gap-2"
          >
            <FlowButton
              text={isScanning ? "Analyzing..." : backendStatus === "offline" ? "Server Offline" : "Analyze Damage"}
              icon={isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : backendStatus === "offline" ? <ServerOff className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
              onClick={handleAnalyze}
              disabled={!file || isScanning || backendStatus === "offline"}
              className={!file || isScanning || backendStatus === "offline" ? "opacity-50" : ""}
            />
            {backendStatus === "checking" && (
              <span className="text-xs text-muted-foreground">Checking server status...</span>
            )}
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-8 pt-8"
          >
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-foreground/10 border border-foreground/10">
                  <feature.icon className="w-4 h-4 text-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{feature.label}</p>
                  <p className="text-xs text-foreground/50">{feature.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
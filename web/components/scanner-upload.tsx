import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDropzone, FileRejection } from "react-dropzone"
import { Upload, X, Scan, Zap, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ScannerUploadProps {
  onFileSelect: (file: File | null) => void
  isScanning: boolean
  file: File | null
  previewUrl: string | null
}

const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex > 0 && lastDotIndex < filename.length - 1) {
    return filename.substring(lastDotIndex + 1).toUpperCase().trim()
  }
  return 'UNKNOWN'
}

export function ScannerUpload({ 
  onFileSelect, 
  isScanning, 
  file, 
  previewUrl 
}: ScannerUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dropError, setDropError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setDropError(null)
    setIsDragging(false)
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }, [onFileSelect])

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    setIsDragging(false)
    const rejection = fileRejections[0]
    if (rejection) {
      const errorCode = rejection.errors[0]?.code
      if (errorCode === "file-too-large") {
        setDropError("File exceeds 10MB limit")
      } else if (errorCode === "file-invalid-type") {
        setDropError("Invalid file type. Only JPEG, PNG, and WebP are supported.")
      } else {
        setDropError("File could not be uploaded")
      }
    }
  }, [])

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
    noClick: true,
    maxSize: 10 * 1024 * 1024,
    onDragEnter: () => {
      setIsDragging(true)
      setDropError(null)
    },
    onDragLeave: () => setIsDragging(false),
  })

  const handleRemove = () => {
    onFileSelect(null)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        onClick={!file ? open : undefined}
        className={`
          relative overflow-hidden rounded-2xl transition-all duration-300
          ${!file ? 'cursor-pointer' : ''}
          ${isDragging ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`
                relative flex flex-col items-center justify-center p-12 min-h-[320px]
                border-2 border-dashed rounded-2xl transition-all duration-300
                ${isDragging 
                  ? 'border-foreground bg-foreground/10' 
                  : 'border-foreground/20 bg-foreground/[0.03] hover:border-foreground/30 hover:bg-foreground/[0.06]'}
              `}
            >
              <div className="absolute inset-0 grid-pattern opacity-50" />
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative z-10 flex flex-col items-center gap-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-foreground/20 blur-xl rounded-full" />
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-surface-200 to-surface-100 border border-white/10 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-foreground" />
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold tracking-tight">
                    Drop your vehicle image here
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    or click to browse. Supports JPG, PNG, WebP up to 10MB
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {['JPG', 'PNG', 'WebP'].map((type) => (
                    <span
                      key={type}
                      className="px-2.5 py-1 text-xs font-mono text-muted-foreground bg-surface-200 rounded-md border border-white/5"
                    >
                      {type}
                    </span>
                  ))}
                </div>

                {dropError && (
                  <div className="text-sm text-red-500 font-medium">
                    {dropError}
                  </div>
                )}
              </motion.div>

              <AnimatePresence>
                {isDragging && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-foreground/10 border-2 border-foreground rounded-2xl flex items-center justify-center"
                  >
                    <div className="text-foreground flex items-center gap-2 text-lg font-medium">
                      <Zap className="w-5 h-5" />
                      Release to upload
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative rounded-2xl overflow-hidden bg-surface-100 border border-white/10"
            >
              <div className="relative aspect-video w-full">
                {previewUrl && (
                  <Image
                    src={previewUrl}
                    alt="Vehicle preview"
                    fill
                    className="absolute inset-0 w-full h-full object-cover"
                    unoptimized
                  />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                <AnimatePresence>
                  {isScanning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0"
                    >
                      <motion.div
                        initial={{ top: "0%" }}
                        animate={{ 
                          top: ["0%", "96%", "0%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute left-0 right-0 h-1 z-20"
                      >
                        <div className="w-full h-full bg-gradient-to-r from-transparent via-foreground to-transparent" />
                        <div className="absolute inset-0 bg-foreground blur-md opacity-70" />
                      </motion.div>

                      <div className="absolute inset-4 pointer-events-none">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-foreground rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-foreground rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-foreground rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-foreground rounded-br-lg" />
                      </div>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                        <Scan className="w-4 h-4 text-foreground animate-pulse" />
                        <span className="text-sm font-medium text-white">Analyzing...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isScanning && (
                  <button
                    onClick={handleRemove}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-100 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-200 border border-white/5 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded bg-surface-200 font-mono">
                    {getFileExtension(file.name)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
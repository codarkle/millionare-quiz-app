import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface MessageProps {
  message: string
  type?: "info" | "success" | "warning" | "error"
  onClose?: () => void
  duration?: number
}

export function Message({ message, type = "info", onClose, duration = 3000 }: MessageProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!isVisible) return null

  const bgColor = {
    info: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  }[type]

  return (
    <div className="fixed top-4 right-4 z-[100] pointer-events-none">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 min-w-[300px] pointer-events-auto`}>
        <div className="flex-1">{message}</div>
        <button
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className="hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
} 
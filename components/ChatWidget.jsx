"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, X } from "lucide-react"
import { ChatDemo } from "./ChatDemo"

export default function ChatWidget() {
  const [open, setOpen] = useState(false)

  // Fix mobile header visibility + session persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOpen = sessionStorage.getItem('chat-open')
      if (savedOpen !== null) {
        setOpen(JSON.parse(savedOpen))
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('chat-open', JSON.parse(open))
    }
  }, [open])

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full h-14 w-14 shadow-lg z-[1000] border-2 border-background"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* FIXED Chat Popup - Mobile Fullscreen + Proper Header */}
      <div
        className={`
          fixed z-[1000] transition-all duration-300 ease-in-out
          ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
          
          /* Mobile: Fullscreen */
          inset-0 w-full h-dvh
          
          /* Desktop: Fixed position */
          sm:inset-auto sm:bottom-10 sm:right-6 sm:w-[420px] sm:h-[600px] sm:rounded-2xl
        `}
      >
        {/* Chat Container - FIXED HEIGHTS */}
        <div className="w-full h-full sm:h-auto bg-background border sm:border sm:shadow-2xl sm:rounded-2xl overflow-hidden flex flex-col">
          
          {/* Header - ALWAYS VISIBLE */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b bg-background/95 backdrop-blur-sm shrink-0 z-10 sm:border-b-gray-200">
            <span className="font-semibold text-base tracking-tight">Ai Assistant Kas</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat Content - Proper Flex */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <ChatDemo />
          </div>
        </div>
      </div>
    </>
  )
}

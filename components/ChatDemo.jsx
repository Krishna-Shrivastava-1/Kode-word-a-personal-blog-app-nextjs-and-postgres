"use client"

import { useEffect, useRef, useState } from "react"
// ✅ 1. Import the reCAPTCHA hook
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { Chat } from "./Chat"

export function ChatDemo() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isClient, setIsClient] = useState(false) 
  const bottomRef = useRef(null)

  // ✅ 2. Initialize the hook
  const { executeRecaptcha } = useGoogleReCaptcha()

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('chat-messages')
        if (saved) setMessages(JSON.parse(saved))
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('chat-messages', JSON.stringify(messages))
      } catch {}
    }
  }, [messages, isClient])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleInputChange = (e) => setInput(e.target.value)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isGenerating) return

    // ✅ 3. Check if reCAPTCHA is ready
    if (!executeRecaptcha) {
      console.error("reCAPTCHA not ready");
      return;
    }

    const userText = input

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: userText },
    ])

    setInput("")
    setIsGenerating(true)

    try {
      // ✅ 4. Generate the token!
      const token = await executeRecaptcha("chat_submit")

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ 5. Send the token along with the query
        body: JSON.stringify({ 
          query: userText,
          recaptchaToken: token 
        }),
      })

      const data = await res.json()
      
      if (!res.ok) {
         // If blocked by reCAPTCHA, show error
         throw new Error(data.error || "API error")
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data?.data?.answer ?? "No response from server",
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `❌ ${err.message || "Failed to reach AI server"}`,
        },
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  const stop = () => setIsGenerating(false)

  if (!isClient) return null

  return (
    <Chat
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isGenerating={isGenerating}
      stop={stop}
      bottomRef={bottomRef}
    />
  )
}





// "use client"

// import { useEffect, useRef, useState } from "react"
// import { Chat } from "./Chat"

// export function ChatDemo() {
//   // ✅ FIX: Initialize with EMPTY array (same on server/client)
//   const [messages, setMessages] = useState([])
//   const [input, setInput] = useState("")
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [isClient, setIsClient] = useState(false) // ✅ NEW: Track hydration
//   const bottomRef = useRef(null)

//   // ✅ FIX: Load from sessionStorage ONLY after hydration (client-side)
//   useEffect(() => {
//     setIsClient(true)
    
//     if (typeof window !== 'undefined') {
//       try {
//         const saved = sessionStorage.getItem('chat-messages')
//         if (saved) {
//           setMessages(JSON.parse(saved))
//         }
//       } catch {
//         // Ignore parse errors
//       }
//     }
//   }, [])

//   // ✅ Save to sessionStorage (only runs on client)
//   useEffect(() => {
//     if (isClient && typeof window !== 'undefined') {
//       try {
//         sessionStorage.setItem('chat-messages', JSON.stringify(messages))
//       } catch {
//         // Ignore storage errors
//       }
//     }
//   }, [messages, isClient])

//   // auto scroll
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [messages])

//   const handleInputChange = (e) => {
//     setInput(e.target.value)
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!input.trim() || isGenerating) return

//     const userText = input

//     setMessages((prev) => [
//       ...prev,
//       {
//         id: crypto.randomUUID(),
//         role: "user",
//         content: userText,
//       },
//     ])

//     setInput("")
//     setIsGenerating(true)

//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ query: userText }),
//       })

//       if (!res.ok) throw new Error("API error")

//       const data = await res.json()
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: crypto.randomUUID(),
//           role: "assistant",
//           content: data?.data?.answer ?? "No response from server",
//         },
//       ])
//     } catch (err) {
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: crypto.randomUUID(),
//           role: "assistant",
//           content: "❌ Failed to reach AI server",
//         },
//       ])
//     } finally {
//       setIsGenerating(false)
//     }
//   }

//   const stop = () => {
//     setIsGenerating(false)
//   }

//   // ✅ FIX: Don't render until client is hydrated (prevents mismatch)
//   if (!isClient) {
//     return null
//   }

//   return (
//     <Chat
//       messages={messages}
//       input={input}
//       handleInputChange={handleInputChange}
//       handleSubmit={handleSubmit}
//       isGenerating={isGenerating}
//       stop={stop}
//       bottomRef={bottomRef}
//     />
//   )
// }

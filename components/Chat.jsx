"use client"

import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowDown, Sparkles } from "lucide-react"
import { useEffect, useState, useRef, useCallback } from "react"

/* Convert Blog ID text into markdown links */
function processTextWithBlogLinks(text = "") {
  return text.replace(
    /Blog ID:\s*([\w-]+)/gi,
    (_, blogId) => `[View blog](/blog/${blogId})`
  )
}

export function Chat({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isGenerating,
  stop,
  bottomRef,
}) {
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // ✅ FAKE STREAMING STATE
  const [streamingMessage, setStreamingMessage] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const streamIntervalRef = useRef(null)
  const streamTextRef = useRef("")

  // ✅ STREAMING LOGIC
  useEffect(() => {
    if (isGenerating) {
      // Start fake streaming when generating starts
      setIsStreaming(true)
      setStreamingMessage("")
      streamTextRef.current = ""
      
      // Clear any existing interval
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current)
      }

      // Fake stream every 30-80ms (ChatGPT-like speed)
      streamIntervalRef.current = setInterval(() => {
        if (streamTextRef.current.length < 100) {
          // Fast initial burst
          streamTextRef.current += " "
          setStreamingMessage(streamTextRef.current)
        } else if (streamTextRef.current.length < 300) {
          // Medium speed
          streamTextRef.current += "█"
          setStreamingMessage(streamTextRef.current)
        } else {
          // Slow thoughtful typing
          const words = ["thinking...", "let me check...", "interesting...", "analyzing..."]
          const randomWord = words[Math.floor(Math.random() * words.length)]
          streamTextRef.current += randomWord
          setStreamingMessage(streamTextRef.current)
        }
        
        // Auto-scroll during stream
        scrollToBottom()
      }, Math.random() * 50 + 30) // 30-80ms random delay
    } else {
      // Stop streaming when done
      setIsStreaming(false)
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current)
        streamIntervalRef.current = null
      }
    }

    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current)
      }
    }
  }, [isGenerating, scrollToBottom])

  return (
    <div className="relative flex flex-col bg-background h-dvh sm:h-[520px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-24 sm:pb-3">
        {/* Welcome Message */}
        {messages.length === 0 && !isGenerating && (
          <div className="flex flex-col items-center justify-center h-full px-4 py-10 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 blur-xl opacity-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full" />
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl relative">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>
            <div className="max-w-md">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                Hello 👋 I'm <span className="text-blue-600">Kas</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
                Your personal assistant for exploring blogs, finding insights, and discovering content faster.
              </p>
            </div>
          </div>
        )}

        {/* Regular Messages */}
        {messages.map((m, index) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`inline-block max-w-[80%] px-3 py-2 rounded-lg text-sm leading-relaxed break-words ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              <ReactMarkdown
                components={{
                  a: ({ ...props }) => (
                    <a
                      {...props}
                      className="underline font-medium text-blue-600 hover:opacity-80"
                      target={props.href?.startsWith("/") ? "_self" : "_blank"}
                      rel={props.href?.startsWith("/") ? undefined : "noopener noreferrer"}
                    />
                  ),
                  p: ({ ...props }) => <p {...props} className="mb-2 last:mb-0" />,
                }}
              >
                {m.role === "assistant" ? processTextWithBlogLinks(m.content) : m.content}
              </ReactMarkdown>
              {m.sources?.length > 0 && (
                <div className="mt-2 border-t pt-2 text-xs space-y-1">
                  <div className="font-medium text-muted-foreground">Sources:</div>
                  {m.sources.map((s) => (
                    <a key={s.blog_id} href={`/blog/${s.blog_id}`} className="block text-blue-600 hover:underline">
                      {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* ✅ FAKE STREAMING MESSAGE */}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="inline-block max-w-[80%] px-3 py-2 rounded-lg bg-muted text-sm leading-relaxed">
              <ReactMarkdown
                components={{
                  a: ({ ...props }) => (
                    <a
                      {...props}
                      className="underline font-medium text-blue-600 hover:opacity-80"
                      target={props.href?.startsWith("/") ? "_self" : "_blank"}
                      rel={props.href?.startsWith("/") ? undefined : "noopener noreferrer"}
                    />
                  ),
                }}
              >
                {processTextWithBlogLinks(streamingMessage)}
              </ReactMarkdown>
              <div className="mt-2 h-4 flex items-center">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-blink" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll button */}
      <Button
        type="button"
        size="icon"
        variant="secondary"
        onClick={scrollToBottom}
        className="sm:hidden absolute bottom-28 right-4 rounded-full shadow-md"
      >
        <ArrowDown className="h-4 w-4" />
      </Button>

      {/* Input */}
      <form onSubmit={handleSubmit} className="sticky bottom-0 border-t bg-background p-3 flex gap-2 pb-[18px]">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder={messages.length === 0 ? "Ask Kas about your blogs..." : "Ask about your blogs…"}
          disabled={isGenerating}
        />
        {isGenerating ? (
          <Button type="button" variant="destructive" onClick={stop}>
            Stop
          </Button>
        ) : (
          <Button type="submit" disabled={!input.trim()}>
            Send
          </Button>
        )}
      </form>

      {/* ✅ BLINKING CURSOR CSS */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </div>
  )
}

// "use client"

// import ReactMarkdown from "react-markdown"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Loader2, ArrowDown, Sparkles } from "lucide-react"

// /* Convert Blog ID text into markdown links */
// function processTextWithBlogLinks(text = "") {
//   return text.replace(
//     /Blog ID:\s*([\w-]+)/gi,
//     (_, blogId) => `[View blog](/blog/${blogId})`
//   )
// }

// export function Chat({
//   messages,
//   input,
//   handleInputChange,
//   handleSubmit,
//   isGenerating,
//   stop,
//   bottomRef,
// }) {
//   const scrollToBottom = () => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" })
//   }

//   return (
//     <div
//       className="
//         relative flex flex-col bg-background
//         h-dvh sm:h-[520px]
//       "
//     >
//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-24 sm:pb-3">
//         {/* ✅ WELCOME MESSAGE - Shows when no messages */}
//      {messages.length === 0 && !isGenerating && (
//   <div className="flex flex-col items-center justify-center h-full px-4 py-10 text-center">
//     {/* Icon */}
//     <div className="relative mb-6">
//       <div className="absolute inset-0 blur-xl opacity-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full" />
//       <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl relative">
//         <Sparkles className="w-8 h-8 text-white animate-pulse" />
//       </div>
//     </div>

//     {/* Content */}
//     <div className="max-w-md">
//       <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
//         Hello 👋 I’m <span className="text-blue-600">Kas</span>
//       </h2>

//       <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
//         Your personal assistant for exploring blogs, finding insights, and
//         discovering content faster.
//       </p>


//     </div>
//   </div>
// )}


//         {/* Regular Messages */}
//         {messages.map((m) => {
//           const content =
//             m.role === "assistant"
//               ? processTextWithBlogLinks(m.content)
//               : m.content

//           return (
//             <div
//               key={m.id}
//               className={`flex ${
//                 m.role === "user" ? "justify-end" : "justify-start"
//               }`}
//             >
//               <div
//                 className={`inline-block max-w-[80%] px-3 py-2 rounded-lg text-sm leading-relaxed break-words ${
//                   m.role === "user"
//                     ? "bg-primary text-primary-foreground"
//                     : "bg-muted"
//                 }`}
//               >
//                 <ReactMarkdown
//                   components={{
//                     a: ({ ...props }) => (
//                       <a
//                         {...props}
//                         className="underline font-medium text-blue-600 hover:opacity-80"
//                         target={
//                           props.href?.startsWith("/") ? "_self" : "_blank"
//                         }
//                         rel={
//                           props.href?.startsWith("/")
//                             ? undefined
//                             : "noopener noreferrer"
//                         }
//                       />
//                     ),
//                     p: ({ ...props }) => (
//                       <p {...props} className="mb-2 last:mb-0" />
//                     ),
//                   }}
//                 >
//                   {content}
//                 </ReactMarkdown>

//                 {m.sources?.length > 0 && (
//                   <div className="mt-2 border-t pt-2 text-xs space-y-1">
//                     <div className="font-medium text-muted-foreground">
//                       Sources:
//                     </div>
//                     {m.sources.map((s) => (
//                       <a
//                         key={s.blog_id}
//                         href={`/blog/${s.blog_id}`}
//                         className="block text-blue-600 hover:underline"
//                       >
//                         {s.title}
//                       </a>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )
//         })}

//         {isGenerating && (
//           <div className="flex items-center gap-2 text-sm text-muted-foreground">
//             <Loader2 className="h-4 w-4 animate-spin" />
//             AI is typing…
//           </div>
//         )}

//         <div ref={bottomRef} />
//       </div>

//       {/* Scroll to bottom (mobile only) */}
//       <Button
//         type="button"
//         size="icon"
//         variant="secondary"
//         onClick={scrollToBottom}
//         className="sm:hidden absolute bottom-28 right-4 rounded-full shadow-md"
//       >
//         <ArrowDown className="h-4 w-4" />
//       </Button>

//       {/* Input */}
//       <form
//         onSubmit={handleSubmit}
//         className="
//           sticky bottom-0
//           border-t bg-background p-3 flex gap-2
//           pb-[18px]
//         "
//       >
//         <Input
//           value={input}
//           onChange={handleInputChange}
//           placeholder={
//             messages.length === 0 
//               ? "Ask Kas about your blogs..." 
//               : "Ask about your blogs…"
//           }
//           disabled={isGenerating}
//         />
//         {isGenerating ? (
//           <Button
//             type="button"
//             variant="destructive"
//             onClick={stop}
//           >
//             Stop
//           </Button>
//         ) : (
//           <Button type="submit" disabled={!input.trim()}>
//             Send
//           </Button>
//         )}
//       </form>
//     </div>
//   )
// }

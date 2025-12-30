'use client'
import { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'

export default function BlogContentRenderer({ content }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [processedElements, setProcessedElements] = useState([])

  useEffect(() => {
    if (!content) return

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content

    // Remove empty paragraphs BUT KEEP ONES WITH IMAGES
    const paragraphs = tempDiv.querySelectorAll('p')
    paragraphs.forEach(p => {
      // Skip if paragraph contains an image or other media
      if (p.querySelector('img, video, iframe')) {
        return
      }
      
      const text = p.textContent.trim()
      const onlyBr = p.children.length === 1 && p.children[0].tagName === 'BR'
      const isEmpty = text === '' || onlyBr
      
      if (isEmpty) {
        p.remove()
      }
    })

    const codeContainers = tempDiv.querySelectorAll('.ql-code-block-container, pre')
    const codeBlocks = []

    codeContainers.forEach((container, index) => {
      const placeholder = `__CODE_BLOCK_PLACEHOLDER_${index}__`
      let codeText = ''

      if (container.classList.contains('ql-code-block-container')) {
        const lines = container.querySelectorAll('.ql-code-block')
        codeText = Array.from(lines).map(line => line.textContent).join('\n')
      } else {
        codeText = container.textContent || ''
      }

      codeBlocks.push({ placeholder, codeText })
      container.outerHTML = placeholder
    })

    const parts = tempDiv.innerHTML.split(/(__CODE_BLOCK_PLACEHOLDER_\d+__)/)
    
    const elements = parts.map((part, i) => {
      const block = codeBlocks.find(b => b.placeholder === part)
      if (block) {
        return <CodeBlockWithCopy key={i} code={block.codeText} />
      }
      if (!part.trim()) return null
      
      return (
        <div 
          key={i} 
          className="html-content-segment"
          dangerouslySetInnerHTML={{ __html: part }} 
        />
      )
    }).filter(Boolean)

    setProcessedElements(elements)
  }, [content])

  const handleContainerClick = (e) => {
    if (e.target.tagName === 'IMG') {
      setSelectedImage(e.target.src)
    }
  }

  return (
    <>
      <style jsx global>{`
        .blog-render-container {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        /* Heading Styles */
        .blog-render-container h1 { 
          font-size: 2.25rem; 
          font-weight: 700; 
          margin: 1.5rem 0 0.75rem;
          color: #111827;
          line-height: 1.3;
        }
        .blog-render-container h2 { 
          font-size: 1.875rem; 
          font-weight: 700; 
          margin: 1.25rem 0 0.5rem; 
          color: #111827;
          line-height: 1.3;
        }
        .blog-render-container h3 { 
          font-size: 1.5rem; 
          font-weight: 600; 
          margin: 1rem 0 0.5rem;
          color: #111827;
          line-height: 1.4;
        }
        
        .blog-render-container h1:first-child,
        .blog-render-container h2:first-child,
        .blog-render-container h3:first-child {
          margin-top: 0;
        }
        /* Text Alignment Classes - ADD THIS */
.blog-render-container .ql-align-center {
  text-align: center !important;
}

.blog-render-container .ql-align-right {
  text-align: right !important;
}

.blog-render-container .ql-align-left {
  text-align: left !important;
}

.blog-render-container .ql-align-justify {
  text-align: justify !important;
}

        /* Text Styles */
        .blog-render-container p { 
          margin: 0 0 0.85rem 0;
          line-height: 1.6; 
          color: #374151;
          font-size: 1rem;
        }
        
        .blog-render-container p:last-child {
          margin-bottom: 0;
        }
        
        .blog-render-container strong { 
          font-weight: 700; 
          color: #111827; 
        }
        .blog-render-container em {
          font-style: italic;
        }
        .blog-render-container u {
          text-decoration: underline;
        }
        
        /* List Styles */
        .blog-render-container ul { 
          list-style: disc; 
          margin: 0 0 0.85rem 1.5rem;
          padding: 0;
          color: #374151;
        }
        .blog-render-container ol { 
          list-style: decimal; 
          margin: 0 0 0.85rem 1.5rem;
          padding: 0;
          color: #374151;
        }
        .blog-render-container li {
          margin-bottom: 0.25rem;
          line-height: 1.6;
        }
        
        /* Link Styles */
        .blog-render-container a { 
          color: #2563eb; 
          text-decoration: none; 
        }
        .blog-render-container a:hover { 
          text-decoration: underline; 
        }
        
        /* Blockquote */
        .blog-render-container blockquote {
          border-left: 4px solid #2563eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        /* Image Styles */
        .blog-render-container img { 
          max-width: 100% !important; 
          width: auto !important;
          height: auto !important;
          border-radius: 0.75rem !important; 
          cursor: zoom-in !important; 
          margin: 1.25rem auto !important; 
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          display: block !important;
        }
        
        .blog-render-container img:hover {
          transform: scale(1.01);
          transition: transform 0.2s;
        }
        
        /* Content Segment */
        .blog-render-container .html-content-segment { 
          display: block;
        }
        
        .blog-render-container > *:first-child {
          margin-top: 0 !important;
        }
        .blog-render-container > *:last-child {
          margin-bottom: 0 !important;
        }

        /* Add this to your existing <style jsx global> block */

/* Table Wrapper - Must wrap the entire table */
.blog-render-container .quill-better-table-wrapper {
  width: 100%;
  overflow-x: auto;
 
}

/* Table Styles */
.blog-render-container table {
  border-collapse: collapse;
  table-layout: auto; /* Changed from fixed to auto */
  width: 100%;
  border: 1px solid black;
}

.blog-render-container table td,
.blog-render-container table th {
  border: 1px solid black;
  padding: 0.75rem;
  vertical-align: top;
  min-width: 50px;
  max-width: 300px; /* Prevents cells from becoming too wide */
  word-wrap: break-word; /* Break long words */
  word-break: break-word; /* Force break if needed */
  overflow-wrap: break-word; /* Modern alternative */
  hyphens: auto; /* Add hyphens for better breaks */
}

.blog-render-container table th {
  background-color: #f3f4f6;
  font-weight: 600;
  text-align: left;
}

.blog-render-container table tr:nth-child(even) {
  background-color: #f9fafb;
}


      `}</style>

      <div className="blog-render-container" onClick={handleContainerClick}>
        {processedElements.length > 0 ? (
          processedElements
        ) : (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedImage(null)
            }
          }}
        >
          <div className="relative">
            <img 
              src={selectedImage} 
              alt="Zoomed" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2 bg-black/50 rounded-full transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function CodeBlockWithCopy({ code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  return (
   <div className="group relative my-8 rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-2xl transition-all duration-300 hover:border-white/20">
      {/* Header / Top Bar */}
      <div className="flex justify-between items-center px-4 py-3 bg-[#161b22] border-b border-white/5">
        <div className="flex items-center gap-2">
          {/* Mac-style Window Controls */}
          <div className="flex gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] opacity-80" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] opacity-80" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] opacity-80" />
          </div>
          <span className="text-[11px] text-gray-400 font-mono uppercase tracking-[0.1em] font-medium">
            Source Code
          </span>
        </div>

        <button 
          onClick={handleCopy} 
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
            ${copied 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }
          `}
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="relative overflow-x-auto custom-scrollbar">
        {/* Subtle Gradient Glow */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        
        <SyntaxHighlighter
          language="javascript"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            fontSize: '0.95rem',
            backgroundColor: 'transparent',
            lineHeight: '1.7',
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          }}
          wrapLongLines={false}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* Optional: Language Badge (Fixed Bottom Right) */}
      <div className="absolute bottom-2 right-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-white/10 font-mono italic">
          v1.0.4
        </span>
      </div>
    </div>
  )
}





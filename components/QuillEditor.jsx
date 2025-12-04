'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

function getImageUrls(html) {
  if (!html) return []
  const container = document.createElement('div')
  container.innerHTML = html
  const imgs = Array.from(container.querySelectorAll('img'))
  return imgs.map((img) => img.getAttribute('src')).filter(Boolean)
}

export default function QuillEditor({ content = '', onChange }) {
  const quillRef = useRef(null)
  const prevContentRef = useRef(content)

  const deleteImageFromStorage = useCallback(async (imageUrl) => {
    try {
      await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })
      console.log('Deleted from storage:', imageUrl)
    } catch (error) {
      console.error('Storage delete failed:', error)
    }
  }, [])

  const imageHandler = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files[0]
      if (!file) return

      const quill = quillRef.current.getEditor()
      const range = quill.getSelection(true)

      try {
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (data.url) {
          quill.insertEmbed(range.index, 'image', data.url)
          quill.setSelection(range.index + 1)
        } else {
          alert('Image upload failed: ' + (data.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert('Image upload failed')
      }
    }
  }

  const linkHandler = () => {
    const quill = quillRef.current.getEditor()
    const range = quill.getSelection()
    if (!range) return

    const existing = quill.getFormat(range).link || ''
    const url = window.prompt('Enter URL:', existing)

    if (url === null) return
    if (!url.trim()) {
      quill.format('link', false)
      return
    }

    let finalUrl = url.trim()
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl
    }

    quill.format('link', finalUrl)
  }

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      handlers: { 
        image: imageHandler,
        link: linkHandler,
      },
    },
    history: {
      delay: 500,
      maxStack: 200,
      userOnly: true,
    },
  }

  const handleChange = async (html) => {
    const prevHtml = prevContentRef.current || ''
    const prevImages = getImageUrls(prevHtml)
    const newImages = getImageUrls(html)

    const removed = prevImages.filter((url) => !newImages.includes(url))

    for (const url of removed) {
      await deleteImageFromStorage(url)
    }

    prevContentRef.current = html
    if (onChange) onChange(html)
  }

  // ✅ Add copy buttons using MutationObserver
  useEffect(() => {
    if (!quillRef.current) return
    const quill = quillRef.current.getEditor()
    const editorElement = quill.root

    const addCopyButton = (preElement) => {
      // Check if button already exists
      if (preElement.querySelector('.copy-code-btn')) return

      const btn = document.createElement('button')
      btn.className = 'copy-code-btn'
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
      `
      btn.type = 'button'

      btn.onclick = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        const code = preElement.textContent || ''
        
        try {
          await navigator.clipboard.writeText(code)
          btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Copied!</span>
          `
          btn.classList.add('copied')
          
          setTimeout(() => {
            btn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            `
            btn.classList.remove('copied')
          }, 2000)
        } catch (err) {
          console.error('Failed to copy:', err)
        }
      }

      preElement.style.position = 'relative'
      preElement.appendChild(btn)
    }

    const processCodeBlocks = () => {
      // ✅ Target all <pre> elements which Quill uses for code blocks
      const codeBlocks = editorElement.querySelectorAll('pre')
      codeBlocks.forEach(addCopyButton)
    }

    // Initial scan
    processCodeBlocks()

    // ✅ Watch for new code blocks using MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              if (node.tagName === 'PRE') {
                addCopyButton(node)
              }
              // Check children too
              const preElements = node.querySelectorAll?.('pre')
              preElements?.forEach(addCopyButton)
            }
          })
        }
      })
    })

    observer.observe(editorElement, {
      childList: true,
      subtree: true,
    })

    // Cleanup
    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          defaultValue={content}
          onChange={handleChange}
          modules={modules}
          placeholder="Start writing your article..."
          className="quill-editor"
        />
      </div>

      <style jsx global>{`
        .quill-editor .ql-editor {
          min-height: 400px;
          padding: 20px;
          font-size: 16px;
          line-height: 1.6;
        }

        /* Code block styling */
        .quill-editor .ql-editor pre {
          position: relative;
          background: #1e293b !important;
          border-radius: 8px !important;
          padding: 50px 20px 20px 20px !important;
          margin: 20px 0 !important;
          overflow-x: auto;
          border: 1px solid #334155;
          color: #e2e8f0 !important;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
        }

        /* Copy button styling */
        .copy-code-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #374151;
          color: #e5e7eb;
          border: 1px solid #4b5563;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
          font-family: system-ui, -apple-system, sans-serif !important;
        }

        .copy-code-btn:hover {
          background: #4b5563;
          border-color: #6b7280;
          transform: translateY(-1px);
        }

        .copy-code-btn:active {
          transform: translateY(0);
        }

        .copy-code-btn.copied {
          background: #059669;
          border-color: #10b981;
        }

        .copy-code-btn svg {
          flex-shrink: 0;
        }

        /* Image styling */
        .quill-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
          display: block;
          border: 2px solid transparent;
          transition: 0.2s ease;
        }

        .quill-editor .ql-editor img:hover {
          border-color: #dc3545;
          box-shadow: 0 4px 20px rgba(220, 53, 69, 0.2);
        }
      `}</style>
    </div>
  )
}

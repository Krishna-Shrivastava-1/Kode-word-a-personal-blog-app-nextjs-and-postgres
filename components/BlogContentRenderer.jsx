'use client'
import { useEffect } from 'react'

export default function BlogContentRenderer({ content }) {
  useEffect(() => {
    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll('.blog-content pre')
      
      codeBlocks.forEach((block) => {
        // Skip if button already exists
        if (block.querySelector('.copy-code-btn')) return

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
          const code = block.textContent || ''
          
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

        block.style.position = 'relative'
        block.appendChild(btn)
      })
    }

    // Add buttons after content loads
    addCopyButtons()
  }, [content])

  return (
    <div 
      className="blog-content prose prose-lg prose-gray max-w-none
        prose-headings:font-bold prose-headings:text-gray-900
        prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
        prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-6
        prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-5
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-xl prose-img:shadow-md prose-img:my-6
        prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:pl-4 prose-blockquote:italic
        prose-ul:list-disc prose-ol:list-decimal prose-li:mb-2
        prose-pre:bg-slate-900 prose-pre:text-slate-100
        prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

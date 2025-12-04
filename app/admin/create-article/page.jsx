'use client'
import QuillEditor from '@/components/QuillEditor'
import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const Page = () => {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [tag, setTag] = useState('')
  const [content, setContent] = useState('<p>Start writing here...</p>')
  const [bannerUrl, setBannerUrl] = useState('')
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [removingBanner, setRemovingBanner] = useState(false)
const [userData, setuserData] = useState([])
const router = useRouter()
const fetchLoggedUser = async ()=>{
  try {
    const resp  = await axios.get('/api/auth/loggedinuser')
    if(resp?.data?.success){
      setuserData(resp?.data?.loggedUser)
    }
  } catch (error) {
    console.log(error.message)
  }
}
useEffect(() => {
 fetchLoggedUser()
}, [])

  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingBanner(true)

      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (data.url) {
        setBannerUrl(data.url)
      } else {
        alert('Banner upload failed: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Banner upload error:', err)
      alert('Banner upload failed')
    } finally {
      setUploadingBanner(false)
      // Clear the input so user can re-select same file if needed
      e.target.value = ''
    }
  }

  const handleRemoveBanner = async () => {
    if (!bannerUrl) return

    const confirmDelete = confirm(
      'Remove this banner image and delete it from storage?'
    )
    if (!confirmDelete) return

    try {
      setRemovingBanner(true)

      // Optional: delete from Vercel Blob to free storage
      await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: bannerUrl }),
      })

      setBannerUrl('')
    } catch (err) {
      console.error('Banner delete error:', err)
      alert('Failed to delete banner image')
    } finally {
      setRemovingBanner(false)
    }
  }

  const handlePostCreation = async() => {
   try {
    if(!title || !subtitle || !bannerUrl || !tag || !content || !userData?.id) return toast.warning("Fill all the fields properly.")
    const resp = await axios.post('/api/post/createpost',{
      title,
      subtitle,
      thumbnailImage:bannerUrl,
      tag,
      content,
      userid:userData?.id
    })
    if(resp?.data?.success){

      toast.success("Article Created Successfully")
      router.back()
    }else{
      toast.error("Article is not Created Check Server.")
    }
   } catch (error) {
    console.log(error.message)
    toast.error(error.message)
   }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Create Article</h1>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Title</label>
          <Input
            placeholder="Amazing blog post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Subtitle</label>
          <Input
            placeholder="Enter subtitle for your article..."
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>

        {/* Tag */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tag</label>
          <Input
            placeholder="e.g. Next.js, Web Dev, Life"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Article Banner Image Via Url</label>
          <Input
            placeholder="https://bannerimage.img"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
          />
        </div>

        {/* Banner image */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Article Banner Image
          </label>
          <div className="flex items-center gap-3">
            <Input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              disabled={uploadingBanner || removingBanner}
            />
            {bannerUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveBanner}
                disabled={removingBanner}
              >
                {removingBanner ? 'Removing...' : 'Remove Banner'}
              </Button>
            )}
          </div>
          {uploadingBanner && (
            <p className="text-xs text-gray-500">Uploading banner...</p>
          )}
          {bannerUrl && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">Banner preview:</p>
            <img
  src={bannerUrl}
  alt="Banner preview"
  className="w-full rounded-xl border max-w-full max-h-64 object-contain"
/>

            </div>
          )}
        </div>

        {/* Editor */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Content</label>
          <QuillEditor content={content} onChange={setContent} />
        </div>

        {/* Debug preview */}
        {/* <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Raw HTML preview (for debugging)
          </label>
          <pre className="text-xs bg-gray-100 p-3 rounded-md overflow-x-auto">
            {content}
          </pre>
        </div> */}

        <div className="pt-4">
          <Button type="button" onClick={handlePostCreation}>
            Create Post
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Page

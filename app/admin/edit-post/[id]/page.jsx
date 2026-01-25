'use client'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import QuillEditor from '@/components/QuillEditor'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const Page = () => {
  const { id } = useParams()
  const router = useRouter()
  const [slug, setslug] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [tag, setTag] = useState('')
  const [content, setContent] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [removingBanner, setRemovingBanner] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
const [prevSlug, setprevSlug] = useState('')
  // Fetch post data to edit
  const fetchPostDatatoEdit = async () => {
    try {
      if (!id) return
      const resp = await axios.get(`/api/post/getpostbyid/${id}`)
      if (resp?.data?.success) {
        const post = resp.data.postbyid
        setTitle(post.title || '')
        setSubtitle(post.subtitle || '')
        setTag(post.tag || '')
        setContent(post.content || '')
        setBannerUrl(post.thumbnailimage || '')
        setslug(post.slug || '')
        setprevSlug(post.slug || '')
      }
    } catch (error) {
      console.log(error)
      alert('Failed to load post data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPostDatatoEdit()
  }, [])

  // Upload new banner
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
      e.target.value = ''
    }
  }

  // Remove banner
  const handleRemoveBanner = async () => {
    if (!bannerUrl) return

    const confirmDelete = confirm('Remove this banner image and delete it from storage?')
    if (!confirmDelete) return

    try {
      setRemovingBanner(true)
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

  // Update post
  const handleUpdate = async () => {
    if(!slug) return toast.warning("Fill the slug field properly.")
    if (!title.trim()) {
      alert('Title is required')
      return
    }
    if (!content.trim()) {
      alert('Content is required')
      return
    }

    setSaving(true)
    try {
      const res = await axios.patch(`/api/post/update/${id}`, {
        title,
        subtitle,
        tag,
        content,
        thumbnailImage: bannerUrl,
        slug,
        prevSlug
      })

      if (res.data.success) {
        alert('Post updated successfully!')
        router.push('/admin') // or wherever you want to redirect
      } else {
        alert('Failed to update post: ' + (res.data.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Update post error:', err)
      alert('Server error while updating post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading post data...</p>
      </div>
    )
  }
 const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Edit Article</h1>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Title</label>
          <Input
            placeholder="Amazing blog post title..."
            value={title}
         onChange={(e) => {
  const newTitle = e.target.value;
  setTitle(newTitle);
  setslug(generateSlug(newTitle));
}}
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
{/* Slug */}
        <div className="space-y-2 flex flex-col w-full">
          <label className="text-sm font-medium text-gray-700">Slug</label>
          <Input
          type='text'
            placeholder="Enter subtitle for your article..."
            value={slug}
            readOnly
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
          <label className="text-sm font-medium text-gray-700">
            Article Banner Image Via Url
          </label>
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
              <Image
              
                src={bannerUrl}
                alt="Banner preview"
                width={800}
                height={400}
                className="w-full max-h-64 object-cover rounded-xl border"
              />
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Content</label>
          <QuillEditor content={content} onChange={setContent} />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button onClick={handleUpdate} disabled={saving || uploadingBanner}>
            {saving ? 'Updating...' : 'Update Article'}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Page

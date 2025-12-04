'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { Ellipsis } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import Link from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const PostsTable = ({ postData, onUpdate }) => {
  const [updatingId, setUpdatingId] = useState(null)
const router = useRouter()
  const handleChangeVisibility = async (postId, isPublic) => {
    try {
      setUpdatingId(postId)

      const res = await fetch('/api/post/updatevisibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postid: postId, postvisiblity: isPublic }),
      })

      const data = await res.json()
      console.log(data)
      // 🔥 UPDATE UI IN PARENT
      onUpdate(postId, isPublic)
      if (data.success) {
        toast.success("Visibility Updated")
        // alert(data.message || 'Failed to update visibility')
        return
      }else{
        toast.error("Not updated visibility")
        return
      }

      

    } catch (err) {
      console.error('Visibility update error:', err)
      alert('Server error while updating visibility')
    } finally {
      setUpdatingId(null)
    }
  }
const handleDelete = async(postId)=>{
try {
 const {data} = await axios.delete(`/api/post/deletepost/${postId}`)
 if(data.success){
  toast.success('Deleted Successfully')
  router.refresh()
 }
} catch (error) {
  console.log(error)
  toast.error(error.message)
}
}
  return (
    <div>
      <Table>
        <TableCaption>Your recent posts.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Sr.</TableHead>
            <TableHead>Banner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {postData?.map((e, ind) => (
            <TableRow key={e.id}>
              <TableCell>{ind + 1}</TableCell>

              <TableCell>
                <Image
                  alt={e?.title}
                  width={80}
                  height={40}
                  src={e?.thumbnailimage}
                  className="rounded-md object-cover"
                />
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updatingId === e.id}
                      className={
                        'flex items-center gap-2 rounded-full cursor-pointer select-none px-3 py-1 text-xs ' +
                        (e?.public
                          ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                          : 'border-slate-300 text-slate-700 bg-slate-50')
                      }
                    >
                      <span
                        className={
                          'h-2 w-2 rounded-full ' +
                          (e?.public ? 'bg-emerald-500' : 'bg-slate-400')
                        }
                      />
                      {updatingId === e.id
                        ? 'Updating...'
                        : e?.public
                        ? 'Public'
                        : 'Private'}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start" className="w-40">
                    <DropdownMenuItem
                      onClick={() => handleChangeVisibility(e.id, true)}
                    >
                      Set as Public
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => handleChangeVisibility(e.id, false)}
                    >
                      Set as Private
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>

              <TableCell className="font-semibold">{e?.title}</TableCell>
              <TableCell className="font-semibold">{e?.name}</TableCell>
              <TableCell>{e?.views}</TableCell>
              <TableCell>
                   <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updatingId === e.id}
                      className={
                        'flex items-center gap-2  cursor-pointer select-none px-3 py-1 text-xs '}
                    >
                     <Ellipsis />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start" className="w-40">
                    <Link href={`/admin/edit-post/${e?.id}`}>
                    <DropdownMenuItem>
                      Edit Post
                    </DropdownMenuItem>
                    </Link>
<Dialog>
  <DialogTrigger asChild>
     <DropdownMenuItem   onSelect={(e) => {
              e.preventDefault() // Prevent dropdown from closing
            }} className="text-red-600 focus:text-white focus:bg-red-600 cursor-pointer">
                      Delete Post
                    </DropdownMenuItem>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure to Delete?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your post
        and remove your post from our servers.
      </DialogDescription>
      
    </DialogHeader>
      <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
            onClick={()=>handleDelete(e?.id)}
  variant="outline" 
  className="text-red-600 border-red-600 hover:text-white hover:bg-red-600 focus:text-white focus:bg-red-600 cursor-pointer transition-colors"
>
  Delete
</Button>

          </DialogFooter>
  </DialogContent>
</Dialog>
                   
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default PostsTable

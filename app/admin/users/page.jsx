import pool from '@/lib/db'
import React from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from 'next/image'
const page = async() => {
    const getallUser = await pool.query(`
        SELECT name,email,id,image,provider,role,created_at FROM users WHERE role = $1
        `,['user'])
        const allUserData=getallUser?.rows
        console.log(allUserData)
  return (
    <div>
      <Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead >Sr.</TableHead>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead >Role</TableHead>
      <TableHead >Provider</TableHead>
      <TableHead >Joined Date</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {
        allUserData?.map((e,ind)=>(
 <TableRow key={e.id}>
      <TableCell className='font-bold'>{ind+1}.</TableCell>
      <TableCell className='font-bold flex items-center gap-x-2'>{e.image && <Image src={e?.image} alt={e.name} width={25} className='rounded-full' height={5} />}{e.name}</TableCell>
      <TableCell>{e.email}</TableCell>
      <TableCell>{e.role}</TableCell>
      <TableCell>{e.provider}</TableCell>
      <TableCell>{new Date(e.created_at).toLocaleDateString()}</TableCell>
    </TableRow>
        ))
    }
   
  </TableBody>
</Table>
    </div>
  )
}

export default page

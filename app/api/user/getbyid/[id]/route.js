import { getUserbyID } from "@/models/users";
import { NextResponse } from "next/server";

export async function GET(req,{params}) {
    try {
        const {id} = await params
        const userbyid = await getUserbyID(id)
     return NextResponse.json({
               message:'User by id',
               userbyid,
               status:201,
               success:true
           })
       } catch (error) {
              console.log(error.message);
                   return NextResponse.json({
                       message:'Server error',
                       status:500,
                       success:false,
                   })
       }
}
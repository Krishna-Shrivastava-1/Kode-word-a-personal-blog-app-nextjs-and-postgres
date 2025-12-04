import { updatePostVisibility } from "@/models/posts";
import { NextResponse } from "next/server";

export async function PATCH(req,res) {
    try {
        const {postid,postvisiblity} = await req.json()
        const updateVisibility = await updatePostVisibility(postid,postvisiblity)
        if(!updateVisibility){
            return NextResponse.json({
                message:'Error in Updation of visibility',
                succes:false
            })
        }
        return NextResponse.json({
            message:'Updated Visibility',
            success:true
        })
    } catch (error) {
         console.log(error.message);
            return NextResponse.json({
              message: "Server error",
              status: 500,
              success: false,
            });
    }
}
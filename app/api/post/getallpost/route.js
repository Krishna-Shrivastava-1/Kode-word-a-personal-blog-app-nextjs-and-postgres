import { getAllPosts } from "@/models/posts";
import { getAllUser } from "@/models/users";
import { NextResponse } from "next/server";

export async function GET(req,res) {
    try {
        const posts = await getAllPosts()
        return NextResponse.json({
            message:'All Posts',
            posts,
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
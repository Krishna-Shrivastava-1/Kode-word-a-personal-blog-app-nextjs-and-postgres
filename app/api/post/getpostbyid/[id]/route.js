import { getPostbyId } from "@/models/posts";
import { getUserbyID } from "@/models/users";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const { id } = await params
        const postbyid = await getPostbyId(id)
        if(!postbyid){
            return NextResponse.json({
                message:'No post found',
                success:false
            })
        }
        return NextResponse.json({
            message: 'Post by id',
            postbyid,
            status: 201,
            success: true
        })
    } catch (error) {
        console.log(error.message);
        return NextResponse.json({
            message: 'Server error',
            status: 500,
            success: false,
        })
    }
}
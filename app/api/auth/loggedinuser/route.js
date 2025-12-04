import { Authorized } from "@/controllers/authControl"
import { getUserbyID } from "@/models/users"
import { NextResponse } from "next/server"

export async function GET(req,res) {
    try {
        const userData= await Authorized()
        if(!userData){
            return NextResponse.json({
                message:'User not found',
                success:false
            })
        }
        // console.log(userData)
        const userDataFromDatabase = await getUserbyID(userData?.user?.id)
        if(!userDataFromDatabase){
            return NextResponse.json({
                message:'User not found in Database',
                success:false
            })
        }

        return NextResponse.json({
            loggedUser:userDataFromDatabase,
            success:true
        })
    } catch (error) {
        console.log(error.message)
          return NextResponse.json({
                message:'Server error',
                status:500,
                success:false,
            })
    }
}
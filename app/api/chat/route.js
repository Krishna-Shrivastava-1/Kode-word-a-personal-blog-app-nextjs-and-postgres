import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

export async function POST(req) {
  const { query } = await req.json()

const resp = await fetch(process.env.CHATBASEURL,{
    method:'POST',
     headers: {
        "Content-Type": "application/json",
      },
    body:JSON.stringify({query:query, top_k: 3})
  })
const data = await resp.json()
// console.log(data)
  return NextResponse.json({
    message:'response successful',
    status:200,
    success:true,
    data:data
  })
}

import { createPost } from "@/models/posts";
import { createUser, getUserbyID } from "@/models/users";
import { NextResponse } from "next/server";


export async function POST(req, res) {
  try {
    const { title, content, userid, tag,thumbnailImage,subtitle } = await req.json();

    console.log(userid);
    const userExist = await getUserbyID(userid);

    if (!userExist) {
      return NextResponse.json({
        message: "User not exist",
        success: false,
      });
    }



    // Pass these image URLs along with other post data
    const postCreation = await createPost(title, content, userid, tag,thumbnailImage,subtitle);

    if (!postCreation) {
      return NextResponse.json({
        message: "Unable to Create Post",
        success: false,
      });
    }

    return NextResponse.json({
      message: "Post Created Successfully",
      post: postCreation,
      success: true,
      status: 200,
    });
  } catch (error) {
    console.log(error.message);
    return NextResponse.json({
      message: "Server error",
      status: 500,
      success: false,
    });
  }
}

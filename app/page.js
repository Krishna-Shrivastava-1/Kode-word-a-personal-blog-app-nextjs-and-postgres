import { Chat } from "@/components/Chat";
import { ChatDemo } from "@/components/ChatDemo";
import ChatWidget from "@/components/ChatWidget";

import { GridBackgroundDemo } from "@/components/GridBackgroundDemo";
import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <div className="bg-sky-800">
        <h2 className="text-center text-white font-bold">Meet our AI Assistant Kas. Try Now</h2>
      </div>
      <Navbar/>
      <GridBackgroundDemo />





    </div>
  );
}

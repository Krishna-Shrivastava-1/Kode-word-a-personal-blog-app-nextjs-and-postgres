import { Chat } from "@/components/Chat";
import { ChatDemo } from "@/components/ChatDemo";
import ChatWidget from "@/components/ChatWidget";

import { GridBackgroundDemo } from "@/components/GridBackgroundDemo";
import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      {/* <div className="bg-sky-800">
        <h2 className="text-center text-white font-bold">Meet our AI Assistant Kas. Try Now</h2>
      </div> */}
  
      <Navbar/>
         <div className="bg-gradient-to-r from-emerald-600 mt-14 via-sky-700 to-slate-950 border-y border-indigo-500/20 py-1.5 px-4 flex items-center justify-center">
  <p className="text-[13px] tracking-tight text-white">
    <span className="bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent font-bold mr-2">
      New Logic Chart:
    </span> 
    Visualize code flow instantly—stop reading, start seeing.
  </p>
</div>
      <GridBackgroundDemo />





    </div>
  );
}

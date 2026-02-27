"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar"
import { AppSidebar } from "./chatSideBar"
import ChatWidget from "./ChatWidget"
import { useEffect, useState } from "react"
import axios from "axios"

export default function ClientSidebarWrapper({ children }) {
  const pathname = usePathname()
  const [statusHealth, setstatusHealth] = useState(true)
const hideOnRoutes = ["/", "/otp", "/sign-in", "/sign-up"]
const shouldHideChatWidget = hideOnRoutes.includes(pathname)

useEffect(() => {

  const checkHealth = async () => {
    try {
      const resp = await axios.get(process.env.NEXT_PUBLIC_CHATHEALTHURL);
      setstatusHealth(resp?.data?.status === 'ok');
    } catch (error) {
      console.error("Health check failed:", error);
      setstatusHealth(false);
    }
  };

  checkHealth();
}, [pathname]); 


  if (shouldHideChatWidget) {
    return (
      <main className="relative">
        {children}

        {/* Mobile Chat Widget */}
       {
  pathname !== "/otp" &&
  pathname !== "/sign-in" &&
  pathname !== "/sign-up" && (
    <div>
      <ChatWidget statusHealth={statusHealth} />
    </div>
  )
}
      </main>
    )
  }

  return (
    <SidebarProvider
      defaultOpen={false}
      style={{
        "--sidebar-width": "20rem",
        "--sidebar-width-mobile": "100vw",
        "--sidebar-width-icon": "4rem",
      }}
    >
      <div className="flex w-full min-h-screen relative">
        {/* Main content */}
        <div className="w-full">
          {children}
        </div>

        {/* Desktop sidebar trigger */}
        <div className="hidden md:block">
          <SidebarTrigger />
        </div>

        {/* Sidebar */}
        <div className="w-auto shrink-0">
          <AppSidebar statusHealth={statusHealth} />
        </div>

        {/* Mobile Chat Widget */}
        <div className="md:hidden fixed right-4 bottom-4 z-50">
          <ChatWidget statusHealth={statusHealth} />
        </div>
      </div>
    </SidebarProvider>
  )
}

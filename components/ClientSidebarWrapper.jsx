"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar"
import { AppSidebar } from "./chatSideBar"
import ChatWidget from "./ChatWidget"

export default function ClientSidebarWrapper({ children }) {
  const pathname = usePathname()
const hideOnRoutes = ["/", "/otp", "/sign-in", "/sign-up"]
const shouldHideChatWidget = hideOnRoutes.includes(pathname)

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
      <ChatWidget />
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
          <AppSidebar />
        </div>

        {/* Mobile Chat Widget */}
        <div className="md:hidden fixed right-4 bottom-4 z-50">
          <ChatWidget />
        </div>
      </div>
    </SidebarProvider>
  )
}

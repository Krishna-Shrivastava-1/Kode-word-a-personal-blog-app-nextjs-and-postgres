"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger, SidebarTriggerChat } from "./ui/sidebar"
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
          <SidebarTriggerChat />
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


// "use client"

// import { usePathname } from "next/navigation"
// import { SidebarProvider, SidebarTriggerChat } from "./ui/sidebar"
// import { AppSidebar } from "./chatSideBar"
// import ChatWidget from "./ChatWidget"
// import { useEffect, useState } from "react"
// import axios from "axios"

// export default function ClientSidebarWrapper({ children }) {
//   const pathname = usePathname()
//   const [statusHealth, setStatusHealth] = useState(true)
//   const [isAllowedToShow, setIsAllowedToShow] = useState(false) // Default to false or loading state
//   const [isLoading, setIsLoading] = useState(true)

//   const hideOnRoutes = ["/", "/otp", "/sign-in", "/sign-up"]
//   const shouldHideChatWidget = hideOnRoutes.includes(pathname)

//   useEffect(() => {
//     const checkStatus = async () => {
//       try {
//         // Run both checks in parallel to save time
//         const [allowResp, healthResp] = await Promise.allSettled([
//           axios.post('/api/post/allowchatbotornot', { id: pathname }),
//           axios.get(process.env.NEXT_PUBLIC_CHATHEALTHURL)
//         ]);

//         if (allowResp.status === 'fulfilled') {
//           setIsAllowedToShow(allowResp.value.data);
//         }

//         if (healthResp.status === 'fulfilled') {
//           setStatusHealth(healthResp.value.data?.status === 'ok');
//         }
//       } catch (error) {
//         console.error("Setup check failed:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkStatus();
//   }, [pathname]);

//   // --- IMPORTANT: ALWAYS render children so the page doesn't disappear ---
//   if (isLoading) {
//     return <main className="relative">{children}</main>;
//   }

//   // If the API says "No Chat", just return children without the Sidebar logic
//   if (!isAllowedToShow?.message) {
//     return <main className="relative">{children}</main>;
//   }

//   // --- RENDER SIDEBAR / WIDGET LOGIC ---
//   if (shouldHideChatWidget) {
//     return (
//       <main className="relative">
//         {children}
//         {/* Only show widget on specific routes if allowed */}
//         {!["/otp", "/sign-in", "/sign-up"].includes(pathname) && (
//           <ChatWidget statusHealth={statusHealth} />
//         )}
//       </main>
//     )
//   }

//   return (
//     <SidebarProvider style={{
//     "--sidebar-width": "20rem", // Increase this value
//     "--sidebar-width-mobile": "100vw",
//     "--sidebar-width-icon": "4rem",
//   }} defaultOpen={false}>
//       <div className="flex w-full min-h-screen relative">
//         <div className="w-full">{children}</div>
        
//         {/* Desktop Sidebar */}
//         <div className="hidden md:block">
//           <SidebarTriggerChat />
//           <AppSidebar statusHealth={statusHealth} />
//         </div>

//         {/* Mobile Chat Widget */}
//         <div className="md:hidden fixed right-4 bottom-4 z-50">
//           <ChatWidget statusHealth={statusHealth} />
//         </div>
//       </div>
//     </SidebarProvider>
//   )
// }
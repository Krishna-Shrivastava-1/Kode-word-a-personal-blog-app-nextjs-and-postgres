import { Calendar, Dot, Home, Inbox, Search, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ChatDemo } from "./ChatDemo"


export  function AppSidebar({statusHealth}) {

  return (
    <Sidebar className='mt-13' side="right">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel><div className="flex items-center justify-between">{statusHealth ? <Dot className="text-green-600" size={40} /> : <Dot className="text-red-600" size={40}/>}<h1>Ai Assistant Kas</h1></div></SidebarGroupLabel>
          <SidebarGroupContent>
          <ChatDemo />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
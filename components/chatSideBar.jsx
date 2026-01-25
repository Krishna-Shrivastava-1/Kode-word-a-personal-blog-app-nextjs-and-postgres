import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

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


export function AppSidebar() {
  return (
    <Sidebar className='mt-13' side="right">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Ai Assistant Kas</SidebarGroupLabel>
          <SidebarGroupContent>
          <ChatDemo />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
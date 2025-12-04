'use client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import axios from 'axios'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    // Clear cookie
   await axios.post('/api/auth/logout')
    
    // Redirect to login
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
    >
      Sign Out
    </button>
  )
}

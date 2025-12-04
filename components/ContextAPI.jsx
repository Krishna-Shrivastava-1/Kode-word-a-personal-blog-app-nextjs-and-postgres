'use client'

import axios from "axios"
import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext()
export function ContextProvider({children}) {
    const [registrationEmail, setregistrationEmail] = useState('')
    const [UserData, setUserData] = useState([])
     const fetchLoggedUser = async () => {
    try {
      
      const { data } = await axios.get('/api/auth/loggedinuser')

      if (data?.success) {
        setUserData(data?.loggedUser)
      }
    } catch (error) {
      setUserData(null)
    }
  }

  useEffect(() => {
    fetchLoggedUser()
  }, [])
    return (
        <AuthContext.Provider value={{registrationEmail,setregistrationEmail,UserData}}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = ()=>useContext(AuthContext)
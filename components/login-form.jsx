'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "sonner"
import axios from "axios"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async (e) => {
    e.preventDefault()

    // ✅ Basic validation
    if (!email || !password) {
      return toast.warning("Please fill in all fields.")
    }

    setLoading(true)

    try {
      // ✅ Login API call
      const { data } = await axios.post('/api/auth/login', {
        email,
        password
      })

      if (data.success && data?.role === 'admin') {
        toast.success(data.message || 'Login successful!')
        
        // ✅ Redirect to dashboard/home
        router.push('/admin')
      }
      else if (data.success && data?.role === 'user') {
        toast.success(data.message || 'Login successful!')
        
        // ✅ Redirect to dashboard/home
        router.push('/')
      }
      else {
        toast.error(data.message || 'Invalid credentials')
      }
    } catch (error) {
      // ✅ Handle errors
      const errorMsg = error.response?.data?.message || "Login failed. Please try again."
      toast.error(errorMsg)
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }
  const handleLogin = () => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google-callback` +
      `&response_type=code` +
      `&scope=openid email profile`
    
    window.location.href = googleAuthUrl
  }
  return (
    <form onSubmit={handleSignIn} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>
        
        {/* ✅ Email Field with State */}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required 
          />
        </Field>
        
        {/* ✅ Password Field with State */}
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a 
              href="/forgot-password" 
              className="ml-auto text-sm underline-offset-4 hover:underline text-purple-600"
            >
              Forgot your password?
            </a>
          </div>
          <Input 
            id="password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required 
          />
        </Field>
        
        {/* ✅ Submit Button with Loading State */}
        <Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Field>
        
        <FieldSeparator>Or continue with</FieldSeparator>
        
        {/* ✅ GitHub OAuth Button */}
        <Field>
          <Button onClick={handleLogin} variant="outline" type="button" disabled={loading} className="w-full">
            <Image src={'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-color-icon.png'} alt="google logo" width={20} height={10} />
            Login with Google
          </Button>
          
          <FieldDescription className="px-6 text-center">
            Don&apos;t have an account?{" "}
            <a href="/sign-up" className="font-medium text-purple-600 underline underline-offset-4 hover:no-underline">
              Sign up
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

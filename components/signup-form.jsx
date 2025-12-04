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
import { useAuth } from "./ContextAPI"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function SignupForm({ className, ...props }) {
  const [name, setname] = useState('')
  const [email, setemail] = useState('')
  const [password, setpassword] = useState('')
  const [passwordConfirm, setpasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)  // ✅ Added loading state
  
  const router = useRouter()
  const { setregistrationEmail } = useAuth()

  const handleSignUp = async (e) => {
    e.preventDefault()
    
    // Validation
    if (password !== passwordConfirm) {
      return toast.warning("Passwords do not match.")
    }

    if (password.length < 8) {
      return toast.warning("Password must be at least 8 characters long.")
    }

    setLoading(true)

    try {
      // ✅ FIXED: Destructure data from axios response
      const { data } = await axios.post('/api/auth/register', {
        name,
        email,
        password
      })

      // ✅ FIXED: Check data.success (not resp.success)
      if (data.success) {
        toast.success(data.message || 'OTP sent! Check your email.')
        
        // ✅ Store email in context
        setregistrationEmail(email)
        
        // ✅ Redirect to OTP page
        router.push('/otp')
      } else {
        // ✅ Show error message from backend
        toast.error(data.message || 'Registration failed')
      }
    } catch (error) {
      // ✅ Better error handling
      const errorMsg = error.response?.data?.message || "Server error. Please try again."
      toast.error(errorMsg)
      console.error('Signup error:', error)
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
    <form onSubmit={handleSignUp} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>
        
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input 
            onChange={(e) => setname(e.target.value)} 
            id="name" 
            type="text" 
            placeholder="John Doe" 
            disabled={loading}
            required 
          />
        </Field>
        
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input 
            onChange={(e) => setemail(e.target.value)} 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            disabled={loading}
            required 
          />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input 
            onChange={(e) => setpassword(e.target.value)} 
            id="password" 
            type="password" 
            disabled={loading}
            required 
          />
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>
        
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input 
            onChange={(e) => setpasswordConfirm(e.target.value)} 
            id="confirm-password" 
            type="password" 
            disabled={loading}
            required 
          />
          <FieldDescription>Please confirm your password.</FieldDescription>
        </Field>
        
        <Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Field>
        
        <FieldSeparator>Or continue with</FieldSeparator>
        
        <Field>
          <Button onClick={handleLogin} variant="outline" type="button" disabled={loading}>
            <Image src={'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-color-icon.png'} alt="google logo" width={20} height={10} />
            Sign up with Google
          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account? <a href="/sign-in" className="font-medium text-purple-600 hover:underline">Sign in</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

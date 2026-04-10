// 'use client'
// import { useState } from "react"
// import axios from "axios"
// import { toast } from "sonner"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import {
//   InputOTP,
//   InputOTPGroup,
//   InputOTPSlot,
// } from "@/components/ui/input-otp"

// export default function ResetForm() {
//   const router = useRouter()

//   const [step, setStep] = useState(1)
//   const [email, setEmail] = useState("")
//   const [otp, setOtp] = useState("")
//   const [password, setPassword] = useState("")
//   const [confirmPassword, setConfirmPassword] = useState("")
//   const [loading, setLoading] = useState(false)

//   // 🔥 STEP 1
//   const handleSendOTP = async () => {
//     if (!email) return toast.warning("Enter email")

//     setLoading(true)
//     try {
//       const resp = await axios.post('/api/auth/forgot-password', { email })
//       if(resp.data?.success){
//           toast.success("OTP sent!")
//           setStep(2)
//       }
//     } catch {
//       toast.error("Failed to send OTP")
//     } finally {
//       setLoading(false)
//     }
//   }

//   // 🔥 STEP 2
//   const handleVerifyOTP = async () => {
//     if (otp.length !== 6) return toast.warning("Enter full OTP")

//     setLoading(true)
//     try {
//       await axios.post('/api/auth/verify-reset-otp', { email, otp })
//       toast.success("OTP verified!")
//       setStep(3)
//     } catch {
//       toast.error("Invalid OTP")
//     } finally {
//       setLoading(false)
//     }
//   }

//   // 🔥 STEP 3
//   const handleResetPassword = async () => {
//     if (password !== confirmPassword) {
//       return toast.warning("Passwords do not match")
//     }

//     setLoading(true)
//     try {
//       await axios.patch('/api/auth/reset-password', { email, password })
//       toast.success("Password updated!")
//       setStep(4)

//       setTimeout(() => {
//         router.push('/sign-in')
//       }, 1500)
//     } catch {
//       toast.error("Reset failed")
//     } finally {
//       setLoading(false)
//     }
//   }

//   // 🔥 STEP LABELS
//   const steps = ["Email", "OTP", "New Password", "Done"]

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
//       <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl p-6">

//         {/* 🔥 TOP STEPPER (YouTube style) */}
//         <div className="flex items-center justify-between mb-8">
//           {steps.map((label, index) => {
//             const stepNumber = index + 1
//             return (
//               <div key={index} className="flex-1 flex flex-col items-center relative">
                
//                 {/* Line */}
//                 {index !== steps.length - 1 && (
//                   <div className={`absolute top-4 left-1/2 w-full h-1 
//                     ${step > stepNumber ? "bg-green-500" : "bg-gray-200"}`} />
//                 )}

//                 {/* Circle */}
//                 <div className={`z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
//                   ${step >= stepNumber ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
//                   {stepNumber}
//                 </div>

//                 {/* Label */}
//                 <span className="text-xs mt-2">{label}</span>
//               </div>
//             )
//           })}
//         </div>

//         {/* 🔥 CONTENT AREA */}
//         <div className="space-y-6">

//           {/* STEP 1 */}
//           {step === 1 && (
//             <>
//               <h2 className="text-lg font-semibold">Enter your email</h2>
//               <Input
//                 placeholder="example@gmail.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value?.toLowerCase())}
//               />
//               <Button onClick={handleSendOTP} disabled={loading}>
//                 Continue
//               </Button>
//             </>
//           )}

//           {/* STEP 2 */}
//           {step === 2 && (
//             <>
//               <h2 className="text-lg font-semibold">Verify OTP</h2>
//               <p className="text-sm text-gray-500">Sent to {email}</p>

//               <InputOTP maxLength={6} value={otp} onChange={setOtp}>
//                 <InputOTPGroup className="gap-3">
//                   {[0,1,2,3,4,5].map(i => (
//                     <InputOTPSlot key={i} index={i} />
//                   ))}
//                 </InputOTPGroup>
//               </InputOTP>

//               <div className="flex justify-between">
//                 <button
//                   onClick={() => setStep(1)}
//                   className="text-sm text-gray-500"
//                 >
//                   Back
//                 </button>

//                 <Button onClick={handleVerifyOTP} disabled={loading}>
//                   Verify
//                 </Button>
//               </div>

//               <button
//                 onClick={handleSendOTP}
//                 className="text-sm text-blue-600"
//               >
//                 Resend OTP
//               </button>
//             </>
//           )}

//           {/* STEP 3 */}
//           {step === 3 && (
//             <>
//               <h2 className="text-lg font-semibold">Set new password</h2>

//               <Input
//                 type="password"
//                 placeholder="New password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />

//               <Input
//                 type="password"
//                 placeholder="Confirm password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//               />

//               <div className="flex justify-between">
//                 <button
//                   onClick={() => setStep(2)}
//                   className="text-sm text-gray-500"
//                 >
//                   Back
//                 </button>

//                 <Button onClick={handleResetPassword} disabled={loading}>
//                   Reset Password
//                 </Button>
//               </div>
//             </>
//           )}

//           {/* STEP 4 */}
//           {step === 4 && (
//             <div className="text-center text-green-600 font-semibold text-lg">
//               ✅ Password reset successful
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }



'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { 
  Loader2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2 
} from "lucide-react"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"

export default function ResetForm() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(60)

  
  // console.log(timer)
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { executeRecaptcha } = useGoogleReCaptcha()
  // 🔥 STEP 1
  const handleSendOTP = async () => {
    if (!email) return toast.warning("Please enter your email address")
      setTimer(60)
       // ✅ 3. Check if reCAPTCHA is ready
    if (!executeRecaptcha) {
      console.error("reCAPTCHA not ready");
      return;
    }
    setLoading(true)
    try {
       // ✅ 4. Generate the token!
      const token = await executeRecaptcha("chat_submit")
      const resp = await axios.post('/api/auth/forgot-password', { email,recaptchaToken: token  })
      if(resp.data?.success){
          toast.success("OTP sent to your email!")
          setStep(2)
      }
    } catch {
      toast.error("Failed to send OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }
useEffect(() => {
  if (step == 2 && timer > 0) {
    const id = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(id); // Clean up on unmount or re-run
  }
}, [timer,step]);

  // 🔥 STEP 2
  const handleVerifyOTP = async () => {
   
    if (otp.length !== 6) return toast.warning("Please enter the full 6-digit OTP")

    setLoading(true)
    try {
      await axios.post('/api/auth/verify-reset-otp', { email, otp })
      toast.success("OTP verified successfully!")
      setStep(3)
    } catch {
      toast.error("Invalid or expired OTP")
    } finally {
      setLoading(false)
    }
  }

  // 🔥 STEP 3
  const handleResetPassword = async () => {
    if (password.length < 8) {
      return toast.warning("Password must be at least 8 characters long")
    }
    if (password !== confirmPassword) {
      return toast.warning("Passwords do not match")
    }

    setLoading(true)
    try {
      await axios.patch('/api/auth/reset-password', { email, password })
      toast.success("Password updated successfully!")
      setStep(4)

      setTimeout(() => {
        router.push('/sign-in')
      }, 2000)
    } catch {
      toast.error("Failed to reset password. Try again.")
    } finally {
      setLoading(false)
    }
  }

  // 🔥 STEP LABELS
  const steps = ["Email", "Verification", "New Password"]

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 sm:p-8 overflow-hidden">

        {/* 🔥 TOP STEPPER */}
        <div className="mb-8">
          <div className="relative flex items-center justify-between w-full">
            {/* Background Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full" />
            
            {/* Active Progress Line */}
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-500 ease-in-out rounded-full" 
              style={{ width: `${((Math.min(step, 3) - 1) / 2) * 100}%` }} 
            />

            {/* Step Circles */}
            {steps.map((label, index) => {
              const stepNumber = index + 1
              const isActive = step >= stepNumber
              const isCurrent = step === stepNumber

              return (
                <div key={index} className="relative z-10 flex flex-col items-center group">
                  <div 
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300
                      ${isActive 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "bg-white border-2 border-gray-200 text-gray-400"
                      }
                      ${isCurrent && "ring-4 ring-primary/20"}
                    `}
                  >
                    {step > stepNumber ? <CheckCircle2 className="w-4 h-4" /> : stepNumber}
                  </div>
                  <span className={`absolute -bottom-6 text-[11px] font-medium whitespace-nowrap transition-colors duration-300
                    ${isActive ? "text-gray-900" : "text-gray-400"}
                  `}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Adds padding to account for absolute positioned stepper labels */}
        <div className="mt-12">

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">Forgot password?</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email address and we'll send you a 6-digit verification code.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10 h-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                    />
                  </div>
                </div>

                <Button className="w-full h-11 text-base" onClick={handleSendOTP} disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Code"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">Check your email</h2>
                <p className="text-sm text-muted-foreground">
                  We sent a verification code to <span className="font-medium text-gray-900">{email}</span>
                </p>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus>
                  <InputOTPGroup className="gap-2 sm:gap-3">
                    {[0,1,2,3,4,5].map(i => (
                      <InputOTPSlot key={i} index={i} className="w-10 h-12 sm:w-12 sm:h-14 text-lg border-gray-200" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>

                <Button className="w-full h-11 text-base" onClick={handleVerifyOTP} disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Code"}
                </Button>

                <div className="flex flex-col sm:flex-row items-center justify-between w-full text-sm">
                  <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-gray-900 flex items-center gap-1 mb-4 sm:mb-0 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Change Email
                  </button>
                <span  className="text-primary font-medium hover:underline">
                    Didn't receive it? {timer !=0 &&`00:${timer <10 ? '0' :'' }${timer}`} <button type="button" className="font-medium text-purple-600 hover:underline disabled:opacity-50" disabled={timer >0 ? true : false} onClick={handleSendOTP}>Resend</button> 
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">Set new password</h2>
                <p className="text-sm text-muted-foreground">
                  Your new password must be different to previously used passwords.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button className="w-full h-11 text-base mt-2" onClick={handleResetPassword} disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="space-y-6 py-6 text-center animate-in zoom-in-95 duration-500">
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Password Reset!</h2>
                <p className="text-sm text-muted-foreground">
                  Your password has been successfully reset. Redirecting you to the login page...
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full h-11" 
                onClick={() => router.push('/sign-in')}
              >
                Back to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
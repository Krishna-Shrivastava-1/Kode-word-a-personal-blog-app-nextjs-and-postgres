'use client'
import { useState } from "react"
import axios from "axios"
import { useAuth } from "./ContextAPI"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function OTPForm({ ...props }) {
  const { registrationEmail } = useAuth()
  const router = useRouter()
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Please enter all 6 digits');
      toast.warning('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/api/auth/verified-register', {
        email: registrationEmail,
        otp
      });

      if (data.success) {
        toast.success('Account created successfully!');
        router.push('/sign-in');
      } else {
        setError(data.message || 'Invalid OTP');
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      // ✅ IMPROVED: Better error extraction
      console.log('Full error:', error);  // Debug log
      console.log('Response:', error.response);  // Debug log
      console.log('Response data:', error.response?.data);  // Debug log
      
      let errorMessage = 'Verification failed. Please try again.';
      
      if (error.response) {
        // ✅ Backend returned error response
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid or expired OTP. Please try again.';
        } else if (error.response.status === 404) {
          errorMessage = 'Registration expired. Please register again.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        // ✅ No response from server
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registrationEmail) {
      toast.error('Session expired. Please register again.');
      router.push('/sign-up');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { data } = await axios.post('/api/auth/resend-otp', {
        email: registrationEmail
      });
      
      if (data.success) {
        toast.success('New OTP sent to your email!');
        setOtp('');
      } else {
        setError(data.message || 'Failed to resend OTP');
        toast.error(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Resend failed. Try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Enter verification code</CardTitle>
        <CardDescription>
          We sent a 6-digit code to {registrationEmail || 'your email'}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp">Verification code</FieldLabel>
              
              <InputOTP 
                maxLength={6} 
                id="otp" 
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={loading}
                required
              >
                <InputOTPGroup
                  className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              
              <FieldDescription>
                Enter the 6-digit code sent to your email.
              </FieldDescription>
              
              {/* ✅ Improved error display */}
              {error && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
                  <svg className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              )}
            </Field>
            
            <FieldGroup>
              <Button 
                type="submit" 
                disabled={loading || otp.length !== 6}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
              
              <FieldDescription className="text-center">
                Didn&apos;t receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="font-medium text-purple-600 hover:underline disabled:opacity-50"
                >
                  Resend
                </button>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import logo from '../../public/logo.png'
import Image from "next/image";
import Link from "next/link";
export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href={'/'}>
            <div className='flex items-center justify-center space-x-2 select-none cursor-pointer'>
                <Image src={logo} alt='Logo' width={50} height={10} />
                <h1 className='font-semibold text-xl '>Kode$word</h1>
            </div>
           </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
      </div>
    </div>
  );
}

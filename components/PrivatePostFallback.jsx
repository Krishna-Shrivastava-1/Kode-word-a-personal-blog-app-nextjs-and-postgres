import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';

export const  PrivatePostFallback=()=>{
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 bg-blue-400/10 rounded-2xl shadow-sm border border-gray-100">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">This Post is not available</h1>
          <p className="text-gray-600">
            There are so many other post waiting for you to read or please comaback after sometime.
          </p>
        </div>

        <div className="pt-4">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
        
        <p className="text-xs text-gray-400">
          Ref: 403 - Restricted Access
        </p>
      </div>
    </div>
  );
}
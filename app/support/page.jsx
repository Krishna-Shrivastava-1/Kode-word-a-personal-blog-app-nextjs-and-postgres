import Navbar from '@/components/Navbar'
import { Coffee, Heart, Zap, Gift, DollarSign, CreditCard, QrCode } from 'lucide-react'
import Image from 'next/image'
import krqr from '../../public/krishqr.png'
export default function SupportPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block p-4 bg-yellow-400 rounded-full mb-4">
                        <Coffee className="w-12 h-12 text-gray-900" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Support My Work
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        If you enjoy my content and find it valuable, your support helps me continue creating quality articles and keeping this platform free for everyone.
                    </p>
                </div>

                {/* Why Support Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-red-500" />
                        Why Your Support Matters
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Keep Content Free</h3>
                                <p className="text-sm text-gray-600">
                                    Your donations help me keep all articles free and accessible to everyone.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Coffee className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">More Quality Content</h3>
                                <p className="text-sm text-gray-600">
                                    Support allows me to dedicate more time to research and writing.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Gift className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Platform Improvements</h3>
                                <p className="text-sm text-gray-600">
                                    Funds go toward hosting, tools, and platform enhancements.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-yellow-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Community Growth</h3>
                                <p className="text-sm text-gray-600">
                                    Help build a thriving community of learners and creators.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Donation Options */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        Ways to Support
                    </h2>

                 <div className="max-w-md mx-auto mb-8">
  {/* ✅ Single Centered QR Code Card */}
  <div className="border-2 border-blue-400 rounded-xl p-6 relative overflow-hidden">
    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-bl-lg font-semibold">
      INSTANT
    </div>
    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
      <QrCode className="w-6 h-6 text-blue-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Scan & Pay</h3>
    <p className="text-gray-600 text-sm mb-4 text-center">
      UPI Payment (PhonePe/GPay/Paytm)
    </p>

    {/* ✅ QR Code Image */}
    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4 flex items-center justify-center">
      <div className="relative w-[200px] h-[200px]">
        <Image
          src={krqr}
          alt="UPI Payment QR Code"
          fill
          className="object-contain"
          quality={100}
          priority
        />
      </div>
    </div>

    <p className="text-xs text-gray-500 text-center">
      💙 Scan with any UPI app to support
    </p>
  </div>
</div>



                </div>



                {/* Alternative Support */}
                <div className="bg-gray-100 rounded-2xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Other Ways to Help
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Not ready to donate? Here are free ways to support:
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="bg-white px-6 py-3 rounded-lg shadow">
                            <span className="text-2xl mr-2">📢</span>
                            Share articles
                        </div>
                        <div className="bg-white px-6 py-3 rounded-lg shadow">
                            <span className="text-2xl mr-2">💬</span>
                            Leave feedback
                        </div>

                    </div>
                </div>

                {/* Thank You */}
                <div className="text-center mt-12">
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                        Thank You!
                    </p>
                    <p className="text-gray-600">
                        Your support means the world to me and helps keep this blog alive.
                    </p>
                </div>
            </div>
        </div>
    )
}

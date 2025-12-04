import { Twitter, Linkedin, Github, Instagram, Youtube } from 'lucide-react'

export default function SocialSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Connect With Me
        </h3>
        <div className="flex justify-center gap-6">
          <a
            href="https://x.com/Krishna__Stark"
            target="_blank"
            className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
          >
            <Twitter className="w-6 h-6" />
          </a>
          <a
            href="https://www.linkedin.com/in/krishna-shrivastava-62b72129a/"
            target="_blank"
            className="p-3 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            <Linkedin className="w-6 h-6" />
          </a>
          <a
            href="https://github.com/Krishna-Shrivastava-1"
            target="_blank"
            className="p-3 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Github className="w-6 h-6" />
          </a>
          {/* <a
            href="https://instagram.com/yourusername"
            target="_blank"
            className="p-3 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 transition-colors"
          >
            <Instagram className="w-6 h-6" />
          </a>
          <a
            href="https://youtube.com/@yourusername"
            target="_blank"
            className="p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
          >
            <Youtube className="w-6 h-6" />
          </a> */}
        </div>
      </div>
    </section>
  )
}

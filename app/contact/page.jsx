'use client'
import Navbar from '@/components/Navbar'
import WorldMap from '@/components/ui/world-map'

import { 
  Mail, 
  MapPin, 
  Code2, 
  Rocket, 
  Zap,
  Github,
  Linkedin,
  Twitter,
  Layers,
  Database,
  Cpu,
  Globe,
  Users,
  TrendingUp,
  User,
  MessageSquare,
  Send
} from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
      const [status, setStatus] = useState('idle') // idle, loading, success, error
    
      const handleChange = (e) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        })
      }
    
      const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('loading')
    
        try {
          const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          })
    
          if (res.ok) {
            setStatus('success')
            setFormData({ name: '', email: '', subject: '', message: '' })
            setTimeout(() => setStatus('idle'), 5000)
          } else {
            setStatus('error')
          }
        } catch (error) {
          setStatus('error')
        }
      }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section with Animation */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="inline-block p-4 bg-white/20 rounded-full mb-6 animate-bounce">
              <Rocket className="w-12 h-12" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Building SaaS Products That Scale
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto animate-fade-in-delay">
              Full-Stack SaaS Developer | Product Builder | Automation Specialist
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Image/Avatar */}
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                      Your Brand
                    </div>
                    <div className="text-xl font-semibold text-gray-600">
                      SaaS Engineer
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-float">
                🚀 SaaS Builder
              </div>
              <div className="absolute -bottom-4 -left-4 bg-purple-600 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-float-delay">
                ⚡ Full-Stack Pro
              </div>
            </div>

            {/* Right - About Text */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Crafting <span className="text-blue-600">Production-Ready</span> SaaS Solutions
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  I'm a <strong>SaaS Product Developer</strong> specializing in building scalable, 
                  production-grade web applications. From ideation to deployment, I create 
                  products that solve real business problems.
                </p>
                <p>
                  With expertise in modern tech stacks and cloud infrastructure, I've built 
                  platforms ranging from <strong>content management systems</strong> to 
                  <strong> AI-powered automation tools</strong>. My approach combines clean 
                  architecture, optimal performance, and exceptional user experience.
                </p>
                <p>
                  I don't just write code—I build <strong>products</strong>. Whether it's 
                  a blogging platform, news aggregator, or business automation tool, 
                  every project is crafted with scalability and maintainability in mind.
                </p>
              </div>

              {/* Core Competencies */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                  <Layers className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">SaaS Architecture</div>
                    <div className="text-sm text-gray-600">Scalable Systems</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                  <Database className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Database Design</div>
                    <div className="text-sm text-wrap text-gray-600">PostgreSQL/ NoSQL</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                  <Cpu className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">AI Integration</div>
                    <div className="text-sm text-gray-600">Smart Automation</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
                  <TrendingUp className="w-6 h-6 text-orange-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Performance</div>
                    <div className="text-sm text-gray-600">Optimization Expert</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

   {/* Projects Showcase */}
<section className="py-16 bg-gray-50">
  <div className="max-w-6xl mx-auto px-4">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        Products & Platforms Built
      </h2>
      <p className="text-xl text-gray-600">
        Production-ready SaaS applications solving real problems
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Mokai - Featured */}
      <a 
        href="https://mokai.vercel.app" 
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-t-4 border-yellow-500 group relative block"
      >
        <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          FLAGSHIP
        </div>
        <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Cpu className="w-7 h-7 text-yellow-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          Mokai
          <span className="text-xs text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Complete placement preparation platform with AI-powered mock tests (Gemini API), 
          real-time social feed (Socket.io), resume analyzer with job matching, progress tracking, 
          and live news feed integration.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">AI Mock Tests</span>
          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Real-time</span>
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">Resume AI</span>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Socket.io</span>
        </div>
      </a>

      {/* Krido Studio */}
      <a 
        href="https://kridostudio.vercel.app" 
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-t-4 border-purple-600 group block"
      >
        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Users className="w-7 h-7 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          Krido Studio
          <span className="text-xs text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Revolutionary code-to-video platform that generates programming tutorial videos 
          without screen recording. Automated code animation with syntax highlighting and smooth transitions.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">Video Gen</span>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Canvas API</span>
          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">FFmpeg</span>
        </div>
      </a>

      {/* BrilliCode */}
      <a 
        href="https://brillicode.vercel.app" 
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-t-4 border-blue-600 group block"
      >
        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Code2 className="w-7 h-7 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          BrilliCode
          <span className="text-xs text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Full-featured online compiler supporting 12+ programming languages. 
          Real-time code execution with syntax highlighting, multi-language support, and error handling.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">12+ Languages</span>
          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Monaco Editor</span>
          <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">Real-time</span>
        </div>
      </a>

      {/* Anvisul */}
      <a 
        href="https://anvisul.vercel.app" 
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-t-4 border-green-600 group block"
      >
        <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <TrendingUp className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          Anvisul
          <span className="text-xs text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Data visualization platform where users paste CSV data and get instant interactive charts 
          and clean tables. Automated data cleaning and intelligent chart generation.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Data Viz</span>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">CSV Parser</span>
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">Chart.js</span>
        </div>
      </a>

      {/* Blog Platform - Internal Link */}
      <a 
        href="/"
        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-t-4 border-indigo-600 group block"
      >
        <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Globe className="w-7 h-7 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          Content Platform
          <span className="text-xs text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Full-featured blogging platform with rich text editor, Google OAuth authentication, 
          bookmarks, likes, analytics, and admin dashboard. Production-ready CMS.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">Next.js</span>
          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">PostgreSQL</span>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Tiptap</span>
        </div>
      </a>

      {/* Coming Soon */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center mb-4">
          <Rocket className="w-7 h-7 text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          More Coming Soon
        </h3>
        <p className="text-gray-500 text-sm">
          Building the next generation of AI-powered SaaS tools
        </p>
      </div>
    </div>
  </div>
</section>



      {/* Tech Stack Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Production Tech Stack
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Enterprise-grade technologies for building reliable, scalable SaaS products
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Next.js 16+', emoji: '▲', color: 'bg-black text-white' },
              { name: 'React 19', emoji: '⚛️', color: 'bg-blue-500 text-white' },
              { name: 'Node.js', emoji: '🟢', color: 'bg-green-600 text-white' },
              { name: 'PostgreSQL', emoji: '🐘', color: 'bg-blue-700 text-white' },
              { name: 'MongoDB', emoji: '🍃', color: 'bg-green-500 text-white' },
              { name: 'Prisma ORM', emoji: '⚡', color: 'bg-indigo-600 text-white' },
              { name: 'Tailwind', emoji: '💨', color: 'bg-cyan-500 text-white' },
               { name: 'Python', emoji: '🐍', color: 'bg-yellow-400 text-gray-900' },
              { name: 'Vercel', emoji: '▲', color: 'bg-gray-900 text-white' },
              { name: 'Docker', emoji: '🐳', color: 'bg-blue-600 text-white' },
              { name: 'Redis', emoji: '🔴', color: 'bg-red-600 text-white' },
            { name: 'GitHub', emoji: '🐙', color: 'bg-gray-900 text-white' },

            ].map((tech, idx) => (
              <div
                key={idx}
                className={`${tech.color} p-4 rounded-xl text-center font-semibold shadow-lg hover:scale-110 transition-transform cursor-pointer`}
              >
                <div className="text-3xl mb-2">{tech.emoji}</div>
                <div className="text-xs">{tech.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-gray-50" >
        <div className="max-w-6xl mx-auto px-4">
          <div>
             <WorldMap dots={[
          {
            start: {
              lat: 64.2008,
              lng: -149.4937,
            }, // Alaska (Fairbanks)
            end: {
              lat: 34.0522,
              lng: -118.2437,
            }, // Los Angeles
          },
          {
            start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
            end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
          },
          {
            start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
            end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
          },
          {
            start: { lat: 51.5074, lng: -0.1278 }, // London
            end: { lat: 28.6139, lng: 77.209 }, // New Delhi
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
          },
        ]} />
              </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left - Contact Info */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Let's Build Your Next Product
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Have a SaaS idea? Need help scaling your platform? Or looking for a 
                technical co-founder? Let's discuss how we can bring your vision to life.
              </p>

              {/* What I Offer */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">What I Offer:</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span className="text-gray-700">End-to-end SaaS development</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full" />
                    <span className="text-gray-700">Architecture & system design consultation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    <span className="text-gray-700">Performance optimization & scaling</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full" />
                    <span className="text-gray-700">AI/ML integration & automation</span>
                  </div>
                </div>
              </div>

              {/* Contact Cards */}
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Email</div>
                    <div className="text-gray-600">krshnshrvstv.gwl@gmail.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Based In</div>
                    <div className="text-gray-600">India (Remote Worldwide)</div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
                <div className="flex gap-4">
                  <a
                    href="https://github.com/Krishna-Shrivastava-1"
                    target="_blank"
                    className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Github className="w-6 h-6 text-white" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/krishna-shrivastava-62b72129a/"
                    target="_blank"
                    className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Linkedin className="w-6 h-6 text-white" />
                  </a>
                  <a
                    href="https://x.com/Krishna__Stark"
                    target="_blank"
                    className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Twitter className="w-6 h-6 text-white" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right - Contact Form */}
            <div id="contact-form" className="bg-white rounded-2xl shadow-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Send Me a Message
            </h3>

            {status === 'success' ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h4>
                <p className="text-gray-600 mb-6">
                  Thanks for reaching out. I'll get back to you soon.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form  onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Project Inquiry / Collaboration"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Tell me about your project or inquiry..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>

                {status === 'error' && (
                  <p className="text-red-600 text-sm text-center">
                    Failed to send message. Please try again or email me directly.
                  </p>
                )}
              </form>
            )}
          </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Rocket className="w-16 h-16 mx-auto mb-6 animate-bounce" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Something Exceptional?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            From MVP to production—let's create a SaaS product that scales
          </p>
          <a
            href="#contact-form"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Start Your Project
          </a>
        </div>
      </section>
    </div>
  )
}

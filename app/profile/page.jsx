import Navbar from '@/components/Navbar'
import { Authorized } from '@/controllers/authControl'
import { redirect } from 'next/navigation'
import pool from '@/lib/db'
import { Calendar, Mail, BookMarked } from 'lucide-react'
import Image from 'next/image'
import EditNameDialog from '@/components/EditNameDialog'


export default async function ProfilePage() {
  const authUser = await Authorized()
  if (!authUser?.user) {
    redirect('/login')
  }

  const userId = authUser.user.id

  // Get user details
  const userResult = await pool.query(`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.image,
      u.role,
      u.provider,
      u.created_at,
      COALESCE((SELECT COUNT(*) FROM bookmark_user WHERE user_id = u.id), 0) AS bookmark_count,
      COALESCE((SELECT COUNT(*) FROM post_likes WHERE user_id = u.id), 0) AS like_count
    FROM users u
    WHERE u.id = $1
  `, [userId])

  const user = userResult.rows[0]

  // Get bookmarks
  const bookmarksResult = await pool.query(`
    SELECT 
      p.id,
      p.title,
      p.thumbnailimage,
      p.tag,
      p.created_at,
      u.name as author_name
    FROM bookmark_user bu
    JOIN posts p ON bu.post_id = p.id
    JOIN users u ON p.user_id = u.id
    WHERE bu.user_id = $1 AND p.public = TRUE
    ORDER BY bu.created_at DESC
    LIMIT 6
  `, [userId])

  const bookmarks = bookmarksResult.rows

  const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={128}
                    height={128}
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              {user.role === 'admin' && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  Admin
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              {/* ✅ Name with Edit Button */}
              <div className="flex items-center justify-center md:justify-start mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.name}
                </h1>
                <EditNameDialog currentName={user.name} userId={user.id} />
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {joinedDate}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 justify-center md:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.bookmark_count}
                  </div>
                  <div className="text-sm text-gray-600">Bookmarks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {user.like_count}
                  </div>
                  <div className="text-sm text-gray-600">Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {user.provider === 'google' ? '🔗' : '📧'}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {user.provider}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bookmarked Posts */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookMarked className="w-6 h-6 text-blue-600" />
              Your Bookmarks
            </h2>
            {bookmarks.length > 0 && (
              <a 
                href="/bookmarks" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All →
              </a>
            )}
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookMarked className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No bookmarks yet</p>
              <p className="text-sm mt-2">Start exploring articles!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((post) => (
                <a
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="group block bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative h-48">
                    <Image
                      src={post.thumbnailimage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      unoptimized
                    />
                    <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {post.tag}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600">
                      {post.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>By {post.author_name}</span>
                      <span>
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

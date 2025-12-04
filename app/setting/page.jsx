import Navbar from '@/components/Navbar'
import { Authorized } from '@/controllers/authControl'
import { redirect } from 'next/navigation'
import pool from '@/lib/db'
import { 
  User, 
  Mail, 
  Shield, 
  Trash2, 
  LogOut,
  Key,
  Bell,
  Globe
} from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'
import ChangePasswordButton from '@/components/ChangePasswordButton'
import DeleteAccountButton from '@/components/DeleteAccountButton'


export default async function SettingsPage() {
  const authUser = await Authorized()
  if (!authUser?.user) {
    redirect('/sign-in')
  }

  // Get user details
  const userResult = await pool.query(
    'SELECT id, name, email, role, provider, created_at FROM users WHERE id = $1',
    [authUser.user.id]
  )

  const user = userResult.rows[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
              <a 
                href="/profile" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Edit
              </a>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <span className="text-gray-400 text-sm">Cannot be changed</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="text-sm text-gray-600">Account Type</p>
                <p className="font-medium text-gray-900 capitalize">{user.provider}</p>
              </div>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                {user.provider === 'google' ? '🔗 Connected' : '📧 Email'}
              </span>
            </div>

            {/* <div className="flex justify-between items-center py-3">
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium text-gray-900 capitalize">{user.role}</p>
              </div>
              {user.role === 'admin' && (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                  ⭐ Admin
                </span>
              )}
            </div> */}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Security</h2>
          </div>

          <div className="space-y-4">
            {user.provider === 'credentials' && (
              <div className="flex justify-between items-center py-3 border-b">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Password</p>
                    <p className="text-sm text-gray-600">Change your password</p>
                  </div>
                </div>
                <ChangePasswordButton />
              </div>
            )}

            <div className="flex justify-between items-center py-3">
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Sign Out</p>
                  <p className="text-sm text-gray-600">Sign out from your account</p>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Language</p>
                  <p className="text-sm text-gray-600">English (US)</p>
                </div>
              </div>
              <span className="text-gray-400 text-sm">Coming soon</span>
            </div>

            <div className="flex justify-between items-center py-3">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
              </div>
              <span className="text-gray-400 text-sm">Coming soon</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Danger Zone</h2>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900 mb-1">Delete Account</p>
                <p className="text-sm text-gray-600">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <DeleteAccountButton userId={user.id} userName={user.name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

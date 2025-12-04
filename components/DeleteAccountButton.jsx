'use client'
import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'

export default function DeleteAccountButton({ userId, userName }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      alert('Please type DELETE to confirm')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE'
      })

      if (res.ok) {
        alert('Account deleted successfully')
        window.location.href = '/'
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete account')
      }
    } catch (error) {
      alert('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
      >
        Delete Account
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Delete Account?</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                This will permanently delete <strong>{userName}'s</strong> account and:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>All your bookmarks</li>
                <li>All your likes</li>
                <li>Your profile information</li>
                <li>All associated data</li>
              </ul>
              <p className="text-red-600 font-semibold mt-4 text-sm">
                ⚠️ This action cannot be undone!
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="DELETE"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirm(false)
                  setConfirmText('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || confirmText !== 'DELETE'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

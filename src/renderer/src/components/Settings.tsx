import { useState } from 'react'
import { Download } from 'lucide-react'
import { AppData } from '../types'

interface SettingsProps {
  data: AppData
}

export function Settings({ data }: SettingsProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function handleExport() {
    setError(null)
    setSuccess(null)

    try {
      const dataStr = JSON.stringify(data, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `networth-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setSuccess('Data exported successfully!')
    } catch (err) {
      setError(`Failed to export: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure app preferences</p>
      </div>

      {/* Backup Section */}
      <div className="space-y-6">
        <div className="bg-[#14141f] border border-white/5 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Download size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Data Backup</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Export your data as a JSON file for backup
              </p>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3 text-sm text-emerald-400">
              {success}
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Export Data as JSON
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">How to backup</h3>
        <ul className="text-xs text-gray-500 space-y-2">
          <li className="flex gap-2">
            <span className="text-indigo-400">•</span>
            <span>Click "Export Data as JSON" to download your data</span>
          </li>
          <li className="flex gap-2">
            <span className="text-indigo-400">•</span>
            <span>Save the file to Dropbox, Google Drive, or email it to yourself</span>
          </li>
          <li className="flex gap-2">
            <span className="text-indigo-400">•</span>
            <span>Your data is always saved locally on this computer</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

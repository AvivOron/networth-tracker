import { AppData, DriveSync } from '../types'

const FILE_NAME = 'networth-tracker-data.json'

export class DriveSyncService {
  static async findFileId(accessToken: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${FILE_NAME}'&spaces=drive&pageSize=1&fields=files(id)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to search Drive: ${response.statusText}`)
      }

      const result = await response.json()
      const files = result.files || []

      if (files.length > 0) {
        console.log(`Found file with ID: ${files[0].id}`)
        return files[0].id
      }

      console.log('File not found on Drive')
      return null
    } catch (error) {
      console.error('Error finding file:', error)
      throw error
    }
  }

  static async authenticate(): Promise<string> {
    // This will be called from the main process for OAuth flow
    // Returns access token
    if (!window.api?.authenticateWithGoogle) {
      throw new Error('Google Drive authentication not available')
    }
    return await window.api.authenticateWithGoogle()
  }

  static async uploadData(data: AppData, driveSync: DriveSync): Promise<DriveSync> {
    if (!driveSync.accessToken) {
      throw new Error('Not authenticated with Google Drive')
    }

    const fileContent = JSON.stringify(data, null, 2)
    const timestamp = new Date().toISOString()

    try {
      let fileId = driveSync.fileId

      if (!fileId) {
        // Create new file
        const metadata = {
          name: 'networth-tracker-data.json',
          mimeType: 'application/json'
        }

        const form = new FormData()
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
        form.append('file', new Blob([fileContent], { type: 'application/json' }))

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${driveSync.accessToken}`
          },
          body: form
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Drive upload error response:', errorText)
          throw new Error(`Drive upload failed: ${response.statusText} - ${errorText}`)
        }

        const result = await response.json()
        console.log('Upload response:', result)
        fileId = result.id
        if (!fileId) {
          console.error('No file ID in response:', result)
          throw new Error('Google Drive did not return a file ID')
        }
      } else {
        // Update existing file
        const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${driveSync.accessToken}`
          },
          body: fileContent
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Drive update error response:', errorText)
          throw new Error(`Drive update failed: ${response.statusText} - ${errorText}`)
        }
      }

      return {
        ...driveSync,
        fileId,
        lastSyncAt: timestamp
      }
    } catch (error) {
      throw new Error(`Failed to sync with Google Drive: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  static async downloadData(driveSync: DriveSync): Promise<AppData | null> {
    console.log('downloadData called with driveSync:', { accessToken: !!driveSync.accessToken, fileId: driveSync.fileId })
    if (!driveSync.accessToken) {
      console.error('No access token available')
      return null
    }
    if (!driveSync.fileId) {
      console.error('No file ID available - file may not have been synced yet')
      return null
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${driveSync.fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${driveSync.accessToken}`
          }
        }
      )

      if (!response.ok) {
        if (response.status === 404) {
          return null // File not found, will create new one
        }
        throw new Error(`Drive download failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      throw new Error(`Failed to download from Google Drive: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  static async revokeAccess(accessToken: string): Promise<void> {
    try {
      await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `token=${accessToken}`
      })
    } catch (error) {
      console.error('Failed to revoke Google Drive access:', error)
    }
  }
}

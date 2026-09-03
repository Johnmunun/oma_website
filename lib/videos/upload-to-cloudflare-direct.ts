/**
 * Upload client vers Cloudflare Stream (multipart ≤200 Mo ou tus resumable)
 */

import * as tus from 'tus-js-client'
import {
  CLOUDFLARE_MULTIPART_MAX_BYTES,
  CLOUDFLARE_TUS_MAX_BYTES,
} from '@/lib/videos/cloudflare-stream-limits'

export { CLOUDFLARE_MULTIPART_MAX_BYTES, CLOUDFLARE_TUS_MAX_BYTES }

export async function uploadFileToCloudflareDirectUrl(
  uploadURL: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', uploadURL)
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return
      onProgress(Math.round((event.loaded / event.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100)
        resolve()
        return
      }
      reject(new Error(`Échec upload Cloudflare (${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error('Erreur réseau pendant l’upload'))
    xhr.onabort = () => reject(new Error('Upload annulé'))

    const body = new FormData()
    body.append('file', file)
    xhr.send(body)
  })
}

/** Upload resumable tus (gros fichiers / connexions instables) */
export async function uploadFileToCloudflareTusUrl(
  uploadURL: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      uploadUrl: uploadURL,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      chunkSize: 50 * 1024 * 1024,
      metadata: {
        filename: file.name,
        filetype: file.type || 'video/mp4',
      },
      onError: (error) => {
        reject(error instanceof Error ? error : new Error('Échec upload tus'))
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        if (!onProgress || !bytesTotal) return
        onProgress(Math.min(100, Math.round((bytesUploaded / bytesTotal) * 100)))
      },
      onSuccess: () => {
        onProgress?.(100)
        resolve()
      },
    })
    upload.start()
  })
}

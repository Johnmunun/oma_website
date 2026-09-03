/**
 * Upload d'un fichier vers une URL Cloudflare Stream (direct upload ≤ 200 Mo)
 */

export async function uploadFileToCloudflareDirectUrl(
  uploadURL: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<void> {
  // XHR pour suivre la progression (fetch ne l'expose pas facilement)
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

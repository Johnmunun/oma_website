/**
 * @file lib/imagekit.ts
 * @description Configuration ImageKit pour upload et transformation d'images
 * Remplace Supabase Storage
 *
 * Lazy-init : ne pas throw au import (sinon le build Vercel échoue
 * si les env ImageKit manquent pendant "collect page data").
 */

import ImageKit from 'imagekit'

let imagekitInstance: ImageKit | null = null

function requireImageKitEnv() {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY?.trim()
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim()
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT?.trim()

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error(
      'ImageKit non configuré (IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT)'
    )
  }

  return { publicKey, privateKey, urlEndpoint }
}

function getImageKit(): ImageKit {
  if (!imagekitInstance) {
    const env = requireImageKitEnv()
    imagekitInstance = new ImageKit(env)
  }
  return imagekitInstance
}

/** @deprecated Prefer getImageKit() — kept for any direct imports */
export const imagekit = new Proxy({} as ImageKit, {
  get(_target, prop, receiver) {
    const client = getImageKit() as unknown as Record<string | symbol, unknown>
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

/**
 * Génère une URL signée pour upload sécurisé
 */
export async function getImageKitUploadToken(fileName: string, folder?: string) {
  try {
    const env = requireImageKitEnv()
    const authenticationParameters = getImageKit().getAuthenticationParameters()

    return {
      token: authenticationParameters.token,
      signature: authenticationParameters.signature,
      expire: authenticationParameters.expire,
      publicKey: env.publicKey,
      urlEndpoint: env.urlEndpoint,
      folder: folder || '/uploads',
    }
  } catch (error) {
    console.error('[ImageKit] Erreur génération token:', error)
    throw error instanceof Error
      ? error
      : new Error('Erreur lors de la génération du token ImageKit')
  }
}

/**
 * Upload un fichier directement depuis le serveur
 */
export async function uploadToImageKit(
  file: Buffer | string,
  fileName: string,
  folder: string = '/uploads'
) {
  try {
    const result = await getImageKit().upload({
      file: file,
      fileName: fileName,
      folder: folder,
    })

    return {
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      size: result.size,
    }
  } catch (error) {
    console.error('[ImageKit] Erreur upload:', error)
    throw error instanceof Error
      ? error
      : new Error("Erreur lors de l'upload vers ImageKit")
  }
}

/**
 * Génère une URL avec transformations ImageKit
 */
export function getImageKitUrl(
  imagePath: string,
  transformations?: {
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'jpg' | 'png'
    crop?: 'maintain_ratio' | 'force' | 'at_least' | 'at_max'
  }
) {
  if (!imagePath) return ''

  const client = getImageKit()
  const transformation = transformations
    ? [
        {
          width: transformations.width,
          height: transformations.height,
          quality: transformations.quality || 80,
          format: transformations.format || 'auto',
          crop: transformations.crop || 'maintain_ratio',
        },
      ]
    : []

  if (imagePath.startsWith('http')) {
    return client.url({
      src: imagePath,
      transformation,
    })
  }

  return client.url({
    path: imagePath,
    transformation,
  })
}

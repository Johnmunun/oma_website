/**
 * @file lib/imagekit.ts
 * @description Configuration ImageKit pour upload et transformation d'images
 * Remplace Supabase Storage
 */

import ImageKit from 'imagekit'

if (!process.env.IMAGEKIT_PUBLIC_KEY) {
  throw new Error('IMAGEKIT_PUBLIC_KEY is not set')
}

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  throw new Error('IMAGEKIT_PRIVATE_KEY is not set')
}

if (!process.env.IMAGEKIT_URL_ENDPOINT) {
  throw new Error('IMAGEKIT_URL_ENDPOINT is not set')
}

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
})

/**
 * Génère une URL signée pour upload sécurisé
 * @param fileName - Nom du fichier
 * @param folder - Dossier de destination (optionnel)
 * @returns Token et signature pour upload
 */
export async function getImageKitUploadToken(fileName: string, folder?: string) {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters(
      undefined,
      undefined,
      {
        folder: folder || '/uploads',
      }
    )

    return {
      token: authenticationParameters.token,
      signature: authenticationParameters.signature,
      expire: authenticationParameters.expire,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    }
  } catch (error) {
    console.error('[ImageKit] Erreur génération token:', error)
    throw new Error('Erreur lors de la génération du token ImageKit')
  }
}

/**
 * Upload un fichier directement depuis le serveur
 * @param file - Buffer ou base64 du fichier
 * @param fileName - Nom du fichier
 * @param folder - Dossier de destination
 * @returns URL de l'image uploadée
 */
export async function uploadToImageKit(
  file: Buffer | string,
  fileName: string,
  folder: string = '/uploads'
) {
  try {
    const result = await imagekit.upload({
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
    throw new Error('Erreur lors de l\'upload vers ImageKit')
  }
}

/**
 * Génère une URL avec transformations ImageKit
 * @param imagePath - Chemin de l'image (URL complète ou chemin relatif)
 * @param transformations - Options de transformation
 * @returns URL avec transformations appliquées
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

  // Si c'est déjà une URL ImageKit, utiliser directement
  if (imagePath.startsWith('http')) {
    return imagekit.url({
      src: imagePath,
      transformation: transformations
        ? [
            {
              width: transformations.width,
              height: transformations.height,
              quality: transformations.quality || 80,
              format: transformations.format || 'auto',
              crop: transformations.crop || 'maintain_ratio',
            },
          ]
        : [],
    })
  }

  // Sinon, construire l'URL depuis le chemin
  return imagekit.url({
    path: imagePath,
    transformation: transformations
      ? [
          {
            width: transformations.width,
            height: transformations.height,
            quality: transformations.quality || 80,
            format: transformations.format || 'auto',
            crop: transformations.crop || 'maintain_ratio',
          },
        ]
      : [],
  })
}



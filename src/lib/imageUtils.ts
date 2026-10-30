/**
 * Utilidad de optimización y compresión de imágenes para el navegador.
 * Convierte archivos de imagen a WebP livianos (máx 400x400) para almacenamiento eficiente.
 */
export function processImageFile(
  file: File,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado debe ser una imagen válida (PNG, JPG, WEBP).'))
      return
    }

    // Límite de tamaño de entrada original de 15MB
    if (file.size > 15 * 1024 * 1024) {
      reject(new Error('La imagen es demasiado pesada. Elige una de menos de 15MB.'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(e.target?.result as string)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        // Convertir a formato WebP optimizado
        const compressedDataUrl = canvas.toDataURL('image/webp', quality)
        resolve(compressedDataUrl)
      }
      img.onerror = () => reject(new Error('No se pudo procesar la imagen seleccionada.'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo en el navegador.'))
    reader.readAsDataURL(file)
  })
}

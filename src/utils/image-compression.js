import sharp from 'sharp';
import fs from 'fs';

/**
 * Compresses an image at the given file path and replaces the original image with the compressed version.
 * @param {string} filePath - Path to the image file to be compressed.
 * @param {object} [options] - Optional settings for compression.
 * @param {number} [options.width=800] - Maximum width of the compressed image.
 * @param {number} [options.quality=80] - Quality of the compressed image (1-100) for JPEG and WebP.
 */
async function compressAndReplaceImage(filePath, options = {}) {
  const { width = 800, quality = 80 } = options;

  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File does not exist.');
    }

    // Determine the file extension
    const fileExtension = filePath.split('.').pop().toLowerCase();

    // Compress the image using sharp
    let compressedImageBuffer;
    switch (fileExtension) {
      case 'jpeg':
      case 'jpg':
        compressedImageBuffer = await sharp(filePath)
          .resize({ width })
          .toFormat('jpeg', { quality })
          .toBuffer();
        break;

      case 'png':
        compressedImageBuffer = await sharp(filePath)
          .resize({ width })
          .toFormat('png', { compressionLevel: 9 }) // Use maximum compression for PNG
          .toBuffer();
        break;

      case 'webp':
        compressedImageBuffer = await sharp(filePath)
          .resize({ width })
          .toFormat('webp', { quality })
          .toBuffer();
        break;

      case 'gif':
        compressedImageBuffer = await sharp(filePath)
          .resize({ width })
          .toFormat('gif', { delay: 100 }) // Adjust delay for GIF frames if needed
          .toBuffer();
        break;

      case 'svg':
        compressedImageBuffer = await sharp(filePath)
          .resize({ width })
          .toFormat('png') // Rasterize SVG to PNG
          .toBuffer();
        break;

      default:
        throw new Error('Unsupported file format.');
    }

    // Replace the original image with the compressed one
    fs.writeFileSync(filePath, compressedImageBuffer);

    console.log('Image compressed and replaced successfully.');
  } catch (error) {
    console.error('Error compressing image:', error.message);
  }
}

export default compressAndReplaceImage;

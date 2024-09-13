import fs from 'fs';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function compressImage(filePath) {
  try {
    // Log the file path
    console.log(`Compressing file at path: ${filePath}`);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist at path: ${filePath}`);
    }

    // Compress the image using sharp
    const compressedImageBuffer = await sharp(filePath)
      .resize({ width: 800 })
      .toFormat('jpeg', { quality: 80 })
      .toBuffer();

    // Replace the original image with the compressed one
    fs.writeFileSync(filePath, compressedImageBuffer);

    console.log('Image compressed and replaced successfully.');
  } catch (error) {
    console.error('Error compressing image:', {
      message: error.message,
      stack: error.stack,
      errno: error.errno,
      code: error.code,
      syscall: error.syscall,
      path: error.path
    });
  }
}

// Example usage
const imagePath = path.join(__dirname, 'hello.jpg');
console.log(`Checking file existence at: ${imagePath}`);
console.log(`File exists: ${fs.existsSync(imagePath)}`);
compressImage(imagePath);

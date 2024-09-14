import sharp from "sharp";
import fs from 'fs'
import path from "path";
const compressAndReplaceImage = async (inputPath) => {
  try {
    // Define the temporary compressed image path
    const tempPath = `${inputPath}.temp`;

    // Compress the image
    await sharp(inputPath)
      .resize(800) // Resize if needed (optional)
      .jpeg({ quality: 70 }) // Adjust quality as needed
      .toFile(tempPath);

    // Replace the original image with the compressed image
    fs.rename(tempPath, inputPath, (err) => {
      if (err) {
        console.error('Error replacing image:', err);
      } else {
        console.log('Image compressed and replaced successfully');
      }
    });
  } catch (error) {
    console.error('Error compressing image:', error);
  }
};

// Example usage
export { compressAndReplaceImage };


import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILENAME = 'profile.png';
const OUTPUT_FILENAME = 'profile-base64.txt';

const inputPath = path.join(__dirname, INPUT_FILENAME);
const outputPath = path.join(__dirname, OUTPUT_FILENAME);

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function assertIsPng(buffer, filePath) {
  const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const header = buffer.subarray(0, PNG_SIGNATURE.length);

  if (!header.equals(PNG_SIGNATURE)) {
    throw new Error(
      `File "${filePath}" does not appear to be a valid PNG (signature mismatch).`
    );
  }
}

async function convertProfileImageToBase64() {
  const exists = await fileExists(inputPath);

  if (!exists) {
    throw new Error(
      `Required input file not found: "${inputPath}". ` +
        `Please place a valid PNG file named "${INPUT_FILENAME}" inside the "assets" directory before running this script.`
    );
  }

  const imageBuffer = await fs.readFile(inputPath);

  assertIsPng(imageBuffer, inputPath);

  const base64String = imageBuffer.toString('base64');

  await fs.writeFile(outputPath, base64String, { encoding: 'utf8' });

  console.log(`Success: "${INPUT_FILENAME}" (${imageBuffer.length} bytes) encoded to Base64.`);
  console.log(`Output written to: "${outputPath}" (${base64String.length} characters).`);
}

convertProfileImageToBase64().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});

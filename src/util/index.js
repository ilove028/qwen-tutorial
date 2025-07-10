import dotenv from "dotenv";
import path from 'path'
import { readFileSync } from 'fs';

export function getEnv() {
  return dotenv.config({ path: [path.resolve(import.meta.dirname, '../../.env.local'), path.resolve(import.meta.dirname, '../../.env')] });
}

export function encodeImage(imagePath) {
  const imageFile = readFileSync(path.resolve(import.meta.dirname, '../../', imagePath));
  return imageFile.toString('base64');
};
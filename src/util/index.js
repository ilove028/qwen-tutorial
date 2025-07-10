import dotenv from "dotenv";
import path from 'path'

export function getEnv() {
  return dotenv.config({ path: [path.resolve(import.meta.dirname, '../../.env.local'), path.resolve(import.meta.dirname, '../../.env')] });
}
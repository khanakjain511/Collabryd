import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "./../../../../.env"),
});

const PORT = process.env.BACKEND_PORT || 3000

export {PORT}
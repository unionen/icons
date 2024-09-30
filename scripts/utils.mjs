import fs from "fs";
import { dirname, resolve, join, basename, extname } from "path";
import { fileURLToPath } from "url";
import ora from "ora";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const rootDir = resolve(__dirname, "../");

export const msg = {
  error: (m) => console.log(chalk.bold.red(m)),
  info: (m) => console.log(chalk.cyan(m)),
  success: (m) => console.log(chalk.green(m)),
  label: (m) => console.log(chalk.bold.magenta(m)),
  headline: (m) =>
    console.log(
      chalk.bold.magenta(
        `\n\n${"=".repeat(Math.min(80, m.length))}\n${m}\n${"=".repeat(
          Math.min(80, m.length)
        )}\n`
      )
    ),
  loader: ora(),
};

/**
 * Given a directory return all files recursively from subdirectories
 */
export function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(join(dirPath, "/", file));
    }
  });
  return arrayOfFiles;
}

/**
 * Get the available icons from the icons directory.
 */
export function getIcons() {
  const iconFiles = getAllFiles(resolve(rootDir, "src/icons"));
  const icons = {};
  iconFiles.forEach((filePath) => {
    const extension = extname(filePath);
    if (extension !== ".ts") return;
    const file = basename(filePath, extension);
    const name = toCamelCase(file);
    let data = fs.readFileSync(filePath, "utf8");
    data = data.replace("export default `", "").replace("</svg>`", "</svg>");
    icons[name] = data;
  });
  return icons;
}

/** Given a string, convert it to camelCase */
export function toCamelCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}


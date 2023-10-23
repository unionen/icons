import { dirname, resolve, join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { execa } from 'execa'
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'
import { getIcons } from './utils.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '../')
const rollup = `${rootDir}/node_modules/.bin/rollup`

/**
 * Build the  package.
 * @returns
 */
export async function buildPackage() {
  const startTime = performance.now()
  await cleanDist()
  await bundle('icons', 'esm')
  await bundle('icons', 'cjs')
  await declarations()

  const icons = getIcons()

  await fs.mkdir(
    resolve(rootDir, 'dist/icons'),
    { recursive: true },
    (err) => {
      if (err) throw err
    }
  )
  Object.keys(icons).forEach(async (icon) => {
    await fs.writeFile(
      resolve(rootDir, 'dist/icons', `${icon}.svg`),
      icons[icon]
    )
  })
}

/**
 * Remove the dist directory before building anything.
 */
async function cleanDist() {
  const distDir = `${rootDir}/dist`;
  console.log(`Removing: ${distDir}`);
  try {
    await fs.access(distDir)
    const files = await fs.readdir(distDir)
    await Promise.all(
      files.map((file) => fs.rm(resolve(distDir, file), { recursive: true }))
    )
  } catch {
    console.log('directory is already missing, no need to clean it');
  }
  console.log('» cleaned dist artifacts')
}

/**
 * Create a new bundle of a certain format for a certain package.
 * @param p package name
 * @param format the format to create (cjs, esm, umd, etc...)
 */
async function bundle(p, format, subPackage) {
  const args = [
    { name: 'PKG', value: p },
    { name: 'FORMAT', value: format },
  ]
  console.log(`Bundling ${p} as ${format}`);
  await execa(rollup, [
    '-c',
    '--environment',
    args.map(({ name, value }) => `${name}:${value}`).join(','),
  ])
}

/**
 * Emit type declarations for the package to the dist directory.
 */
async function declarations(plugin = '') {
  console.log('Emitting type declarations')
  const args = [
    { name: 'PKG', value: 'icons' },
    { name: 'FORMAT', value: 'esm' },
    { name: 'DECLARATIONS', value: 1 },
  ]
  if (plugin) args.push({ name: 'PLUGIN', value: plugin })
  const output = await execa(rollup, [
    '-c',
    '--environment',
    args.map(({ name, value }) => `${name}:${value}`).join(','),
  ])
  if (output.exitCode) {
    console.log(output)
    process.exit()
  }
  // Annoyingly even though we tell @rollup/plugin-typescript
  // emitDeclarationOnly it still outputs an index.js — is this a bug?
  const artifactToDelete = resolve(
    rootDir,
    `dist/${plugin ? plugin + '/' : ''}index.js`
  )
  let shouldDelete
  try {
    shouldDelete = await fs.stat(artifactToDelete)
  } catch {
    shouldDelete = false
  }
  if (shouldDelete) {
    await fs.rm(artifactToDelete)
  }
  console.log('Rolling up type declarations')
  await apiExtractor()
  console.log('done rolling up')
}

/**
 * Use API Extractor to rollup the type declarations.
 */
async function apiExtractor() {
  const configPath = resolve(rootDir, 'api-extractor.json')
  const config = ExtractorConfig.loadFileAndPrepare(configPath)
  const result = Extractor.invoke(config, {
    localBuild: true,
    showVerboseMessages: false,
  })
  if (result.succeeded) {
    const distRoot = resolve(rootDir, 'dist')
    const distFiles = await fs.readdir(distRoot, { withFileTypes: true })
    await Promise.all(
      distFiles.map((file) => {
        return file.name !== 'index.all.d.ts' &&
          (file.isDirectory() || file.name.endsWith('d.ts'))
          ? fs.rm(resolve(distRoot, file.name), { recursive: true })
          : Promise.resolve()
      })
    )
    await fs.rm(resolve(distRoot, 'tsdoc-metadata.json'))
    await fs.rename(
      resolve(distRoot, 'index.all.d.ts'),
      resolve(distRoot, 'index.d.ts')
    )
  } else {
    msg.error('Api extractor failed.')
    process.exitCode = 1
  }
}

buildPackage();


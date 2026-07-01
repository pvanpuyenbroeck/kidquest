#!/usr/bin/env node
/**
 * Generate PNG + ICO app icons from public/icon.svg
 * Run: node scripts/generate-icons.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svg = readFileSync(join(root, 'public/icon.svg'))

const sizes = [
  { path: 'public/icons/icon-16.png', size: 16 },
  { path: 'public/icons/icon-32.png', size: 32 },
  { path: 'public/icons/icon-180.png', size: 180 },
  { path: 'public/icons/icon-192.png', size: 192 },
  { path: 'public/icons/icon-512.png', size: 512 },
  { path: 'src/app/icon.png', size: 192 },
  { path: 'src/app/apple-icon.png', size: 180 },
]

mkdirSync(join(root, 'public/icons'), { recursive: true })

for (const { path, size } of sizes) {
  const out = join(root, path)
  mkdirSync(dirname(out), { recursive: true })
  await sharp(svg).resize(size, size).png().toFile(out)
  console.log(`✓ ${path} (${size}px)`)
}

// favicon.ico with 16 + 32 layers
const png16 = await sharp(svg).resize(16, 16).png().toBuffer()
const png32 = await sharp(svg).resize(32, 32).png().toBuffer()

// Build minimal ICO (PNG-embedded entries)
function pngToIco(pngBuffers) {
  const images = pngBuffers.map((buf) => {
    const size = buf.readUInt32BE(16) // IHDR width at offset 16
    return { size, buf }
  })

  const count = images.length
  const headerSize = 6 + count * 16
  let offset = headerSize
  const entries = []

  for (const { size, buf } of images) {
    entries.push({ size, buf, offset })
    offset += buf.length
  }

  const total = offset
  const ico = Buffer.alloc(total)
  ico.writeUInt16LE(0, 0)
  ico.writeUInt16LE(1, 2)
  ico.writeUInt16LE(count, 4)

  let entryOffset = 6
  for (const { size, buf, offset: dataOffset } of entries) {
    ico.writeUInt8(size >= 256 ? 0 : size, entryOffset)
    ico.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1)
    ico.writeUInt8(0, entryOffset + 2)
    ico.writeUInt8(0, entryOffset + 3)
    ico.writeUInt16LE(1, entryOffset + 4)
    ico.writeUInt16LE(32, entryOffset + 6)
    ico.writeUInt32LE(buf.length, entryOffset + 8)
    ico.writeUInt32LE(dataOffset, entryOffset + 12)
    entryOffset += 16
  }

  let dataOffset = headerSize
  for (const { buf } of entries) {
    buf.copy(ico, dataOffset)
    dataOffset += buf.length
  }

  return ico
}

const ico = pngToIco([png16, png32])
writeFileSync(join(root, 'src/app/favicon.ico'), ico)
console.log('✓ src/app/favicon.ico')

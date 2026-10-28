import { spawn } from 'node:child_process'
import path from 'node:path'
import { getCorePath } from './getCorePath'

const CRC32_FALLBACK = '00000000'
const CRC32_REGEX = /([0-9A-Fa-f]{8})/g

/**
 * 使用 VSET-core 目录下的 7z.exe 计算文件的 CRC32
 * @param filePath 文件绝对路径
 * @returns 8 位十六进制 CRC32 字符串，失败时返回 00000000
 */
export async function getFileCrc32(filePath: string): Promise<string> {
  const sevenZPath = path.join(getCorePath(), '7z.exe')
  return new Promise((resolve) => {
    const proc = spawn(sevenZPath, ['h', '-scrcCRC32', filePath], {
      windowsHide: true,
      shell: false,
    })
    let stdout = ''
    let stderr = ''
    proc.stdout?.on('data', (chunk: Buffer) => { stdout += chunk.toString() })
    proc.stderr?.on('data', (chunk: Buffer) => { stderr += chunk.toString() })
    proc.on('error', () => resolve(CRC32_FALLBACK))
    proc.on('close', () => {
      const output = stdout + stderr
      const baseName = path.basename(filePath)
      const lines = output.split(/\r?\n/)
      for (const line of lines) {
        if (line.includes(baseName)) {
          const match = line.match(/([0-9A-Fa-f]{8})/)
          if (match) {
            resolve(match[1].toUpperCase())
            return
          }
        }
      }
      const allHex = output.match(CRC32_REGEX)
      if (allHex && allHex.length > 0)
        resolve(allHex[allHex.length - 1].toUpperCase())
      else
        resolve(CRC32_FALLBACK)
    })
  })
}

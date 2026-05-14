import { getEncoding } from "js-tiktoken"

let enc: ReturnType<typeof getEncoding> | null = null

function getEncoder() {
  if (!enc) {
    enc = getEncoding("o200k_base")
  }
  return enc
}

export function countTokens(text: string): number {
  const encoder = getEncoder()
  return encoder.encode(text).length
}

/**
 * Extracts plain text from Lexical editor content
 */
function extractTextFromLexical(node: any): string {
  if (!node) return ''

  if (typeof node === 'string') {
    return node
  }

  if (Array.isArray(node)) {
    return node.map(extractTextFromLexical).join(' ')
  }

  if (typeof node === 'object') {
    // Extract text from text nodes
    if (node.text) {
      return node.text
    }

    // Recursively extract from children
    if (node.children) {
      return extractTextFromLexical(node.children)
    }

    // Extract from other text properties
    if (node.content) {
      return extractTextFromLexical(node.content)
    }
  }

  return ''
}

/**
 * Calculates reading time in minutes from Lexical content
 * Assumes average reading speed of 200 words per minute
 */
export function calculateReadingTime(content: any): number {
  if (!content) return 0

  const text = extractTextFromLexical(content)
  const words = text.trim().split(/\s+/).filter(word => word.length > 0)
  const wordsPerMinute = 200
  const minutes = Math.ceil(words.length / wordsPerMinute)

  return Math.max(1, minutes) // At least 1 minute
}


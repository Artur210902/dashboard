import * as cheerio from 'cheerio'

export interface ScrapeResult {
  price: number | null
  name: string | null
  error?: string
}

export async function scrapePrice(
  url: string,
  priceSelector: string,
  nameSelector?: string | null
): Promise<ScrapeResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract price
    let priceText = $(priceSelector).first().text().trim()
    if (!priceText) {
      // Try to find price in data attributes
      priceText = $(priceSelector).first().attr('data-price') || ''
    }

    // Clean price text - remove currency symbols and whitespace
    priceText = priceText.replace(/[^\d.,]/g, '')
    
    // Handle European number format (1.234,56) vs US format (1,234.56)
    // If there are both dots and commas, determine which is decimal separator
    const hasDot = priceText.includes('.')
    const hasComma = priceText.includes(',')
    
    let normalized: string
    if (hasDot && hasComma) {
      // Determine which is the decimal separator based on position
      const lastDot = priceText.lastIndexOf('.')
      const lastComma = priceText.lastIndexOf(',')
      
      if (lastComma > lastDot) {
        // European format: 1.234,56 (dot = thousands, comma = decimal)
        normalized = priceText.replace(/\./g, '').replace(',', '.')
      } else {
        // US format: 1,234.56 (comma = thousands, dot = decimal)
        normalized = priceText.replace(/,/g, '')
      }
    } else if (hasComma) {
      // Only comma - could be European decimal or thousands separator
      // If comma is in last 3 positions, treat as decimal separator
      const commaIndex = priceText.indexOf(',')
      if (priceText.length - commaIndex <= 3) {
        // Likely decimal separator (e.g., "123,45")
        normalized = priceText.replace(',', '.')
      } else {
        // Likely thousands separator (e.g., "1,234")
        normalized = priceText.replace(/,/g, '')
      }
    } else {
      // Only dot or no separators - use as is
      normalized = priceText
    }
    
    const price = parseFloat(normalized) || null

    // Extract product name if selector provided
    let name: string | null = null
    if (nameSelector) {
      name = $(nameSelector).first().text().trim() || null
    }

    if (price === null) {
      return {
        price: null,
        name,
        error: 'Price not found or invalid',
      }
    }

    return {
      price,
      name,
    }
  } catch (error: any) {
    return {
      price: null,
      name: null,
      error: error.message || 'Scraping failed',
    }
  }
}

export function extractPriceFromText(text: string): number | null {
  // Remove all non-numeric characters except dots and commas
  const cleaned = text.replace(/[^\d.,]/g, '')
  
  // Handle European number format (1.234,56) vs US format (1,234.56)
  const hasDot = cleaned.includes('.')
  const hasComma = cleaned.includes(',')
  
  let normalized: string
  if (hasDot && hasComma) {
    // Determine which is the decimal separator based on position
    const lastDot = cleaned.lastIndexOf('.')
    const lastComma = cleaned.lastIndexOf(',')
    
    if (lastComma > lastDot) {
      // European format: 1.234,56 (dot = thousands, comma = decimal)
      normalized = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      // US format: 1,234.56 (comma = thousands, dot = decimal)
      normalized = cleaned.replace(/,/g, '')
    }
  } else if (hasComma) {
    // Only comma - check if it's likely decimal or thousands separator
    const commaIndex = cleaned.indexOf(',')
    if (cleaned.length - commaIndex <= 3) {
      // Likely decimal separator (e.g., "123,45")
      normalized = cleaned.replace(',', '.')
    } else {
      // Likely thousands separator (e.g., "1,234")
      normalized = cleaned.replace(/,/g, '')
    }
  } else {
    // Only dot or no separators - use as is
    normalized = cleaned
  }
  
  const price = parseFloat(normalized)
  return isNaN(price) ? null : price
}

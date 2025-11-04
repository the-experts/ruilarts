import { createServerFn } from '@tanstack/react-start'

export interface PDOKAddress {
  street: string
  city: string
  province: string
}

/**
 * Server function to lookup address using PDOK API
 * This is free Dutch government API
 */
export const lookupPDOKAddress = createServerFn('GET', async (args: {
  postalCode: string
  houseNumber: string
}): Promise<PDOKAddress | null> => {
  try {
    // Normalize inputs
    const pc = args.postalCode.replace(/\s/g, '').toUpperCase()
    const hn = args.houseNumber.trim()

    if (!pc || !hn) {
      return null
    }

    // PDOK API endpoint
    const url = new URL('https://api.pdok.nl/bzk/locatieserver/search/v3_1/free')
    url.searchParams.set('q', `${pc} ${hn}`)
    url.searchParams.set('rows', '1')
    url.searchParams.set('fl', 'weergavenaam,type')

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      console.error('PDOK API error:', response.status)
      return null
    }

    const data = await response.json() as any

    if (!data.response?.docs || data.response.docs.length === 0) {
      return null
    }

    const result = data.response.docs[0]
    const weergavenaam = result.weergavenaam as string

    // Parse weergavenaam (e.g., "Kerkstraat 5, 1234 AB Amsterdam")
    const parts = weergavenaam.split(',').map((p: string) => p.trim())
    if (parts.length < 2) {
      return null
    }

    const street = parts[0]
    const cityPart = parts[parts.length - 1]

    // Extract city from postal code + city format
    const cityMatch = cityPart.match(/\d{4}\s*[A-Z]{2}\s+(.+)/)
    const city = cityMatch ? cityMatch[1] : cityPart

    return {
      street,
      city,
      province: '',
    }
  } catch (error) {
    console.error('PDOK lookup error:', error)
    return null
  }
})

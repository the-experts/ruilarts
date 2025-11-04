import { PG } from '@/context/registration-form'

/**
 * Mock huisartsen (GP practices) data
 * Based on Dutch postal code structure and major cities
 */
export const mockPGs: PG[] = [
  // Amsterdam (1000-1200)
  {
    id: 'pg-001',
    name: 'Huisartsenpraktijk Centrum Amsterdam',
    address: 'Damrak 50',
    postalCode: '1012 LM',
    city: 'Amsterdam',
    lat: 52.3676,
    lng: 4.9041,
  },
  {
    id: 'pg-002',
    name: 'Arts in de Pijp',
    address: 'Albert Cuyp Straat 210',
    postalCode: '1072 CV',
    city: 'Amsterdam',
    lat: 52.3642,
    lng: 4.8952,
  },
  {
    id: 'pg-003',
    name: 'De Gezonde Huisarts',
    address: 'Westerstraat 30',
    postalCode: '1015 MJ',
    city: 'Amsterdam',
    lat: 52.3797,
    lng: 4.8841,
  },

  // Utrecht (3500-3600)
  {
    id: 'pg-004',
    name: 'Huisartsenpraktijk Centrum Utrecht',
    address: 'Domplein 10',
    postalCode: '3512 JC',
    city: 'Utrecht',
    lat: 52.0907,
    lng: 5.1214,
  },
  {
    id: 'pg-005',
    name: 'Arts aan de Domstraat',
    address: 'Domstraat 5',
    postalCode: '3512 BL',
    city: 'Utrecht',
    lat: 52.0905,
    lng: 5.1215,
  },
  {
    id: 'pg-006',
    name: 'Gezondheid Utrecht',
    address: 'Houtstraat 125',
    postalCode: '3512 CH',
    city: 'Utrecht',
    lat: 52.0895,
    lng: 5.1243,
  },

  // Rotterdam (3000-3100)
  {
    id: 'pg-007',
    name: 'Huisartsenpraktijk Centrum Rotterdam',
    address: 'Coolsingel 60',
    postalCode: '3011 AD',
    city: 'Rotterdam',
    lat: 51.9225,
    lng: 4.4792,
  },
  {
    id: 'pg-008',
    name: 'Arts Blaaktuin',
    address: 'Blaaktuin 15',
    postalCode: '3011 TA',
    city: 'Rotterdam',
    lat: 51.9231,
    lng: 4.4823,
  },
  {
    id: 'pg-009',
    name: 'Praktijk aan de Maas',
    address: 'Maaskade 10',
    postalCode: '3011 PA',
    city: 'Rotterdam',
    lat: 51.9245,
    lng: 4.4812,
  },

  // The Hague / Den Haag (2500-2600)
  {
    id: 'pg-010',
    name: 'Huisartsenpraktijk Centrum Den Haag',
    address: 'Zeestraat 100',
    postalCode: '2587 AA',
    city: 'Den Haag',
    lat: 52.0755,
    lng: 4.2871,
  },
  {
    id: 'pg-011',
    name: 'Arts op het Plein',
    address: 'Plein 1813 no. 5',
    postalCode: '2595 AA',
    city: 'Den Haag',
    lat: 52.0765,
    lng: 4.3142,
  },
  {
    id: 'pg-012',
    name: 'Gezondheidscentrum Scheveningen',
    address: 'Kurhausplein 2',
    postalCode: '2586 AB',
    city: 'Den Haag',
    lat: 52.1084,
    lng: 4.2734,
  },

  // Eindhoven (5600-5700)
  {
    id: 'pg-013',
    name: 'Huisartsenpraktijk Centrum Eindhoven',
    address: 'Dommelstraat 30',
    postalCode: '5611 CL',
    city: 'Eindhoven',
    lat: 51.4416,
    lng: 5.4697,
  },
  {
    id: 'pg-014',
    name: 'Arts aan de Dommel',
    address: 'Noormannenplein 2',
    postalCode: '5644 RA',
    city: 'Eindhoven',
    lat: 51.4462,
    lng: 5.4615,
  },
  {
    id: 'pg-015',
    name: 'Praktijk Gesundheid',
    address: 'Hurksestraat 40',
    postalCode: '5642 AM',
    city: 'Eindhoven',
    lat: 51.4482,
    lng: 5.4588,
  },

  // Groningen (9700-9800)
  {
    id: 'pg-016',
    name: 'Huisartsenpraktijk Centrum Groningen',
    address: 'Grote Markt 15',
    postalCode: '9711 LT',
    city: 'Groningen',
    lat: 53.2194,
    lng: 6.5669,
  },
  {
    id: 'pg-017',
    name: 'Arts aan het Noorden',
    address: 'Oosterstraat 25',
    postalCode: '9711 NX',
    city: 'Groningen',
    lat: 53.2209,
    lng: 6.5688,
  },
  {
    id: 'pg-018',
    name: 'Gezondheid Noord',
    address: 'Poelestraat 80',
    postalCode: '9712 CP',
    city: 'Groningen',
    lat: 53.2294,
    lng: 6.5721,
  },

  // Breda (4800-4900)
  {
    id: 'pg-019',
    name: 'Huisartsenpraktijk Centrum Breda',
    address: 'Catherinastraat 30',
    postalCode: '4811 DB',
    city: 'Breda',
    lat: 51.5897,
    lng: 4.7789,
  },
  {
    id: 'pg-020',
    name: 'Arts aan de Markt',
    address: 'Grote Markt 15',
    postalCode: '4818 CL',
    city: 'Breda',
    lat: 51.5890,
    lng: 4.7851,
  },

  // Tilburg (5000-5100)
  {
    id: 'pg-021',
    name: 'Huisartsenpraktijk Centrum Tilburg',
    address: 'Heuvelstraat 5',
    postalCode: '5038 AB',
    city: 'Tilburg',
    lat: 51.5603,
    lng: 5.0850,
  },
  {
    id: 'pg-022',
    name: 'Arts aan de Heuvel',
    address: 'Dokter Jansen straat 10',
    postalCode: '5025 EH',
    city: 'Tilburg',
    lat: 51.5553,
    lng: 5.0923,
  },

  // Almere (1300-1300)
  {
    id: 'pg-023',
    name: 'Huisartsenpraktijk Centrum Almere',
    address: 'Stationsplein 100',
    postalCode: '1315 AB',
    city: 'Almere',
    lat: 52.3702,
    lng: 5.2215,
  },
  {
    id: 'pg-024',
    name: 'Arts in Almere',
    address: 'Citadelplein 10',
    postalCode: '1316 AH',
    city: 'Almere',
    lat: 52.3713,
    lng: 5.2245,
  },

  // Additional smaller towns
  {
    id: 'pg-025',
    name: 'Praktijk Arnhem',
    address: 'Rijnstraat 50',
    postalCode: '6811 LR',
    city: 'Arnhem',
    lat: 51.9851,
    lng: 5.8987,
  },
  {
    id: 'pg-026',
    name: 'Arts aan de Maas Nimegen',
    address: 'Waalkade 5',
    postalCode: '6511 VL',
    city: 'Nijmegen',
    lat: 51.8442,
    lng: 5.8519,
  },
]

/**
 * Get nearby PGs based on postal code
 * For now, returns all PGs sorted by distance (mocked distance)
 */
export async function getNearbyPGs(postalCode: string): Promise<PG[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Find PG with matching postal code to get coordinates
  const referencePG = mockPGs.find(
    pg => pg.postalCode.replace(/\s/g, '') === postalCode.replace(/\s/g, ''),
  )

  if (!referencePG) {
    // If exact match not found, return all PGs (in real scenario would calculate actual distance)
    return mockPGs.slice()
  }

  // Sort by distance (would use calculateDistance in real scenario)
  // For mock, just shuffle slightly to make it realistic
  return mockPGs
    .map(pg => ({
      ...pg,
      distance: Math.abs(pg.lat - referencePG.lat) + Math.abs(pg.lng - referencePG.lng),
    }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
}

/**
 * Search PGs with filters
 */
export function searchPGs(
  query: string = '',
  filters?: {
    city?: string
    postalCode?: string
  },
): PG[] {
  let results = [...mockPGs]

  // Filter by name/address
  if (query.trim()) {
    const q = query.toLowerCase()
    results = results.filter(
      pg =>
        pg.name.toLowerCase().includes(q) ||
        pg.address.toLowerCase().includes(q) ||
        pg.city.toLowerCase().includes(q),
    )
  }

  // Filter by city
  if (filters?.city) {
    const city = filters.city.toLowerCase()
    results = results.filter(pg => pg.city.toLowerCase().includes(city))
  }

  // Filter by postal code
  if (filters?.postalCode) {
    const pc = filters.postalCode.replace(/\s/g, '').toUpperCase()
    results = results.filter(pg =>
      pg.postalCode.replace(/\s/g, '').toUpperCase().startsWith(pc),
    )
  }

  return results
}

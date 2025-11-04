interface LocationResponse {
    longitude: string
    latitude: string
}

const BASE_URL = 'http://localhost:4000'

export const getGeolocation = async (postalCode: string) => {
    const response = await fetch(`${BASE_URL}/location?postcode=${postalCode}`)

    const data = (await response.json()) as LocationResponse

    return data
}
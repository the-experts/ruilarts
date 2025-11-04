export interface Huisarts {
  id: number;
  naam: string;
  adres: string;
  postalcode: string;
  street: string;
  city: string;
  latitude: number;
  longitude: number;
  link: string;
}

export interface ClosestHuisarts extends Huisarts {
  distance_m: number;
}

const BASE_URL = "http://localhost:5001";

export const getClosestHuisarts = async (
  latitude: string,
  longitude: string
) => {
  const response = await fetch(
    `${BASE_URL}/huisartsen/closest?lat=${latitude}&lon=${longitude}`
  );

  const data = (await response.json()) as ClosestHuisarts[];

  return data;
};

export const getHuisartsen = async (
  filters?: { naam?: string; postcode?: string; plaats?: string }
) => {
  const queryParams = new URLSearchParams();

  if (filters?.naam) queryParams.append('naam', filters.naam);
  if (filters?.postcode) queryParams.append('postcode', filters.postcode);
  if (filters?.plaats) queryParams.append('plaats', filters.plaats);

  const response = await fetch(
    `${BASE_URL}/huisartsen?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch huisartsen');
  }

  const data = (await response.json()) as ClosestHuisarts[];

  return data;
}

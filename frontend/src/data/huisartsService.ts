export interface ClosestHuisarts {
  id: string;
  naam: string;
  adres: string;
  latitude: number;
  longitude: number;
  link: string;
  distance_m: number;
}

const BASE_URL = "http://localhost:5001";

export const getClosestHuisarts = async (
  latitude: string,
  longitude: string
) => {

console.log({latitude, longitude})

  const response = await fetch(
    `${BASE_URL}/huisartsen/closest?lat=${latitude}&lon=${longitude}`
  );

  const data = (await response.json()) as ClosestHuisarts[];

  return data;
};

import { createServerFn } from "@tanstack/react-start";
import { getGeolocation } from "./geoService";
import { getClosestHuisarts, getHuisartsen } from "./huisartsService";

/**
 * Get nearby PGs based on postal code
 * For now, returns all PGs sorted by distance (mocked distance)
 */
export const getNearbyPGs = createServerFn()
  .inputValidator((data: { postalCode: string, houseNumber: string }) => data)
  .handler(async ({ data }) => {
    try {
      const geolocation = await getGeolocation(data.postalCode, data.houseNumber);

      const closestHuisartsen = await getClosestHuisarts(
        geolocation.latitude,
        geolocation.longitude,
      );

      return closestHuisartsen;
    } catch (e) {
      console.log(e);
      throw e;
    }
  });

/**
 * Search Huisartsen with filters
 */
export const searchPGs = createServerFn()
  .inputValidator(
    (data: { name: string; postalCode: string; city: string }) => data,
  )
  .handler(async ({ data }) => {
    return getHuisartsen({
      naam: data.name,
      postcode: data.postalCode,
      plaats: data.city,
    });
  });

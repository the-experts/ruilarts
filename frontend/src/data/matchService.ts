import {GetMatchesResponse} from "@/interfaces/Matches";
import {createServerFn} from "@tanstack/react-start";
import {getHuisarts, Huisarts} from "@/data/huisartsService.ts";

interface CreateMatchRequest {
  name: string;
  currentPracticeId: number;
  choices: number[];
}

const BASE_URL = "http://localhost:8000";

export const createMatch = createServerFn()
  .inputValidator((data: CreateMatchRequest) => data)
  .handler(async ({ data }) => {
    const response = await fetch(`${BASE_URL}/api/people`, {
      method: "post",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create match");
    }
  });

  export const getMatches = createServerFn()
  .handler(async () => {
    const response = await fetch(`${BASE_URL}/api/matches`);

    const data= (await response.json()) as GetMatchesResponse

    return data
  });

export const getDoctorsForMatch = createServerFn()
    .handler(async () => {
        console.log('getting doctors')
        const response = await fetch(`${BASE_URL}/api/matches`);

        const data = (await response.json()) as GetMatchesResponse
        let huisartsen: Huisarts[] = [];

        if (data.circles) {
            for (const circle of data.circles) {
                if (circle.members) {
                    for (const member of circle.members) {
                        let huisarts = await getHuisarts(member.desired_practice_id.toString());
                        huisartsen.push(huisarts)
                    }
                }
            }
        }
        return huisartsen
    });

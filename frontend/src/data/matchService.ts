import { GetMatchesResponse } from "@/interfaces/Matches";
import { createServerFn } from "@tanstack/react-start";

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

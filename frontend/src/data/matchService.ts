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

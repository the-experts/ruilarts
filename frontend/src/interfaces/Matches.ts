export interface GetMatchesResponse {
  circles: Circle[];
  total: number;
}

export interface Circle {
  id: string;
  size: number;
  max_preference_order: number;
  total_preference_score: number;
  created_at: string; // ISO date string
  status: "active" | "inactive" | string; // extend as needed
  members: Member[];
}

interface Member {
  person_id: string;
  person_name: string;
  current_practice_id: number;
  desired_practice_id: number;
  preference_order: number;
  gets_spot_from: string;
}

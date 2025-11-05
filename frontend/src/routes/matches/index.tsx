import { getMatches } from "@/data/matchService";
import { Await, createFileRoute, Link } from "@tanstack/react-router";
import { GetMatchesResponse } from "@/interfaces/Matches.ts";



import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Circle } from "@/interfaces/Matches";

interface CircleProps {
  circles: Circle[];
}

const CircleList: React.FC<CircleProps> = ({ circles }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Your Match Circles</h2>
        <p className="text-muted-foreground mt-2">
          Explore the circles formed based on preferences and scores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {circles.map((circle, index) => (
          <Card key={circle.id} className="hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: circle.status === "active" ? "#4ade80" : "#f87171",
                  }}
                />
                <h3 className="text-lg font-semibold">Circle {index + 1}</h3>
              </div>
              <Badge variant="outline">{circle.status}</Badge>
            </CardHeader>

            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div><strong>Score:</strong> {circle.score}</div>
              <div><strong>Members:</strong> {circle.size}</div>
              <div><strong>Max Preference Order:</strong> {circle.max_preference_order}</div>
              <div><strong>Total Preference Score:</strong> {circle.total_preference_score}</div>
              <div><strong>Created At:</strong> {format(new Date(circle.created_at), "PPP")}</div>
            </CardContent>

            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/matches/$matchId" params={{ matchId: circle.id }}>
                  View Circle Details
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};


export const Route = createFileRoute("/matches/")({
  component: App,
  loader: () => ({
    deferred: new Promise<GetMatchesResponse>(async (resolve) => {
      resolve(await getMatches());
    }),
  }),
});

function App() {
  const data = Route.useLoaderData();

  return (

      <Await promise={data.deferred} fallback="Loading...">
        {(deferred) => <CircleList circles={deferred.circles} />}
      </Await>
  );
}

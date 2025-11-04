
import { MultiCircleGraph } from "@/components/CircleVisualization";
import { getMatches } from "@/data/matchService";
import { GetMatchesResponse } from "@/interfaces/Matches";
import { Await, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/matches")({
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
    <div>
      <h1 className="relative z-10">Matches</h1>
      <ul>
        <Await promise={data.deferred} fallback="Loading...">
          {(matches) => <MultiCircleGraph circles={matches.circles} />}
        </Await>
      </ul>
    </div>
  );
}

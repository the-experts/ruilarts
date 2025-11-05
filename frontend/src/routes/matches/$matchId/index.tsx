import { getMatch } from "@/data/matchService";
import { Await, createFileRoute } from "@tanstack/react-router";
import { Circle } from "@/interfaces/Matches.ts";
import { MultiCircleGraph } from "@/components/CircleVisualization";

export const Route = createFileRoute("/matches/$matchId/")({
  component: App,
  loader: ({ params: { matchId } }) => ({
    deferred: new Promise<Circle>(async (resolve) => {
      resolve(await getMatch({ data: { id: matchId } }));
    }),
  }),
});

function App() {
  const data = Route.useLoaderData();
  const params = Route.useParams();
  return (
    <div>
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight z-10 relative">
          Match {params.matchId}
        </h2>
      </div>
      <ul>
        <Await promise={data.deferred}>
          {(deferred) => <MultiCircleGraph circles={[deferred]} />}
        </Await>
      </ul>
    </div>
  );
}

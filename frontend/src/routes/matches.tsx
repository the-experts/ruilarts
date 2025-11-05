import {getDoctorsForMatches, getMatches} from "@/data/matchService";
import {Await, createFileRoute} from "@tanstack/react-router";
import MapView from "@/components/ui/mapview.tsx";
import {Huisarts} from "@/data/huisartsService.ts";
import {GetMatchesResponse} from "@/interfaces/Matches.ts";
import { MultiCircleGraph } from "@/components/CircleVisualization";

export const Route = createFileRoute("/matches")({
    component: App,
    loader: () => ({
        deferred: new Promise<GetMatchesResponse>(async (resolve) => {
            resolve(await getMatches());
        }),
        matches: new Promise<Huisarts[]>(async (resolve) => {
            resolve(await getDoctorsForMatches());
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
                    {(deferred) => <MultiCircleGraph circles={deferred.circles}/>}
                </Await>
                <Await promise={data.matches} fallback="Loading...">
                    {(matches) =><MapView matches={matches} />}
                </Await>
            </ul>
        </div>
    );
}

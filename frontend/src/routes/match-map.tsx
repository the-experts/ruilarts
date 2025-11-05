import {getDoctorsForMatch} from "@/data/matchService";
import {Await, createFileRoute} from "@tanstack/react-router";
import MapView from "@/components/ui/mapview.tsx";
import {Huisarts} from "@/data/huisartsService.ts";

export const Route = createFileRoute("/match-map")({
    component: App,
    loader: () => ({
        matches: new Promise<Huisarts[]>(async (resolve) => {
            resolve(await getDoctorsForMatch());
        }),
    }),
});

function App() {
    const data = Route.useLoaderData();

    return (
        <div>
            <h1 className="relative z-10">Matches</h1>
            <ul>
                <Await promise={data.matches} fallback="Loading...">
                    {(matches) =><MapView matches={matches} />}
                </Await>
            </ul>
        </div>
    );
}

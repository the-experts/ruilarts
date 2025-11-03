import { Await, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/huisartsen")({
  component: App,
  loader: () => ({
    deferred: new Promise<Huisarts[]>(async (resolve) => {
      const response = await fetch("http://localhost:5001/huisartsen")
        const data = await response.json()
        return resolve(data)
    }),
  }),
});

interface Huisarts {
  adres: string;
  latitude: number;
  link: string;
  longitude: number;
  naam: string;
}

function App() {
  const data = Route.useLoaderData();

  return (
    <div>
      <h1>Huisartsen</h1>
      <ul>
        <Await promise={data.deferred} fallback="Loading...">
          {(huisartsen) =>
            huisartsen.slice(0, 50).map((huisarts, index) => (
              <li key={index}>
                <h2>{huisarts.naam}</h2>
                <p>Adres: {huisarts.adres}</p>
                <p>
                  Locatie: ({huisarts.latitude}, {huisarts.longitude})
                </p>
                <a
                  href={huisarts.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Website
                </a>
              </li>
            ))
          }
        </Await>
      </ul>
    </div>
  );
}

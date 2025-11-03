import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/huisartsen")({
  component: App,
  loader: async () => {
    const response = await fetch("http://localhost:5001/huisartsen?naam=Kraag");
    const data = (await response.json()) as Huisarts[];

    return data;
  },
});

interface Huisarts {
  adres: string;
  latitude: number;
  link: string;
  longitude: number;
  naam: string;
}

function App() {
  const huisartsen = Route.useLoaderData();

  return (
    <div>
      <h1>Huisartsen</h1>
      <ul>
        {huisartsen.map((huisarts, index) => (
          <li key={index}>
            <h2>{huisarts.naam}</h2>
            <p>Adres: {huisarts.adres}</p>
            <p>
              Locatie: ({huisarts.latitude}, {huisarts.longitude})
            </p>
            <a href={huisarts.link} target="_blank" rel="noopener noreferrer">
              Website
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

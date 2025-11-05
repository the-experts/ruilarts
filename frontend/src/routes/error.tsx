import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/error")({
  component: RouteComponent,
});

function RouteComponent() {
  throw new Error(
    "Task failed successfully. No, I don't know how. Ask management.",
  );
  return <div>Hello "/error"!</div>;
}

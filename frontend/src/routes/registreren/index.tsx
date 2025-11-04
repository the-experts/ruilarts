import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/registreren/")({
  beforeLoad: () => {
    throw redirect({
      to: "/registreren/stap-1",
    });
  },
});

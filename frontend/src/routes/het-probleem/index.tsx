import EducationalSwapDemo from "@/components/EducationalSwapDemo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/het-probleem/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <EducationalSwapDemo />;
}

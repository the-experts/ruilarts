import { Button } from "@/components/ui/button";
import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/registreren/$postcode")({
  component: PostcodeLayout,
});

const STEPS = [
  { id: "stap-1", label: "Postcode", stepNum: 1 },
  { id: "stap-2", label: "Selecteer huisartsen", stepNum: 2 },
  { id: "stap-3", label: "Huidige huisarts", stepNum: 3 },
  { id: "stap-4", label: "Contactgegevens", stepNum: 4 },
  { id: "voltooid", label: "Bevestiging", stepNum: 5 },
];

function PostcodeLayout() {
  const navigate = useNavigate();
  const { postcode } = useParams({ from: "/registreren/$postcode" });

  // Determine current step from pathname
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const currentStepIndex = STEPS.findIndex((step) =>
    pathname.includes(step.id)
  );
  const currentStep = STEPS[currentStepIndex] || STEPS[1];
  const progressPercent = ((currentStepIndex + 1) / STEPS.length) * 100;

  const canGoBack = currentStepIndex > 0;

  const handleBack = () => {
    if (canGoBack) {
      const prevStep = STEPS[currentStepIndex - 1];
      if (currentStepIndex === 1) {
        // From stap-2, go back to stap-1 (no postcode in URL)
        navigate({ to: "/registreren/stap-1" });
      } else {
        // From stap-3 or stap-4, go back within the postcode routes
        navigate({ to: `/registreren/${postcode}/${prevStep.id}` });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {canGoBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                aria-label="Terug"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentStep.label}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Stap {currentStepIndex + 1} van {STEPS.length}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </div>

      {/* Footer with step indicators */}
      <div className="border-t bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex justify-between">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-2 ${
                  index <= currentStepIndex ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    index <= currentStepIndex
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

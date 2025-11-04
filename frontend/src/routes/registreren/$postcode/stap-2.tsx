import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegistrationForm } from "@/context/registration-form";
import { getNearbyPGs } from "@/data/mocks/huisartsen";
import { formatDistance } from "@/lib/form-utils";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/registreren/$postcode/stap-2")({
  loader: async ({ params }) => {
    return getNearbyPGs(params.postcode);
  },
  component: Stap2,
});

function Stap2() {
  const navigate = useNavigate();
  const { postcode } = useParams({ from: "/registreren/$postcode/stap-2" });
  const { formData, updateTargetPGs, updatePostalCode } = useRegistrationForm();
  const nearbyPGs = Route.useLoaderData();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(formData.targetPGs.map((pg) => pg.id)),
  );
  const [error, setError] = useState("");

  // Update form context with postcode if not already set
  if (!formData.postalCode && postcode) {
    updatePostalCode(postcode);
  }

  const handleTogglePG = (pgId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(pgId)) {
      newSelected.delete(pgId);
    } else if (newSelected.size < 3) {
      newSelected.add(pgId);
    }
    setSelectedIds(newSelected);
  };

  const handleNext = () => {
    if (selectedIds.size === 0) {
      setError("Selecteer alstublieft minstens 1 huisartsenpraktijk");
      return;
    }

    const selected = nearbyPGs.filter((pg) => selectedIds.has(pg.id));
    updateTargetPGs(selected);
    navigate({ to: `/registreren/${postcode}/stap-3` });
  };

  return (
    <div className="space-y-6">
      {/* Help text */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-gray-700">
          Selecteer tot 3 huisartsenpraktijken waar u naar toe wilt verhuizen.
          We tonen de praktijken in uw buurt, gesorteerd op afstand.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* PG List */}
      <div className="space-y-3">
        {nearbyPGs.map((pg) => (
          <div
            key={pg.id}
            className={`rounded-lg border-2 p-4 transition-all cursor-pointer ${
              selectedIds.has(pg.id)
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
            onClick={() => handleTogglePG(pg.id)}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedIds.has(pg.id)}
                onCheckedChange={() => handleTogglePG(pg.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{pg.name}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {pg.address}, {pg.postalCode} {pg.city}
                </p>
                {pg.distance && (
                  <p className="mt-2 text-xs text-blue-600 font-medium">
                    {formatDistance((pg.distance || 0) * 1000)}
                  </p>
                )}
              </div>
              {selectedIds.has(pg.id) && (
                <div className="text-blue-600 font-semibold">
                  #{Array.from(selectedIds).indexOf(pg.id) + 1}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selection counter */}
      <div className="text-sm text-gray-600">
        {selectedIds.size} van 3 geselecteerd
      </div>

      {/* Next button */}
      <div className="pt-4">
        <Button
          onClick={handleNext}
          disabled={selectedIds.size === 0}
          className="w-full"
          size="lg"
        >
          Volgende
        </Button>
      </div>
    </div>
  );
}

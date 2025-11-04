import { Button } from "@/components/ui/button";
import { useRegistrationForm } from "@/context/registration-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";

export const Route = createFileRoute("/registreren/voltooid")({
  component: Voltooid,
});

function Voltooid() {
  const navigate = useNavigate();
  const { formData, reset } = useRegistrationForm();

  const handleGoHome = () => {
    reset();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Bevestiging</h1>
            <p className="mt-1 text-sm text-gray-500">Stap 5 van 5</p>
          </div>

          {/* Progress bar */}
          <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Success message */}
          <div className="rounded-lg bg-green-50 p-6 text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Registratie voltooid!
            </h2>
            <p className="text-gray-700">
              Dank u wel voor uw inschrijving. We zullen uw gegevens verwerken
              en u binnenkort contacteren.
            </p>
          </div>

          {/* What's next */}
          <div className="space-y-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-gray-900">Wat gebeurt er nu?</h3>

            <ol className="space-y-2 list-inside list-decimal text-sm text-gray-700">
              <li>
                We analyseren uw gegevens en zoeken naar mogelijke
                uitwisselingen
              </li>
              <li>
                Wanneer we een geschikte match hebben gevonden, sturen we u een
                e-mail op <strong>{formData.contactDetails.email}</strong>
              </li>
              <li>
                U kunt dan contact opnemen met de betrokken huisartsenpraktijken
                om de uitwisseling te finaliseren
              </li>
            </ol>
          </div>

          {/* Summary */}
          <div className="space-y-4 rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900">
              Samenvatting van uw registratie
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Uw huidige huisarts:</p>
                <p className="font-semibold text-gray-900">
                  {formData.currentPG?.naam || "Niet ingesteld"}
                </p>
                <p className="text-sm font-normal text-gray-600">
                  {formData.currentPG?.adres}
                </p>
              </div>

              <div>
                <p className="text-gray-600">Gewenste huisartsenpraktijken:</p>
                {formData.targetPGs.length > 0 ? (
                  <ul className="mt-1 space-y-1">
                    {formData.targetPGs.map((pg, index) => (
                      <li key={pg.id} className="font-semibold text-gray-900">
                        {index + 1}. {pg.naam}
                        <p className="text-sm font-normal text-gray-600">
                          {pg.adres}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">Geen geselecteerd</p>
                )}
              </div>

              <div className="border-t border-gray-300 pt-3">
                <p className="text-gray-600">Contactpersoon:</p>
                <p className="font-semibold text-gray-900">
                  {formData.contactDetails.name}
                </p>
                <p className="text-gray-600">
                  {formData.contactDetails.postalCode}{" "}
                  {formData.contactDetails.houseNumber}
                </p>
                {formData.contactDetails.street && (
                  <p className="text-gray-600">
                    {formData.contactDetails.street}
                  </p>
                )}
                {formData.contactDetails.city && (
                  <p className="text-gray-600">
                    {formData.contactDetails.city}
                  </p>
                )}
                <p className="text-gray-600">{formData.contactDetails.email}</p>
              </div>
            </div>
          </div>

          {/* Info about privacy */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs text-gray-600">
              ℹ️ Uw gegevens worden vertrouwelijk behandeld en alleen gebruikt
              voor het vinden van geschikte huisartsuitwisselingen. We geven uw
              gegevens niet door aan derden.
            </p>
          </div>

          {/* Home button */}
          <div className="pt-4">
            <Button onClick={handleGoHome} className="w-full" size="lg">
              Terug naar startpagina
            </Button>
          </div>
        </div>
      </div>

      {/* Footer with step indicators */}
      <div className="border-t bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex flex-col items-center gap-2 ${
                  step <= 5 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    step <= 5
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

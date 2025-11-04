import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Heart, MapPin, Users } from "lucide-react";
import { useState } from "react";
import Logo from "../logo.svg";

import { normalizePostalCode, isValidPostalCode } from "@/lib/form-utils";
import { getNearbyPGs } from "@/data/huisartsen";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [postalCodeInput, setPostalCodeInput] = useState("");

  const handleStartClick = async () => {
    const normalized = normalizePostalCode(postalCodeInput);

    // Validate
    if (!normalized) {
      setError("Voer alstublieft uw postcode in");
      return;
    }

    if (!isValidPostalCode(normalized)) {
      setError(
        "Voer alstublieft een geldige Nederlandse postcode in (bijv. 1012 AB)"
      );
      return;
    }

    try {
      await getNearbyPGs({ data: { postalCode: normalized } });

      navigate({
        to: "/registreren/$postcode/stap-2",
        params: { postcode: postalCodeInput },
      });
    } catch {
      setError("Er is een fout opgetreden. Probeer het opnieuw.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>
        <div className="relative max-w-4xl mx-auto z-10">
          <div className="mb-6 flex justify-center">
            <img src={Logo} width={400} alt="Ruil Arts" />
          </div>
          <div className="mb-6 flex justify-center">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              🏥 Je Huisarts Dichter Bij Huis
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-[-0.02em]">
            Vind een huisarts{" "}
            <span className="bg-linear-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              door ruilen
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Na een verhuizing is een huisarts dicht bij huis belangrijk.
            Ruilarts helpt je een huisarts te vinden door mensen die verhuizen
            slim met elkaar te verbinden.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
          <div className="flex-1">
            <Input
              type="text"
              name="postcode"
              placeholder="1234AB"
              className="w-full h-12 text-base pl-4"
              maxLength={7}
              value={postalCodeInput}
              onChange={(e) => setPostalCodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleStartClick();
                }
              }}
            />
            {error && <p className="text-sm text-red-600 text-left">{error}</p>}
          </div>
          <Button
            onClick={handleStartClick}
            className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold whitespace-nowrap"
          >
            Starten <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-slate-900 text-center mb-16">
            Het Probleem
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Dicht Bij Huis
              </h3>
              <p className="text-slate-600">
                Je hebt recht op een huisarts op 15 minuten afstand. Dat is niet
                altijd makkelijk te vinden.
              </p>
            </Card>

            {/* Benefit 2 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Volle Wachtlijsten
              </h3>
              <p className="text-slate-600">
                Veel praktijken nemen geen nieuwe patiënten aan. Je huisarts
                wordt vrij als je verhuist.
              </p>
            </Card>

            {/* Benefit 3 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                De Oplossing
              </h3>
              <p className="text-slate-600">
                Ruilarts verbindt je met anderen die verhuizen. Zo krijgt
                iedereen een dichterbij huisarts.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-16">
            Een Voorbeeld
          </h2>

          {/* Circular Swap Diagram */}
          <div className="mb-16 bg-slate-800 rounded-xl p-8 border border-slate-700">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-center text-sm">
                    Henk
                    <br />
                    Groningen
                  </span>
                </div>
                <p className="text-slate-300 text-sm">naar Zwolle</p>
              </div>

              <div className="hidden md:flex text-2xl text-indigo-400">→</div>
              <div className="md:hidden text-2xl text-indigo-400">↓</div>

              <div className="text-center">
                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-center text-sm">
                    Maria
                    <br />
                    Zwolle
                  </span>
                </div>
                <p className="text-slate-300 text-sm">naar Den Haag</p>
              </div>

              <div className="hidden md:flex text-2xl text-indigo-400">→</div>
              <div className="md:hidden text-2xl text-indigo-400">↓</div>

              <div className="text-center">
                <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-center text-sm">
                    Frank
                    <br />
                    Den Haag
                  </span>
                </div>
                <p className="text-slate-300 text-sm">naar Leeuwarden</p>
              </div>

              <div className="hidden md:flex text-2xl text-indigo-400">→</div>
              <div className="md:hidden text-2xl text-indigo-400">↓</div>

              <div className="text-center">
                <div className="w-24 h-24 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-center text-sm">
                    Anne
                    <br />
                    Leeuwarden
                  </span>
                </div>
                <p className="text-slate-300 text-sm">naar Groningen</p>
              </div>
            </div>
            <p className="text-center text-slate-300 mt-8">
              Iedereen kan naar een huisarts in hun buurt door slim te ruilen.
            </p>
          </div>

          {/* How it works steps */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Voer je Postcode In</h3>
              <p className="text-slate-300">
                Je zegt waar je nu bent en waar je naar toe gaat.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">Wij Zoeken Matches</h3>
              <p className="text-slate-300">
                Ons systeem zoekt andere mensen die passen in een ruilcircle.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Je Krijgt Bericht</h3>
              <p className="text-slate-300">
                Wanneer we een match vinden, stellen we je op de hoogte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-linear-to-b from-white to-blue-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-6">
            Klaar om te starten?
          </h2>
          <p className="text-xl text-slate-600 mb-12">
            Voer je postcode in. Wij zoeken naar matches voor je.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
            <div className="flex-1">
              <Input
                type="text"
                name="postcode"
                placeholder="1234AB"
                className="w-full h-12 text-base pl-4"
                maxLength={7}
                value={postalCodeInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleStartClick();
                  }
                }}
                onChange={(e) => setPostalCodeInput(e.target.value)}
              />
              {error && (
                <p className="text-sm text-red-600 text-left">{error}</p>
              )}
            </div>
            <Button
              onClick={handleStartClick}
              className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold whitespace-nowrap"
            >
              Starten <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <p className="text-sm text-slate-500">
            Geen wachtwoord nodig. Alleen je postcode.
          </p>
        </div>
      </section>

      {/* Footer */}
      <section className="border-t border-slate-200 py-12 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left">
            <h3 className="font-black text-lg text-slate-900">Ruilarts</h3>
            <p className="text-sm text-slate-600">
              Een huisarts dicht bij je thuis
            </p>
          </div>
          <div className="flex gap-8 text-sm text-slate-600">
            <a href="#" className="hover:text-slate-900 transition">
              Over ons
            </a>
            <a href="#" className="hover:text-slate-900 transition">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-900 transition">
              Contact
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

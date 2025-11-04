import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { Heart, Users, MapPin, Zap, Shield, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="mb-6 flex justify-center">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              🏥 Vind je Perfecte Huisarts
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 [letter-spacing:-0.02em]">
            Stop met zoeken naar een{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              huisarts in je buurt
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Wanneer je verhuist, hoort het zoeken naar een huisarts geen gedoe te zijn. Ruilarts
            verbindt mensen die naar een nieuw gebied verhuizen met huisartspraktijken die open
            zijn—door slim circulair matchen.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-slate-900 text-center mb-16">
            Waarom Ruilarts?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Bliksemnel</h3>
              <p className="text-slate-600">
                Vind een nieuwe huisarts in minuten, niet maanden. Ons slimme matchingsalgoritme werkt direct.
              </p>
            </Card>

            {/* Benefit 2 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Winnen voor Iedereen</h3>
              <p className="text-slate-600">
                Wanneer een match wordt gevonden, winnen allen. Huisartspraktijken vullen vacatures in en helpen patiënten.
              </p>
            </Card>

            {/* Benefit 3 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Je Gezondheid is Belangrijk</h3>
              <p className="text-slate-600">
                Continuïteit van zorg blijft behouden. Blijf bij een arts die je medische geschiedenis kent.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-16">Hoe Werkt Het</h2>
          <div className="grid md:grid-cols-4 gap-6 md:gap-4">
            {[
              { step: "1", title: "Vertel Het Ons", desc: "Voer je huidige en nieuwe postcode in" },
              { step: "2", title: "Wij Matchen", desc: "Ons algoritme vindt ronde ruilingen" },
              { step: "3", title: "Ontvang Bericht", desc: "Wanneer een match wordt gevonden" },
              { step: "4", title: "Allemaal Gereed", desc: "Verbonden met je nieuwe huisarts" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="mb-4 w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-300 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-6">Klaar om je huisarts te vinden?</h2>
          <p className="text-xl text-slate-600 mb-12">
            Voer je postcode in om te beginnen. Het duurt minder dan een minuut.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Voer postcode in (bijv. 1234AB)"
                className="w-full h-12 text-base pl-4"
                maxLength="7"
              />
            </div>
            <Button className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              Aan de slag <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <p className="text-sm text-slate-500 mt-4">
            Geen e-mail nodig. We stellen je op de hoogte wanneer een match wordt gevonden.
          </p>
        </div>
      </section>

      {/* Footer */}
      <section className="border-t border-slate-200 py-12 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left">
            <h3 className="font-black text-lg text-slate-900">Ruilarts</h3>
            <p className="text-sm text-slate-600">Zorgtransities moeiteloos maken</p>
          </div>
          <div className="flex gap-8 text-sm text-slate-600">
            <a href="#" className="hover:text-slate-900 transition">Over</a>
            <a href="#" className="hover:text-slate-900 transition">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition">Contact</a>
          </div>
        </div>
      </section>
    </div>
  );
}

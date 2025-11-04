import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SparklesIcon } from "lucide-react";

export const Route = createFileRoute("/privacy-statement")({
  component: PrivacyStatement,
});

function PrivacyStatement() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold">Privacyverklaring Ruil arts</h1>
          <p className="text-sm text-muted-foreground">
            Laatst bijgewerkt: 4 november 2025
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Bij <strong>Ruil arts</strong> hechten wij veel waarde aan de
            bescherming van jouw persoonsgegevens. In deze privacyverklaring
            leggen wij uit welke gegevens wij verzamelen, waarom wij dat doen,
            en hoe wij jouw privacy waarborgen.
          </p>

          <Separator />

          <h2 className="text-xl font-semibold">1. Wie zijn wij?</h2>
          <p>
            Ruil arts is een dienst die mensen helpt bij het vinden van een
            nieuwe huisarts na verhuizing, door een keten te vormen van mensen
            die recent zijn verhuisd en hun huisarts hebben gewisseld.
          </p>

          <h2 className="text-xl font-semibold">
            2. Welke gegevens verzamelen wij?
          </h2>
          <ul className="list-disc list-inside">
            <li>Naam</li>
            <li>E-mailadres</li>
            <li>Oude en nieuwe postcode</li>
            <li>Naam van oude en nieuwe huisarts</li>
            <li>Informatie over toestemming om contact op te nemen</li>
          </ul>

          <h2 className="text-xl font-semibold">
            3. Doel van de gegevensverwerking
          </h2>
          <p>
            Wij gebruiken jouw gegevens uitsluitend voor de volgende doeleinden:
          </p>
          <ul className="list-disc list-inside">
            <li>
              Het koppelen van verhuisde personen om huisartswissels mogelijk te
              maken
            </li>
            <li>
              Het faciliteren van contact tussen gebruikers die elkaar kunnen
              helpen
            </li>
            <li>Het verbeteren van onze dienstverlening</li>
            <li>
              Het versturen van relevante informatie over jouw aanvraag of
              deelname
            </li>
          </ul>

          <h2 className="text-xl font-semibold">
            4. Rechtsgrond voor verwerking
          </h2>
          <p>
            Wij verwerken jouw gegevens op basis van jouw uitdrukkelijke
            toestemming. Je kunt deze toestemming op elk moment intrekken.
          </p>

          <h2 className="text-xl font-semibold">5. Delen van gegevens</h2>
          <p>
            Wij delen jouw gegevens <strong>niet</strong> met derden, tenzij jij
            daar expliciet toestemming voor hebt gegeven of wij daartoe
            wettelijk verplicht zijn.
          </p>

          <h2 className="text-xl font-semibold">6. Bewaartermijn</h2>
          <p>
            Wij bewaren jouw gegevens niet langer dan noodzakelijk is. Indien je
            je uitschrijft of je toestemming intrekt, worden je gegevens binnen
            30 dagen verwijderd.
          </p>

          <h2 className="text-xl font-semibold">7. Jouw rechten</h2>
          <ul className="list-disc list-inside">
            <li>Inzage in jouw gegevens</li>
            <li>Gegevens laten corrigeren of verwijderen</li>
            <li>Bezwaar maken tegen verwerking</li>
            <li>Toestemming intrekken</li>
          </ul>

          <h2 className="text-xl font-semibold">8. Beveiliging</h2>
          <p>
            Wij nemen passende technische en organisatorische maatregelen om
            jouw gegevens te beschermen tegen verlies, misbruik en
            ongeautoriseerde toegang.
          </p>

          <h2 className="text-xl font-semibold">9. Contact</h2>
          <p>
            Voor vragen over deze privacyverklaring of jouw gegevens kun je
            contact opnemen via:
          </p>
          <ul className="list-disc list-inside">
            <li>
              <strong>E-mail:</strong> info@the-experts.nl
            </li>
            <li>
              <strong>Postadres:</strong> Loevesteinstraat 20c 4834 ED Breda
            </li>
            <li>
              <strong>Telefoon:</strong> 085-40000 11
            </li>
          </ul>

          <Separator />

          <Alert>
            <SparklesIcon className="h-4 w-4" />
            <AlertTitle>Wist je dat?</AlertTitle>
            <AlertDescription>
              Als je drie keer verhuist binnen één jaar, krijg je van ons een
              digitale verhuisplant cadeau. 🌱
            </AlertDescription>
          </Alert>

          <Alert>
            <SparklesIcon className="h-4 w-4" />
            <AlertTitle>Geheime ketenbonus</AlertTitle>
            <AlertDescription>
              Als jouw huisartswisseling drie andere mensen helpt, krijg je een
              Ruil arts-mok met een QR-code naar je ketenprofiel. ☕
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

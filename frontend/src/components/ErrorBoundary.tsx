import { RootRouteError, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import LetterGlitch from "./bg/LetterGlitch";

export function ErrorBoundary({ error }: { error: RootRouteError }) {
  const router = useRouter();
  const isDevMode = process.env.NODE_ENV === "development";

  const errorMessages = [
    "Het spijt ons. Onze AI-bots werken eraan om dit op te lossen. \n\nTobias geeft Codex de schuld. Maar... Dat is ook alleen maar zo omdat hij uit de tokens is voor Claude. Probeer het over een paar seconden opnieuw.",
    "De ruil-robot heeft per ongeluk de adressen door elkaar gegooid. \n\nNu denkt hij dat Amsterdam in Groningen ligt en Maastricht op de maan. We geven hem even een Nederlandse geografieles. Probeer het straks nog eens!",
    "Gefeliciteerd, je hebt het systeem zo hard gesloopt dat je in de 'Oeps… alles kapot'-zone bent beland. \n\nHelaas… dat betekent: je bent af. \n\nAdem diep in, herpak jezelf en probeer het nog eens — maar deze keer… met beleid.",
    "JP was te druk met het maken van fancy animaties. \n\nDe backend voelt zich een beetje verwaarloosd. Probeer het nog een keer terwijl wij JP eraan herinneren dat functionaliteit ook belangrijk is.",
    "Lennard vergeleek per ongeluk appels met peren in de code. \n\nDe computer snapte er niks van en crashte. Even geduld, we leggen Lennard uit dat if (appel === peer) altijd false is.",
    "JM is nog steeds bezig met het implementeren van een kaart. \n\nProbleem is... hij is zelf een beetje van de kaart. We sturen hem een GPS en een kompas. Tot die tijd: probeer het gewoon nog een keer."
  ];

  const [randomMessage] = useState(() =>
    errorMessages[Math.floor(Math.random() * errorMessages.length)]
  );

  const handleReset = () => {
    window.location.href = "/";
  };

  const handleRetry = () => {
    router.invalidate();
  };

  return (
    <html lang="nl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Fout - Ruil Arts</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            padding: 40px;
            max-width: 600px;
            width: 100%;
          }
          .icon {
            font-size: 64px;
            margin-bottom: 20px;
            text-align: center;
          }
          h1 {
            color: #2d3748;
            font-size: 28px;
            margin-bottom: 12px;
            text-align: center;
          }
          .subtitle {
            color: #718096;
            font-size: 16px;
            margin-bottom: 24px;
            text-align: center;
            line-height: 1.5;
          }
          .message {
            background: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 16px;
            margin-bottom: 24px;
            border-radius: 4px;
            color: #2d3748;
            font-size: 14px;
            line-height: 1.6;
          }
          .error-details {
            background: #edf2f7;
            padding: 16px;
            border-radius: 4px;
            margin-bottom: 24px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
            font-size: 12px;
            color: #2d3748;
            overflow-x: auto;
            max-height: 200px;
            overflow-y: auto;
            white-space: pre-wrap;
            word-break: break-word;
          }
          .actions {
            display: flex;
            gap: 12px;
            justify-content: center;
          }
          button {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .btn-primary {
            background: #667eea;
            color: white;
          }
          .btn-primary:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          .btn-secondary {
            background: #e2e8f0;
            color: #2d3748;
          }
          .btn-secondary:hover {
            background: #cbd5e0;
            transform: translateY(-2px);
          }
        `}</style>
      </head>
      <body>
        <div className="fixed top-0 left-0 right-0 bottom-0 z-0">
          <LetterGlitch
            glitchSpeed={1}
            centerVignette={false}
            outerVignette={true}
            smooth={true}
          />
        </div>
        <div className="container z-10">
          <div className="icon">⚠️</div>
          <h1>Oeps, iets ging fout</h1>
          <p className="subtitle">
            We kwamen nu net even niet door de vibe check. Dit kan voorkomen.
            Probeer het opnieuw of ga terug naar het begin.
          </p>

          <div className="message" style={{ whiteSpace: "pre-wrap" }}>
            {randomMessage}
          </div>

          {isDevMode && error && (
            <details>
              <summary
                style={{
                  cursor: "pointer",
                  color: "#667eea",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                Technische details (alleen Experts)
              </summary>
              <div className="error-details">
                {error.message && `Bericht: ${error.message}\n\n`}
                {error.stack}
              </div>
            </details>
          )}

          <div className="actions">
            <button className="btn-primary" onClick={handleRetry}>
              Opnieuw proberen
            </button>
            <button className="btn-secondary" onClick={handleReset}>
              Naar start
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

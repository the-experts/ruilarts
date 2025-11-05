import LetterGlitch from "./bg/LetterGlitch";
import FuzzyText from "./effects/FuzzyText";

export function NotFound() {
  const handleReset = () => {
    console.log("test");
    window.location.href = "/";
  };

  return (
    <>
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
      <div className="fixed top-0 left-0 right-0 bottom-0 z-0">
        <LetterGlitch
          glitchSpeed={1}
          centerVignette={false}
          outerVignette={true}
          smooth={true}
        />
      </div>
      <div className="container z-10 relative">
        <h1 className="flex justify-center">
          <FuzzyText
            baseIntensity={0.2}
            hoverIntensity={0.4}
            enableHover={true}
            fontSize="clamp(2rem, 8vw, 8rem)"
            color="black"
          >
            404
          </FuzzyText>
        </h1>
        <p className="subtitle">gij zoekt, gij zoekt nog steeds...</p>

        <div className="message">
          <p>
            Deze pagina is… tja… kwijt. Verdwaald. Waarschijnlijk ergens
            afgeslagen bij “klik hier” en nu in een digitale sloot beland.
          </p>
          <p>
            Geen paniek. Dit gebeurt zelfs bij mensen met Google Maps én
            richtingsgevoel.
          </p>
          <p>
            Probeer terug te gaan, adem rustig in (zoals je huisarts zou
            adviseren) en vind je weg opnieuw. En mocht je deze pagina ooit
            terugzien: vraag haar hoe ze zo ver van huis is gekomen.
          </p>
        </div>

        <div className="actions">
          <button className="btn-secondary" onClick={handleReset}>
            Naar start
          </button>
        </div>
      </div>
    </>
  );
}

interface HuisartsDetails {
  id: number;
  naam: string;
  adres: string;
  street: string;
  postalcode: string;
  city: string;
  latitude: number;
  longitude: number;
  link: string;
}

interface EmailTemplateData {
  personName: string;
  huisarts: HuisartsDetails;
  preferenceNumber: number; // 0 = 1st choice, 1 = 2nd choice, 2 = 3rd choice
  circleSize: number;
}

/**
 * Generate plain text email content in Dutch (B1 level)
 */
export function generatePlainTextEmail(data: EmailTemplateData): string {
  const preferenceText = getPreferenceText(data.preferenceNumber);

  return `
Beste ${data.personName},

Goed nieuws! We hebben een huisarts voor je gevonden.

Je bent gekoppeld aan: ${data.huisarts.naam}
Adres: ${data.huisarts.adres}

Dit was je ${preferenceText}.

Je zit in een ruilgroep met ${data.circleSize} mensen. Iedereen in de groep krijgt een nieuwe huisarts.

Wat kun je nu doen?
- Bekijk de huisarts op Zorgkaart: ${data.huisarts.link}
- Plan een route naar de praktijk
- Neem contact op met je nieuwe huisarts

Veel succes!

Met vriendelijke groet,
Ruilarts
  `.trim();
}

/**
 * Generate HTML email content in Dutch (B1 level) with nice styling
 */
export function generateHtmlEmail(data: EmailTemplateData): string {
  const preferenceText = getPreferenceText(data.preferenceNumber);
  const mapsUrl = generateGoogleMapsUrl(data.huisarts.latitude, data.huisarts.longitude);

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Je nieuwe huisarts</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0; text-align: center; background-color: #f4f4f4;">
        <table role="presentation" style="width: 600px; max-width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 Goed nieuws!</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Beste ${data.personName},
              </p>

              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                We hebben een huisarts voor je gevonden! Je bent gekoppeld aan een nieuwe praktijk.
              </p>

              <!-- Practice Info Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; font-size: 20px; color: #667eea; font-weight: bold;">
                      ${data.huisarts.naam}
                    </h2>
                    <p style="margin: 0 0 8px; font-size: 15px; color: #555555;">
                      📍 ${data.huisarts.adres}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #777777;">
                      ✓ Dit was je <strong>${preferenceText}</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 30px; font-size: 15px; line-height: 1.6; color: #555555; padding: 16px; background-color: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px;">
                <strong>Ruilgroep:</strong> Je zit in een groep met ${data.circleSize} mensen. Iedereen in de groep krijgt een nieuwe huisarts.
              </p>

              <!-- Action Buttons -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px 0;">
                    <a href="${mapsUrl}" style="display: inline-block; padding: 14px 28px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      🗺️ Navigeer naar praktijk
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <a href="${data.huisarts.link}" style="display: inline-block; padding: 14px 28px; background-color: #ffffff; color: #667eea; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; border: 2px solid #667eea;">
                      📋 Bekijk op Zorgkaart
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
                <h3 style="margin: 0 0 16px; font-size: 18px; color: #333333;">Wat nu?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; line-height: 1.8;">
                  <li>Bekijk de praktijk op Zorgkaart</li>
                  <li>Plan een bezoek aan je nieuwe huisarts</li>
                  <li>Neem contact op met de praktijk</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 14px; color: #777777;">
                Veel succes met je nieuwe huisarts!
              </p>
              <p style="margin: 10px 0 0; font-size: 14px; color: #999999;">
                Met vriendelijke groet,<br>
                <strong>Ruilarts</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Get email subject line in Dutch
 */
export function generateSubject(): string {
  return 'Goed nieuws! We hebben een huisarts voor je gevonden';
}

/**
 * Helper: Convert preference index to Dutch text
 */
function getPreferenceText(preferenceNumber: number): string {
  switch (preferenceNumber) {
    case 0:
      return '1e keuze';
    case 1:
      return '2e keuze';
    case 2:
      return '3e keuze';
    default:
      return `${preferenceNumber + 1}e keuze`;
  }
}

/**
 * Helper: Generate Google Maps URL from coordinates
 */
function generateGoogleMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

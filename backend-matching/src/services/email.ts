import { config } from '../config.js';
import { generatePlainTextEmail, generateHtmlEmail, generateSubject } from '../templates/matchEmail.js';

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

interface EmailPayload {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

interface MatchNotificationData {
  personName: string;
  personEmail: string;
  desiredPracticeId: number;
  preferenceOrder: number;
  circleSize: number;
}

class EmailService {
  /**
   * Send a match notification email to a person
   */
  async sendMatchNotification(data: MatchNotificationData): Promise<boolean> {
    if (!config.email.enabled) {
      console.log('[Email] Email notifications disabled, skipping');
      return false;
    }

    try {
      // Fetch huisarts details from API
      const huisarts = await this.fetchHuisartsDetails(data.desiredPracticeId);

      if (!huisarts) {
        console.error(`[Email] Could not fetch huisarts details for ID ${data.desiredPracticeId}`);
        return false;
      }

      // Generate email content
      const subject = generateSubject();
      const text = generatePlainTextEmail({
        personName: data.personName,
        huisarts,
        preferenceNumber: data.preferenceOrder,
        circleSize: data.circleSize,
      });
      const html = generateHtmlEmail({
        personName: data.personName,
        huisarts,
        preferenceNumber: data.preferenceOrder,
        circleSize: data.circleSize,
      });

      // Send email via email-sender service
      await this.sendEmail({
        to: data.personEmail,
        subject,
        text,
        html,
      });

      console.log(`[Email] ✓ Sent match notification to ${data.personEmail} (${data.personName})`);
      return true;
    } catch (error) {
      console.error(`[Email] ✗ Failed to send email to ${data.personEmail}:`, error);
      return false;
    }
  }

  /**
   * Fetch huisarts details from the huisartsen API
   */
  private async fetchHuisartsDetails(practiceId: number): Promise<HuisartsDetails | null> {
    try {
      const url = `${config.huisartsenApi.url}/huisartsen/${practiceId}`;
      console.log(`[Email] Fetching huisarts details from: ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[Email] Huisartsen API responded with status ${response.status}`);
        return null;
      }

      const data = await response.json();
      return data as HuisartsDetails;
    } catch (error) {
      console.error(`[Email] Error fetching huisarts details:`, error);
      return null;
    }
  }

  /**
   * Send email via the email-sender service
   */
  private async sendEmail(payload: EmailPayload): Promise<void> {
    const url = `${config.email.serviceUrl}/send`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Email service responded with ${response.status}: ${errorText}`);
    }

    console.log(`[Email] Email sent successfully via ${url}`);
  }

  /**
   * Send notifications to all members of a matched circle
   */
  async sendCircleNotifications(circleMembers: MatchNotificationData[]): Promise<void> {
    if (!config.email.enabled) {
      console.log('[Email] Email notifications disabled, skipping all notifications');
      return;
    }

    console.log(`\n[Email] Sending notifications to ${circleMembers.length} circle members...`);

    let successCount = 0;
    let failureCount = 0;

    // Send emails in parallel (don't wait for each one)
    const promises = circleMembers.map(async (member) => {
      const success = await this.sendMatchNotification(member);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    });

    // Wait for all emails to complete
    await Promise.allSettled(promises);

    console.log(`[Email] Notification summary: ${successCount} sent, ${failureCount} failed\n`);
  }
}

export const emailService = new EmailService();

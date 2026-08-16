// backend/src/services/mailer.service.ts

/**
 * Email is not wired up yet. All methods here are no-ops that log to
 * the console instead of sending anything. Swap the internals for a
 * real provider (Resend, SendGrid, a dedicated Gmail account, etc.)
 * later — the function signatures below are what the rest of the app
 * calls, so nothing else needs to change when you do.
 */

function logStub(to: string, subject: string) {
  console.log(`[mailer] (disabled) Would send to ${to}: "${subject}"`);
}

export const mailerService = {
  async sendExpertApproved(email: string, fullName: string) {
    logStub(email, "Votre candidature Experte a été acceptée — Ellevadz");
  },

  async sendExpertRejected(email: string, fullName: string, reason?: string) {
    logStub(email, "Votre candidature Experte — Ellevadz");
  },

  async sendInstitutionApproved(email: string, organizationName: string) {
    logStub(email, "Votre candidature Institution a été acceptée — Ellevadz");
  },

  async sendInstitutionRejected(email: string, organizationName: string, reason?: string) {
    logStub(email, "Votre candidature Institution — Ellevadz");
  },
};
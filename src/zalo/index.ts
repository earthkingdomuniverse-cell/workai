// Minimal Zalo integration skeleton (Open Platform).
// This module serves as a placeholder for future production integration with Zalo APIs.
export interface ZaloConfig {
  appId?: string;
  appSecret?: string;
  webhookSecret?: string;
}

export class ZaloClient {
  private cfg: ZaloConfig;
  constructor(cfg: ZaloConfig) {
    this.cfg = cfg;
  }

  async sendMessage(toZaloId: string, message: string): Promise<void> {
    // In production, call Zalo Graph API to send a message.
    // For now, log to console for demonstration in this repository.
    console.log('[Zalo] sendMessage', { toZaloId, message, cfg: this.cfg.appId ?? null });
  }
}

// Simple exported instance using environment-provided credentials if available.
export const zaloClient = new ZaloClient({
  appId: process.env.ZALO_APP_ID,
  appSecret: process.env.ZALO_APP_SECRET,
  webhookSecret: process.env.ZALO_WEBHOOK_SECRET,
});

export default zaloClient;

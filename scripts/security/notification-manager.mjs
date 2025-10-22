#!/usr/bin/env node

/**
 * Security Notification Manager
 * Handles email, browser, and team notifications for security events
 */

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Notification configuration
const NOTIFICATION_CONFIG = {
  email: {
    enabled: process.env.SECURITY_EMAIL_ENABLED !== 'false',
    smtp: {
      host: process.env.SECURITY_EMAIL_SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SECURITY_EMAIL_SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SECURITY_EMAIL_USER,
        pass: process.env.SECURITY_EMAIL_PASS
      }
    },
    from: process.env.SECURITY_EMAIL_FROM || 'security@figmail.app',
    to: {
      admin: process.env.SECURITY_ADMIN_EMAIL || 'admin@figmail.app',
      team: (process.env.SECURITY_TEAM_EMAILS || '').split(',').filter(Boolean)
    }
  },
  browser: {
    enabled: process.env.SECURITY_PUSH_ENABLED === 'true'
  },
  slack: {
    enabled: process.env.SECURITY_SLACK_ENABLED === 'true',
    webhook: process.env.SECURITY_SLACK_WEBHOOK
  }
};

class SecurityNotificationManager {
  constructor() {
    this.emailTransporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  async initializeTransporter() {
    if (!NOTIFICATION_CONFIG.email.enabled) {
      console.log('📧 Email notifications disabled');
      return;
    }

    if (!NOTIFICATION_CONFIG.email.smtp.auth.user || !NOTIFICATION_CONFIG.email.smtp.auth.pass) {
      console.log('⚠️  Email credentials not configured');
      return;
    }

    try {
      this.emailTransporter = nodemailer.createTransporter(NOTIFICATION_CONFIG.email.smtp);
      await this.emailTransporter.verify();
      console.log('✅ Email transporter initialized');
    } catch (error) {
      console.error('❌ Email transporter failed:', error.message);
    }
  }

  /**
   * Send security alert notification
   */
  async sendSecurityAlert(alert) {
    const { severity, title, description, vulnerabilities = [], actions = [] } = alert;

    console.log(`🚨 Sending ${severity} security alert: ${title}`);

    // Send via all configured channels
    await Promise.all([
      this.sendEmailAlert(alert),
      this.sendBrowserNotification(alert),
      this.sendSlackAlert(alert)
    ]);
  }

  /**
   * Send email notification
   */
  async sendEmailAlert(alert) {
    if (!this.emailTransporter) {
      console.log('📧 Email not configured, skipping...');
      return;
    }

    const { severity, title, description, vulnerabilities = [], actions = [] } = alert;
    const recipients = severity === 'critical'
      ? [NOTIFICATION_CONFIG.email.to.admin, ...NOTIFICATION_CONFIG.email.to.team]
      : [NOTIFICATION_CONFIG.email.to.admin];

    const subject = `🚨 [${severity.toUpperCase()}] Security Alert: ${title}`;

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${severity === 'critical' ? '#fee' : '#fef'}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: ${severity === 'critical' ? '#c53030' : '#d69e2e'}; margin: 0;">
              ${severity === 'critical' ? '🚨' : '⚠️'} Security Alert
            </h1>
            <p style="color: #666; margin: 5px 0;"><strong>Severity:</strong> ${severity.toUpperCase()}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Time:</strong> ${new Date().toISOString()}</p>
          </div>

          <h2>${title}</h2>
          <p>${description}</p>

          ${vulnerabilities.length > 0 ? `
            <h3>🔍 Vulnerabilities Found:</h3>
            <ul>
              ${vulnerabilities.map(vuln => `
                <li><strong>${vuln.package}</strong>: ${vuln.severity} - ${vuln.title}</li>
              `).join('')}
            </ul>
          ` : ''}

          ${actions.length > 0 ? `
            <h3>🛠️ Recommended Actions:</h3>
            <ul>
              ${actions.map(action => `<li>${action}</li>`).join('')}
            </ul>
          ` : ''}

          <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h4>🔧 Quick Actions:</h4>
            <p>Run these commands to address the security issues:</p>
            <code style="background: #e2e8f0; padding: 10px; display: block; border-radius: 4px;">
              npm run security:scan<br>
              npm run security:aikido:interactive<br>
              npm run security:auto-update
            </code>
          </div>

          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated security alert from FigmailAPP Security Manager.<br>
            For more information, check the security dashboard or contact the security team.
          </p>
        </body>
      </html>
    `;

    try {
      await this.emailTransporter.sendMail({
        from: NOTIFICATION_CONFIG.email.from,
        to: recipients.join(','),
        subject,
        html
      });
      console.log(`✅ Email sent to ${recipients.length} recipients`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
    }
  }

  /**
   * Send browser push notification
   */
  async sendBrowserNotification(alert) {
    if (!NOTIFICATION_CONFIG.browser.enabled) {
      console.log('🌐 Browser notifications disabled, skipping...');
      return;
    }

    const { severity, title } = alert;

    try {
      // For development, we'll use a simple node-notifier approach
      // In production, this would integrate with FCM or similar service
      const notification = {
        title: `Security Alert: ${title}`,
        message: `${severity.toUpperCase()} security issue detected`,
        icon: severity === 'critical' ? '🚨' : '⚠️',
        sound: severity === 'critical',
        wait: true
      };

      console.log('🌐 Browser notification prepared:', notification.title);

      // Note: Actual browser notification would require FCM setup
      console.log('💡 To enable browser notifications, configure FCM credentials');

    } catch (error) {
      console.error('❌ Browser notification failed:', error.message);
    }
  }

  /**
   * Send Slack notification
   */
  async sendSlackAlert(alert) {
    if (!NOTIFICATION_CONFIG.slack.enabled || !NOTIFICATION_CONFIG.slack.webhook) {
      console.log('💬 Slack notifications not configured, skipping...');
      return;
    }

    const { severity, title, description, vulnerabilities = [] } = alert;

    const color = severity === 'critical' ? 'danger' : 'warning';
    const emoji = severity === 'critical' ? '🚨' : '⚠️';

    const payload = {
      username: 'Security Manager',
      icon_emoji: ':shield:',
      attachments: [{
        color,
        title: `${emoji} Security Alert: ${title}`,
        text: description,
        fields: [
          {
            title: 'Severity',
            value: severity.toUpperCase(),
            short: true
          },
          {
            title: 'Vulnerabilities',
            value: vulnerabilities.length.toString(),
            short: true
          }
        ],
        footer: 'FigmailAPP Security Manager',
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    try {
      const response = await fetch(NOTIFICATION_CONFIG.slack.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('✅ Slack notification sent');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Slack notification failed:', error.message);
    }
  }

  /**
   * Setup notification configuration
   */
  async setupNotifications() {
    console.log('🔧 Setting up security notifications...\n');

    // Check current configuration
    console.log('📊 Current Configuration:');
    console.log(`Email: ${NOTIFICATION_CONFIG.email.enabled ? '✅' : '❌'}`);
    console.log(`Browser: ${NOTIFICATION_CONFIG.browser.enabled ? '✅' : '❌'}`);
    console.log(`Slack: ${NOTIFICATION_CONFIG.slack.enabled ? '✅' : '❌'}\n`);

    // Test email configuration
    if (NOTIFICATION_CONFIG.email.enabled && this.emailTransporter) {
      console.log('📧 Testing email configuration...');
      try {
        await this.sendTestEmail();
        console.log('✅ Email test successful\n');
      } catch (error) {
        console.error('❌ Email test failed:', error.message);
      }
    }

    // Configuration instructions
    this.printConfigurationInstructions();
  }

  /**
   * Send test email
   */
  async sendTestEmail() {
    await this.emailTransporter.sendMail({
      from: NOTIFICATION_CONFIG.email.from,
      to: NOTIFICATION_CONFIG.email.to.admin,
      subject: '✅ Security Notification Test',
      text: 'This is a test email from FigmailAPP Security Manager. Notifications are working correctly!'
    });
  }

  /**
   * Print configuration instructions
   */
  printConfigurationInstructions() {
    console.log('🛠️  Configuration Instructions:\n');

    console.log('📧 Email Notifications:');
    console.log('Set these environment variables:');
    console.log('  SECURITY_EMAIL_SMTP_HOST=smtp.gmail.com');
    console.log('  SECURITY_EMAIL_USER=your-email@gmail.com');
    console.log('  SECURITY_EMAIL_PASS=your-app-password');
    console.log('  SECURITY_ADMIN_EMAIL=admin@figmail.app');
    console.log('  SECURITY_TEAM_EMAILS=dev1@figmail.app,dev2@figmail.app\n');

    console.log('🌐 Browser Notifications:');
    console.log('Set these environment variables:');
    console.log('  SECURITY_PUSH_ENABLED=true');
    console.log('  # FCM setup required for production\n');

    console.log('💬 Slack Notifications:');
    console.log('Set these environment variables:');
    console.log('  SECURITY_SLACK_ENABLED=true');
    console.log('  SECURITY_SLACK_WEBHOOK=https://hooks.slack.com/...\n');

    console.log('💡 Quick Setup:');
    console.log('  npm run security:setup:email');
    console.log('  npm run security:test:notifications');
  }

  /**
   * Create sample security alert for testing
   */
  createTestAlert(severity = 'high') {
    return {
      severity,
      title: 'Test Security Alert',
      description: 'This is a test security alert to verify notification delivery.',
      vulnerabilities: [
        {
          package: 'test-package',
          severity: 'high',
          title: 'Test vulnerability for notification system'
        }
      ],
      actions: [
        'Run security scan to identify issues',
        'Update affected packages',
        'Review security report'
      ]
    };
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new SecurityNotificationManager();
  const command = process.argv[2];

  switch (command) {
    case 'setup':
      await manager.setupNotifications();
      break;

    case 'test':
      const severity = process.argv[3] || 'high';
      const testAlert = manager.createTestAlert(severity);
      await manager.sendSecurityAlert(testAlert);
      break;

    case 'send':
      if (process.argv[3]) {
        try {
          const alert = JSON.parse(process.argv[3]);
          await manager.sendSecurityAlert(alert);
        } catch (error) {
          console.error('❌ Invalid alert JSON:', error.message);
        }
      } else {
        console.error('❌ Alert data required');
      }
      break;

    default:
      console.log('🔔 Security Notification Manager');
      console.log('');
      console.log('Usage:');
      console.log('  setup     - Configure notification settings');
      console.log('  test      - Send test notification');
      console.log('  send      - Send custom alert (JSON)');
  }
}

export default SecurityNotificationManager;
export function passwordChangedMailHtml(name: string) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f6f6f6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #172a3a;
          color: #ffffff;
          padding: 20px;
          text-align: center;
          font-size: 24px;
        }
        .content {
          padding: 30px;
          text-align: left;
          color: #333333;
          line-height: 1.6;
        }
        .footer {
          background-color: #f1f1f1;
          color: #777777;
          text-align: center;
          padding: 15px;
          font-size: 12px;
        }
        .highlight {
          color: #0d1b2a;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          HealthHub Password Changed
        </div>
        <div class="content">
          <p>Hello <span class="highlight">${name}</span>,</p>
          <p>This is a confirmation that the password for your HealthHub account has just been changed.</p>
          <p>If you made this change, you can safely ignore this email.</p>
          <p>If you did not make this change, please contact our support team immediately to secure your account.</p>
          <p>Thank you,</p>
          <p><strong>The HealthHub Team</strong></p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} HealthHub. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;
}

export function otpMailHtml(name: string, otp: string) {
  return `<div style="font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'sans-serif';">
  <div style="background-color:#A7D7C5;width:100%;padding:1rem 0rem;margin-bottom:2rem;">
    <div style="width:fit-content;margin:auto;">
      
    <img src="https://i.ibb.co/rfm0RLKx/Logo-with-text.png" alt="HealthHub Logo" border="0" style="height:5rem;">
    </div>
  </div>
  <div style="font-size:2rem;font-weight:bold;text-align:center;margin-bottom:1rem">Your HealthHub OTP is</div>
  <div style="width:100%;">
    <div style="margin:auto;width:fit-content;font-size:3.5rem;font-weight:bold;background-color:#444444;color:white;padding:1rem 2rem;border-radius:1rem;text-align:center;">${otp}</div>
  </div>
  <div style="margin-top:3rem;">
    <div style="background-color:#EDEDED;padding:0.5rem 1rem;">
    <p>Dear ${name},</p>
    <p>Please enter the above mentioned OTP for verifying your email and completing signup to HealthHub.</p>
    <p>Regards,</p>
    <p>Team HealthHub</p>
    <p style="color:#999999">This is a system-generated email. Please do not reply.</p>
  </div>
  <div style="width:100%;color:white;background-color:#5C8D89;padding:0.5rem 0rem;">
    <div style="margin:auto;width:fit-content;">
      &copy; ${new Date().getFullYear()} HealthHub. All rights reserved.
    </div>
  </div>
  </div>
</div>`;
}

export function generateVerificationEmail(code: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your CALEBel Verification Code 💕</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #FFE5E5 0%, #FFF0F5 50%, #FFE5E5 100%);">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #FFE5E5 0%, #FFF0F5 50%, #FFE5E5 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #FFFFFF; border-radius: 20px; box-shadow: 0 10px 40px rgba(238, 105, 131, 0.3); overflow: hidden; border: 3px solid #EE6983;">
          <tr>
            <td style="background: linear-gradient(135deg, #850E35 0%, #EE6983 100%); padding: 40px 30px; text-align: center; position: relative;">
              <div style="font-size: 60px; line-height: 1; margin-bottom: 10px;">💕✨💖</div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">CALEBel</h1>
              <p style="margin: 10px 0 0 0; color: #FFC4C4; font-size: 16px; font-weight: 500;">Your Love Connection Awaits 💝</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 50px 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">🌹</div>
              <h2 style="margin: 0 0 20px 0; color: #850E35; font-size: 28px; font-weight: bold;">Your Verification Code</h2>
              <p style="margin: 0 0 30px 0; color: #666; font-size: 16px; line-height: 1.6;">
                Someone special is waiting for you! 💕<br>
                Enter this code to complete your CALEBration journey:
              </p>
              <div style="background: linear-gradient(135deg, #FFC4C4 0%, #EE6983 100%); border-radius: 15px; padding: 30px; margin: 30px 0; box-shadow: 0 5px 20px rgba(238, 105, 131, 0.2); border: 2px dashed #850E35;">
                <div style="font-size: 48px; font-weight: bold; color: #850E35; letter-spacing: 8px; font-family: 'Courier New', monospace; text-shadow: 2px 2px 4px rgba(255,255,255,0.5);">
                  ${code}
                </div>
              </div>
              <p style="margin: 30px 0 0 0; color: #EE6983; font-size: 14px; font-weight: 600;">
                ⏰ This code expires in 15 minutes
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background: #FFF5E4; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 15px;">💌✨💐</div>
              <p style="margin: 0; color: #850E35; font-size: 14px; line-height: 1.6;">
                <strong>What happens next?</strong><br>
                After verification, our algorithm will find your perfect match!<br>
                Get ready for the most romantic CALEBration ever! 💖
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background: #850E35; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #FFC4C4; font-size: 12px;">
                Made with 💕 by CICT Student Council
              </p>
              <p style="margin: 0; color: #FFC4C4; font-size: 11px; opacity: 0.8;">
                West Visayas State University
              </p>
              <div style="margin-top: 15px; font-size: 20px;">🌹💕🌹</div>
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

export function generateSignInEmail(code: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your CALEBel Sign-In Code 💕</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #FFE5E5 0%, #FFF0F5 50%, #FFE5E5 100%);">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #FFE5E5 0%, #FFF0F5 50%, #FFE5E5 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #FFFFFF; border-radius: 20px; box-shadow: 0 10px 40px rgba(238, 105, 131, 0.3); overflow: hidden; border: 3px solid #EE6983;">
          <tr>
            <td style="background: linear-gradient(135deg, #850E35 0%, #EE6983 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 60px; line-height: 1; margin-bottom: 10px;">💕✨💖</div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: bold;">Welcome Back to CALEBel!</h1>
              <p style="margin: 10px 0 0 0; color: #FFC4C4; font-size: 16px;">Your Love Story Continues 💝</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 50px 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">🔐💕</div>
              <h2 style="margin: 0 0 20px 0; color: #850E35; font-size: 28px; font-weight: bold;">Your Sign-In Code</h2>
              <p style="margin: 0 0 30px 0; color: #666; font-size: 16px; line-height: 1.6;">
                Ready to check on your match? 💕<br>
                Use this code to sign in:
              </p>
              <div style="background: linear-gradient(135deg, #FFC4C4 0%, #EE6983 100%); border-radius: 15px; padding: 30px; margin: 30px 0; box-shadow: 0 5px 20px rgba(238, 105, 131, 0.2); border: 2px dashed #850E35;">
                <div style="font-size: 48px; font-weight: bold; color: #850E35; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${code}
                </div>
              </div>
              <p style="margin: 30px 0 0 0; color: #EE6983; font-size: 14px; font-weight: 600;">
                ⏰ This code expires in 15 minutes
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background: #850E35; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #FFC4C4; font-size: 12px;">
                Made with 💕 by CICT Student Council
              </p>
              <div style="margin-top: 15px; font-size: 20px;">🌹💕🌹</div>
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

export function generateMatchFoundEmail(compatibilityScore: number, reasons: string[], websiteUrl: string): string {
  const reasonsList = reasons.length > 0 
    ? reasons.map(r => `<li style="margin: 8px 0; color: #850E35;">${r}</li>`).join("")
    : "<li style=\"margin: 8px 0; color: #850E35;\">Perfect compatibility match!</li>";
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🎉 You Found Your Ka-Label! - CALEBel</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #FFE5E5 0%, #FFF0F5 50%, #FFE5E5 100%);">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #FFE5E5 0%, #FFF0F5 50%, #FFE5E5 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #FFFFFF; border-radius: 20px; box-shadow: 0 10px 40px rgba(238, 105, 131, 0.3); overflow: hidden; border: 3px solid #EE6983;">
          <tr>
            <td style="background: linear-gradient(135deg, #850E35 0%, #EE6983 100%); padding: 40px 30px; text-align: center; position: relative;">
              <div style="font-size: 60px; line-height: 1; margin-bottom: 10px;">🎉💕✨</div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">Congratulations!</h1>
              <p style="margin: 10px 0 0 0; color: #FFC4C4; font-size: 18px; font-weight: 500;">We Found Your Ka-Label! 💝</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 50px 40px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 20px;">💖🌹💖</div>
              <h2 style="margin: 0 0 20px 0; color: #850E35; font-size: 28px; font-weight: bold;">Your Perfect Match Awaits!</h2>
              <p style="margin: 0 0 30px 0; color: #666; font-size: 16px; line-height: 1.6;">
                Great news! Our algorithm has found someone special for you! 💕<br>
                You have a <strong style="color: #850E35;">${compatibilityScore}% compatibility</strong> match!
              </p>
              
              <div style="background: linear-gradient(135deg, #FFC4C4 0%, #EE6983 100%); border-radius: 15px; padding: 30px; margin: 30px 0; box-shadow: 0 5px 20px rgba(238, 105, 131, 0.2); border: 2px dashed #850E35;">
                <div style="font-size: 48px; font-weight: bold; color: #850E35; margin-bottom: 15px;">
                  ${compatibilityScore}% Match! 🎯
                </div>
                <p style="margin: 15px 0 0 0; color: #850E35; font-size: 14px; font-weight: 600;">Why you're compatible:</p>
                <ul style="text-align: left; margin: 15px 0 0 0; padding-left: 20px; list-style: none;">
                  ${reasonsList}
                </ul>
              </div>

              <div style="margin: 40px 0;">
                <a href="${websiteUrl}/match" style="display: inline-block; background: linear-gradient(135deg, #850E35 0%, #EE6983 100%); color: #FFFFFF; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 5px 20px rgba(238, 105, 131, 0.4); transition: all 0.3s;">
                  🌹 Open Website & See Your Match 🌹
                </a>
              </div>

              <p style="margin: 30px 0 0 0; color: #EE6983; font-size: 14px; font-weight: 600;">
                Sign in to start chatting with your Ka-Label! 💌
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background: #FFF5E4; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 15px;">💌✨💐</div>
              <p style="margin: 0; color: #850E35; font-size: 14px; line-height: 1.6;">
                <strong>What happens next?</strong><br>
                Sign in to CALEBel and discover your match!<br>
                Start your CALEBration journey today! 💖
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background: #850E35; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #FFC4C4; font-size: 12px;">
                Made with 💕 by CICT Student Council
              </p>
              <p style="margin: 0; color: #FFC4C4; font-size: 11px; opacity: 0.8;">
                West Visayas State University
              </p>
              <div style="margin-top: 15px; font-size: 20px;">🌹💕🌹</div>
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

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

export function generateMatchFoundEmail(compatibilityScore: number, reasons: string[], websiteUrl: string, isAdminMatch: boolean = false): string {
  const reasonsList = reasons.length > 0 
    ? reasons.map(r => `<li style="margin: 10px 0; padding: 8px 12px; background: rgba(255,255,255,0.5); border-radius: 8px; color: #850E35; font-size: 15px; border-left: 3px solid #EE6983;">${r}</li>`).join("")
    : "<li style=\"margin: 10px 0; padding: 8px 12px; background: rgba(255,255,255,0.5); border-radius: 8px; color: #850E35; font-size: 15px; border-left: 3px solid #EE6983;\">Perfect compatibility match! ✨</li>";
  
  // Determine score color based on compatibility
  let scoreColor = "#850E35";
  let scoreBg = "linear-gradient(135deg, #FFC4C4 0%, #EE6983 100%)";
  if (compatibilityScore >= 80) {
    scoreColor = "#0D7377";
    scoreBg = "linear-gradient(135deg, #14FFEC 0%, #0D7377 100%)";
  } else if (compatibilityScore >= 60) {
    scoreColor = "#850E35";
    scoreBg = "linear-gradient(135deg, #FFC4C4 0%, #EE6983 100%)";
  }
  
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
        <table role="presentation" style="max-width: 650px; width: 100%; background: #FFFFFF; border-radius: 25px; box-shadow: 0 15px 50px rgba(238, 105, 131, 0.4); overflow: hidden; border: 4px solid #EE6983;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #850E35 0%, #EE6983 50%, #FFC4C4 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
              <div style="position: absolute; top: -20px; right: -20px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
              <div style="position: absolute; bottom: -30px; left: -30px; width: 120px; height: 120px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
              <div style="font-size: 70px; line-height: 1; margin-bottom: 15px; position: relative; z-index: 1;">🎉💕✨</div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 36px; font-weight: bold; text-shadow: 3px 3px 6px rgba(0,0,0,0.3); position: relative; z-index: 1;">Congratulations!</h1>
              <p style="margin: 15px 0 0 0; color: #FFFFFF; font-size: 20px; font-weight: 600; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); position: relative; z-index: 1;">We Found Your Ka-Label! 💝</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 50px 40px; text-align: center; background: #FFFFFF;">
              <div style="font-size: 80px; margin-bottom: 25px; animation: pulse 2s infinite;">💖🌹💖</div>
              <h2 style="margin: 0 0 25px 0; color: #850E35; font-size: 32px; font-weight: bold; line-height: 1.3;">Your Perfect Match Awaits!</h2>
              <p style="margin: 0 0 35px 0; color: #555; font-size: 18px; line-height: 1.8;">
                ${isAdminMatch 
                  ? "🎊 Great news! You've been matched with someone special by our admin team! 💕<br><br>"
                  : "🎊 Great news! Our amazing algorithm has found someone special for you! 💕<br><br>"}
                You have an incredible <strong style="color: #850E35; font-size: 20px;">${compatibilityScore}% compatibility</strong> match! 🎯
              </p>
              
              <!-- Compatibility Score Card -->
              <div style="background: ${scoreBg}; border-radius: 20px; padding: 35px; margin: 35px 0; box-shadow: 0 8px 30px rgba(238, 105, 131, 0.3); border: 3px solid ${scoreColor}; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                <div style="position: relative; z-index: 1;">
                  <div style="font-size: 56px; font-weight: bold; color: ${scoreColor}; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(255,255,255,0.5);">
                    ${compatibilityScore}% Match! 🎯
                  </div>
                  <p style="margin: 20px 0 0 0; color: ${scoreColor}; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Why You're Perfect Together:</p>
                  <ul style="text-align: left; margin: 20px 0 0 0; padding: 0; list-style: none; max-width: 500px; margin-left: auto; margin-right: auto;">
                    ${reasonsList}
                  </ul>
                </div>
              </div>

              <!-- Call to Action Button -->
              <div style="margin: 45px 0;">
                <a href="${websiteUrl}/signin" style="display: inline-block; background: linear-gradient(135deg, #850E35 0%, #EE6983 100%); color: #FFFFFF; text-decoration: none; padding: 20px 50px; border-radius: 50px; font-weight: bold; font-size: 18px; box-shadow: 0 8px 25px rgba(238, 105, 131, 0.5); transition: all 0.3s; text-transform: uppercase; letter-spacing: 1px;">
                  🌹 Open Website & See Your Match 🌹
                </a>
              </div>

              <p style="margin: 35px 0 0 0; color: #EE6983; font-size: 15px; font-weight: 600; line-height: 1.8;">
                ✨ Sign in to <a href="${websiteUrl}/signin" style="color: #850E35; text-decoration: underline; font-weight: bold;">${websiteUrl}/signin</a> to view your match and start chatting with your Ka-Label! 💌<br>
                Your love story begins now! 💕
              </p>
            </td>
          </tr>
          
          <!-- What's Next Section -->
          <tr>
            <td style="padding: 40px; background: linear-gradient(135deg, #FFF5E4 0%, #FFE5E5 100%); text-align: center; border-top: 3px solid #EE6983;">
              <div style="font-size: 40px; margin-bottom: 20px;">💌✨💐</div>
              <h3 style="margin: 0 0 15px 0; color: #850E35; font-size: 22px; font-weight: bold;">What Happens Next?</h3>
              <div style="text-align: left; max-width: 500px; margin: 0 auto;">
                <p style="margin: 12px 0; color: #850E35; font-size: 15px; line-height: 1.8;">
                  <strong style="font-size: 18px;">1️⃣ Sign In</strong><br>
                  Use your email to sign in to CALEBel
                </p>
                <p style="margin: 12px 0; color: #850E35; font-size: 15px; line-height: 1.8;">
                  <strong style="font-size: 18px;">2️⃣ Discover Your Match</strong><br>
                  View your Ka-Label's profile and compatibility details
                </p>
                <p style="margin: 12px 0; color: #850E35; font-size: 15px; line-height: 1.8;">
                  <strong style="font-size: 18px;">3️⃣ Start Chatting</strong><br>
                  Begin your CALEBration journey in the Chat Chamber! 💖
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 35px 40px; background: linear-gradient(135deg, #850E35 0%, #EE6983 100%); text-align: center;">
              <p style="margin: 0 0 12px 0; color: #FFC4C4; font-size: 14px; font-weight: 600;">
                Made with 💕 by CICT Student Council
              </p>
              <p style="margin: 0 0 20px 0; color: #FFC4C4; font-size: 12px; opacity: 0.9;">
                West Visayas State University
              </p>
              <div style="margin-top: 20px; font-size: 24px;">🌹💕🌹</div>
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

export function generateChatNotificationEmail(senderAlias: string, websiteUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>💌 New Message from Your Ka-Label! - CALEBel</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #FFE5E5 0%, #FFF0F5 50%, #FFE5E5 100%);">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #FFE5E5 0%, #FFF0F5 50%, #FFE5E5 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #FFFFFF; border-radius: 20px; box-shadow: 0 10px 40px rgba(238, 105, 131, 0.3); overflow: hidden; border: 3px solid #EE6983;">
          <tr>
            <td style="background: linear-gradient(135deg, #850E35 0%, #EE6983 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 60px; line-height: 1; margin-bottom: 10px;">💌✨💕</div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: bold;">New Message!</h1>
              <p style="margin: 10px 0 0 0; color: #FFC4C4; font-size: 16px;">Your Ka-Label sent you a message 💝</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 50px 40px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 20px;">💬💕</div>
              <h2 style="margin: 0 0 20px 0; color: #850E35; font-size: 28px; font-weight: bold;">You Have a New Message!</h2>
              <p style="margin: 0 0 30px 0; color: #666; font-size: 16px; line-height: 1.6;">
                <strong style="color: #850E35;">${senderAlias}</strong> has sent you a message in the CALEBration Chamber! 💕<br>
                Don't keep them waiting!
              </p>
              <div style="margin: 40px 0;">
                <a href="${websiteUrl}/chat" style="display: inline-block; background: linear-gradient(135deg, #850E35 0%, #EE6983 100%); color: #FFFFFF; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 5px 20px rgba(238, 105, 131, 0.4);">
                  💌 Open Chat & Reply 💌
                </a>
              </div>
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

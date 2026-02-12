import { Request, Response } from "express";
import { query } from "../db";
import { sendEmail } from "../services/emailService";
import { matchWaitingUsers } from "../services/matchService";

/**
 * Request a rematch
 * POST /api/rematch/request
 * Body: { userId: string, gcashRef: string, paymentProofUrl: string }
 */
export async function requestRematch(req: Request, res: Response) {
  try {
    const { userId, gcashRef, paymentProofUrl } = req.body as {
      userId: string;
      gcashRef: string;
      paymentProofUrl: string;
    };

    if (!userId || !gcashRef || !paymentProofUrl) {
      return res.status(400).json({
        error: "userId, gcashRef, and paymentProofUrl required."
      });
    }

    // Check if user exists and is currently matched
    const userResult = await query<{ id: string; status: string }>(
      "SELECT id, status FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const userStatus = userResult.rows[0].status;

    // Check if user already has a pending rematch request
    const existingRequest = await query<{ id: string }>(
      "SELECT id FROM rematch_requests WHERE user_id = $1 AND status = 'pending'",
      [userId]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({
        error: "You already have a pending rematch request. Please wait for verification."
      });
    }

    // Create rematch request
    await query(
      "INSERT INTO rematch_requests(user_id, gcash_ref, payment_proof_url, status) VALUES ($1, $2, $3, 'pending')",
      [userId, gcashRef, paymentProofUrl]
    );

    // Update user status to waiting
    await query("UPDATE users SET status = 'waiting' WHERE id = $1", [userId]);

    // Deactivate current match if exists
    if (userStatus === "matched") {
      await query(
        `UPDATE matches SET active = false 
         WHERE (user1_id = $1 OR user2_id = $1) 
         AND COALESCE(active, true) = true`,
        [userId]
      );
    }

    console.log(`\n🔄 Rematch requested by user: ${userId}\n`);

    return res.json({
      success: true,
      message: "Rematch request submitted. Please wait for payment verification."
    });
  } catch (error: any) {
    console.error("Error requesting rematch:", error);
    return res.status(500).json({
      error: "Failed to request rematch",
      details: error.message
    });
  }
}

/**
 * Verify rematch payment (Admin only)
 * POST /api/rematch/verify-payment
 * Body: { requestId: string, verified: boolean }
 */
export async function verifyRematchPayment(req: Request, res: Response) {
  try {
    const { requestId, verified } = req.body as {
      requestId: string;
      verified: boolean;
    };

    if (!requestId || typeof verified !== "boolean") {
      return res.status(400).json({
        error: "requestId and verified (boolean) required."
      });
    }

    // Get rematch request
    const requestResult = await query<{
      user_id: string;
      status: string;
    }>(
      "SELECT user_id, status FROM rematch_requests WHERE id = $1",
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: "Rematch request not found." });
    }

    const userId = requestResult.rows[0].user_id;

    if (verified) {
      // Update rematch request status
      await query(
        "UPDATE rematch_requests SET status = 'verified' WHERE id = $1",
        [requestId]
      );

      // Ensure user is in waiting status
      await query("UPDATE users SET status = 'waiting' WHERE id = $1", [userId]);

      // Try to match immediately
      const matchedCount = await matchWaitingUsers();

      // Get user email for notification
      const userResult = await query<{ profile: any }>(
        "SELECT profile FROM user_profiles WHERE user_id = $1",
        [userId]
      );

      const userEmail = userResult.rows[0]?.profile?.email;

      if (userEmail) {
        try {
          if (matchedCount > 0) {
            await sendEmail(
              userEmail,
              "🎉 Rematch Found! - CALEBel",
              `Congratulations! We found you a new match! Please sign in to start chatting with your new Ka-Label.\n\nThank you,\nCALEBel Team`
            );
          } else {
            await sendEmail(
              userEmail,
              "✅ Rematch Payment Verified - CALEBel",
              `Your rematch payment has been verified. We're searching for your perfect match and will notify you via email once we find one!\n\nThank you,\nCALEBel Team`
            );
          }
        } catch (emailError) {
          console.error("Failed to send rematch email:", emailError);
        }
      }

      console.log(`\n✅ Rematch payment verified for user: ${userId}\n`);

      return res.json({
        success: true,
        message: "Rematch payment verified. User is now in the matching queue.",
        matched: matchedCount > 0
      });
    } else {
      // Reject payment
      await query(
        "UPDATE rematch_requests SET status = 'rejected' WHERE id = $1",
        [requestId]
      );

      // Get user email
      const userResult = await query<{ profile: any }>(
        "SELECT profile FROM user_profiles WHERE user_id = $1",
        [userId]
      );

      const userEmail = userResult.rows[0]?.profile?.email;

      if (userEmail) {
        try {
          await sendEmail(
            userEmail,
            "Rematch Payment Rejected - CALEBel",
            `Your rematch payment has been rejected. Please register again with a valid payment.\n\nThank you,\nCALEBel Team`
          );
        } catch (emailError) {
          console.error("Failed to send rejection email:", emailError);
        }
      }

      return res.json({
        success: true,
        message: "Rematch payment rejected."
      });
    }
  } catch (error: any) {
    console.error("Error verifying rematch payment:", error);
    return res.status(500).json({
      error: "Failed to verify rematch payment",
      details: error.message
    });
  }
}

/**
 * Get rematch status for a user
 * GET /api/rematch/status/:userId
 */
export async function getRematchStatus(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const result = await query<{
      id: string;
      status: string;
      created_at: string;
    }>(
      "SELECT id, status, created_at FROM rematch_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ hasRequest: false });
    }

    return res.json({
      hasRequest: true,
      request: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error: any) {
    console.error("Error getting rematch status:", error);
    return res.status(500).json({
      error: "Failed to get rematch status",
      details: error.message
    });
  }
}

/**
 * Update user blueprint (for rematch)
 * POST /api/rematch/update-blueprint
 * Body: { userId: string, blueprint: { alias, sogiesc, personality, loveLanguageReceive, loveLanguageProvide, interests, preferred } }
 */
export async function updateBlueprint(req: Request, res: Response) {
  try {
    const { userId, blueprint } = req.body as {
      userId: string;
      blueprint: {
        alias?: string;
        sogiesc?: any;
        personality?: any;
        loveLanguageReceive?: string[];
        loveLanguageProvide?: string[];
        interests?: string[];
        preferred?: any;
      };
    };

    if (!userId || !blueprint) {
      return res.status(400).json({
        error: "userId and blueprint required."
      });
    }

    // Check if user exists
    const userResult = await query<{ id: string }>(
      "SELECT id FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    // Get current profile
    const profileResult = await query<{ profile: any }>(
      "SELECT profile FROM user_profiles WHERE user_id = $1",
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const currentProfile = profileResult.rows[0].profile || {};

    // Update alias in users table if provided
    if (blueprint.alias) {
      await query("UPDATE users SET alias = $1 WHERE id = $2", [blueprint.alias, userId]);
    }

    // Merge blueprint updates into existing profile
    const updatedProfile = {
      ...currentProfile,
      ...(blueprint.alias && { alias: blueprint.alias }),
      ...(blueprint.sogiesc && { sogiesc: { ...currentProfile.sogiesc, ...blueprint.sogiesc } }),
      ...(blueprint.personality && { personality: { ...currentProfile.personality, ...blueprint.personality } }),
      ...(blueprint.loveLanguageReceive && { loveLanguageReceive: blueprint.loveLanguageReceive }),
      ...(blueprint.loveLanguageProvide && { loveLanguageProvide: blueprint.loveLanguageProvide }),
      ...(blueprint.interests && { interests: blueprint.interests }),
      ...(blueprint.preferred && { preferred: { ...currentProfile.preferred, ...blueprint.preferred } })
    };

    // Update profile in database
    await query(
      "UPDATE user_profiles SET profile = $1 WHERE user_id = $2",
      [updatedProfile, userId]
    );

    console.log(`\n📝 Blueprint updated for user: ${userId}\n`);

    return res.json({
      success: true,
      message: "Blueprint updated successfully."
    });
  } catch (error: any) {
    console.error("Error updating blueprint:", error);
    return res.status(500).json({
      error: "Failed to update blueprint",
      details: error.message
    });
  }
}

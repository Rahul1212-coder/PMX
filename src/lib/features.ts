/**
 * Application Feature Flags & Runtime Switches
 */

/**
 * Checks whether the AI Mentor feature is enabled.
 * - Enabled in local development (NODE_ENV !== 'production')
 * - Disabled in production (NODE_ENV === 'production')
 * - Can be explicitly overridden via NEXT_PUBLIC_ENABLE_AI_MENTOR ('true' | 'false')
 */
export function isAiMentorEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_ENABLE_AI_MENTOR === 'true') {
    return true;
  }
  if (process.env.NEXT_PUBLIC_ENABLE_AI_MENTOR === 'false') {
    return false;
  }
  return process.env.NODE_ENV !== 'production';
}

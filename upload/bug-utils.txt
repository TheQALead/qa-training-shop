import { db } from '@/lib/db';

/**
 * Проверить, включен ли баг для пользователя
 */
export async function isBugEnabled(userId: string, bugId: string): Promise<boolean> {
  try {
    const userBug = await db.userBug.findUnique({
      where: {
        userId_bugId: { userId, bugId },
      },
    });

    if (userBug) {
      return userBug.enabled;
    }

    const bug = await db.bug.findUnique({ where: { id: bugId } });
    return bug?.defaultEnabled ?? true;
  } catch (error) {
    console.error(`Error checking bug ${bugId}:`, error);
    return true;
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BUG_DEFINITIONS } from '@/lib/bugs';

// GET - получить баги
export async function GET(request: NextRequest) {
  const adminToken = request.headers.get('x-admin-token');

  try {
    if (adminToken) {
      const admin = await db.admin.findFirst();
      if (!admin || admin.id !== adminToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Инициализируем баги если их нет
      let bugs = await db.bug.findMany();
      if (bugs.length === 0) {
        await db.bug.createMany({
          data: BUG_DEFINITIONS.map(bug => ({
            id: bug.id,
            name: bug.name,
            description: bug.description,
            category: bug.category,
            defaultEnabled: bug.defaultEnabled,
          })),
        });
        bugs = await db.bug.findMany();
      } else {
        // Синхронизируем defaultEnabled с определениями
        for (const def of BUG_DEFINITIONS) {
          const existingBug = bugs.find(b => b.id === def.id);
          if (existingBug && existingBug.defaultEnabled !== def.defaultEnabled) {
            await db.bug.update({
              where: { id: def.id },
              data: { defaultEnabled: def.defaultEnabled },
            });
          }
        }
        bugs = await db.bug.findMany();
      }

      // Получаем пользователей с их багами
      const users = await db.user.findMany({
        include: {
          userBugs: {
            include: { bug: true },
          },
        },
      });

      return NextResponse.json({
        bugs: bugs.map(b => ({
          ...b,
          categoryLabel: BUG_DEFINITIONS.find(d => d.id === b.id)?.categoryLabel || b.category,
          howToFind: BUG_DEFINITIONS.find(d => d.id === b.id)?.howToFind || '',
          severity: BUG_DEFINITIONS.find(d => d.id === b.id)?.severity || 'medium',
        })),
        users: users.map(u => ({
          id: u.id,
          login: u.login,
          role: u.role,
          userBugs: u.userBugs,
        })),
      });
    }

    return NextResponse.json({ bugs: BUG_DEFINITIONS });
  } catch (error) {
    console.error('Bugs API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// PUT - обновить баг
export async function PUT(request: NextRequest) {
  const adminToken = request.headers.get('x-admin-token');

  try {
    const admin = await db.admin.findFirst();
    if (!admin || admin.id !== adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    if (action === 'toggle_user_bug') {
      const { userId, bugId, enabled } = data;

      let userBug = await db.userBug.findUnique({
        where: { userId_bugId: { userId, bugId } },
      });

      if (userBug) {
        userBug = await db.userBug.update({
          where: { id: userBug.id },
          data: { enabled },
        });
      } else {
        userBug = await db.userBug.create({
          data: { userId, bugId, enabled },
        });
      }

      return NextResponse.json({ success: true, userBug });
    }

    if (action === 'toggle_found') {
      const { userId, bugId, found } = data;

      let userBug = await db.userBug.findUnique({
        where: { userId_bugId: { userId, bugId } },
      });

      if (userBug) {
        userBug = await db.userBug.update({
          where: { id: userBug.id },
          data: { found },
        });
      } else {
        userBug = await db.userBug.create({
          data: { userId, bugId, enabled: true, found },
        });
      }

      return NextResponse.json({ success: true, userBug });
    }

    if (action === 'toggle_all_bugs_for_user') {
      const { userId, enabled } = data;
      await db.userBug.updateMany({
        where: { userId },
        data: { enabled },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Bugs API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

import { Store, SessionData } from 'express-session';
import { eq, and, or, isNull, gt } from 'drizzle-orm';
import { db } from '../db/config.js';
import { sessions } from '../db/schema.js';

export class TursoSessionStore extends Store {
  async get(sid: string, callback: (err: any, session?: SessionData | null) => void) {
    try {
      const now = new Date();
      const result = await db.select()
        .from(sessions)
        .where(
          and(
            eq(sessions.id, sid),
            or(
              isNull(sessions.expires),
              gt(sessions.expires, now)
            )
          )
        )
        .limit(1);

      if (!result.length) {
        return callback(null, null);
      }

      const session = JSON.parse(result[0].data) as SessionData;
      callback(null, session);
    } catch (err) {
      callback(err);
    }
  }

  async set(sid: string, session: SessionData, callback?: (err?: any) => void) {
    try {
      const expires = session.cookie.expires ? new Date(session.cookie.expires) : null;
      const data = JSON.stringify(session);

      await db.insert(sessions)
        .values({
          id: sid,
          expires,
          data
        })
        .onConflictDoUpdate({
          target: sessions.id,
          set: {
            expires,
            data
          }
        });

      if (callback) callback();
    } catch (err) {
      if (callback) callback(err);
    }
  }

  async destroy(sid: string, callback?: (err?: any) => void) {
    try {
      await db.delete(sessions)
        .where(eq(sessions.id, sid));

      if (callback) callback();
    } catch (err) {
      if (callback) callback(err);
    }
  }

  async touch(sid: string, session: SessionData, callback?: (err?: any) => void) {
    try {
      const expires = session.cookie.expires ? new Date(session.cookie.expires) : null;

      await db.update(sessions)
        .set({ expires })
        .where(eq(sessions.id, sid));

      if (callback) callback();
    } catch (err) {
      if (callback) callback(err);
    }
  }

  async clear(callback?: (err?: any) => void) {
    try {
      await db.delete(sessions);
      if (callback) callback();
    } catch (err) {
      if (callback) callback(err);
    }
  }
}
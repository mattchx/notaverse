import { Store, SessionData } from 'express-session';
import client from '../db.js';

interface StoredSessionData {
  id: string;
  expires: number | null;
  data: string;
}

export class TursoSessionStore extends Store {
  private readonly tableName = 'sessions';

  constructor() {
    super();
    this.initTable().catch(console.error);
  }

  private async initTable() {
    await client.execute(
      `CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id TEXT PRIMARY KEY,
        expires INTEGER,
        data TEXT
      )`
    );
  }

  async get(sid: string, callback: (err: any, session?: SessionData | null) => void) {
    try {
      const now = Date.now();
      const result = await client.execute({
        sql: `SELECT * FROM ${this.tableName} WHERE id = ? AND (expires IS NULL OR expires > ?)`,
        args: [sid, now]
      });

      if (!result.rows.length) {
        return callback(null, null);
      }

      const stored = result.rows[0] as StoredSessionData;
      const session = JSON.parse(stored.data) as SessionData;
      callback(null, session);
    } catch (err) {
      callback(err);
    }
  }

  async set(sid: string, session: SessionData, callback?: (err?: any) => void) {
    try {
      const expires = session.cookie.expires ? new Date(session.cookie.expires).getTime() : null;
      const data = JSON.stringify(session);
      const expiresStr = expires === null ? 'NULL' : expires.toString();

      await client.execute(
        `INSERT INTO ${this.tableName} (id, expires, data)
         VALUES ('${sid}', ${expiresStr}, '${data}')
         ON CONFLICT(id) DO UPDATE SET
           expires = excluded.expires,
           data = excluded.data`
      );

      if (callback) callback();
    } catch (err) {
      if (callback) callback(err);
    }
  }

  async destroy(sid: string, callback?: (err?: any) => void) {
    try {
      await client.execute(
        `DELETE FROM ${this.tableName} WHERE id = '${sid}'`
      );

      if (callback) callback();
    } catch (err) {
      if (callback) callback(err);
    }
  }

  async touch(sid: string, session: SessionData, callback?: (err?: any) => void) {
    try {
      const expires = session.cookie.expires ? new Date(session.cookie.expires).getTime() : null;
      const expiresStr = expires === null ? 'NULL' : expires.toString();

      await client.execute(
        `UPDATE ${this.tableName} SET expires = ${expiresStr} WHERE id = '${sid}'`
      );

      if (callback) callback();
    } catch (err) {
      if (callback) callback(err);
    }
  }

  async clear(callback?: (err?: any) => void) {
    try {
      await client.execute(`DELETE FROM ${this.tableName}`);
      if (callback) callback();
    } catch (err) {
      if (callback) callback(err);
    }
  }
}
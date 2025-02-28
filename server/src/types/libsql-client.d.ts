declare module '@libsql/client' {
  export interface ExecuteOptions {
    sql: string;
    args?: Array<string | number | null>;
  }

  export interface ExecuteResult<T = any> {
    rows: T[];
    rowsAffected: number;
    lastInsertRowid: number | null;
  }
  
  export function createClient(options: { url: string }): {
    execute(sql: string | ExecuteOptions): Promise<ExecuteResult>;
  };
}
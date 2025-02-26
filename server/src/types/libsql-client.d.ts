declare module '@libsql/client' {
  export function createClient(options: { url: string }): {
    execute(sql: string): Promise<any>;
  };
}
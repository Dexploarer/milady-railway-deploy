/**
 * PGlite HTTP adapter.
 *
 * Bridges Milady's database layer to a remote PGlite HTTP server
 * (Railway deployment at TheDevScoop/PGlite-oQIF).
 *
 *   POST /query       — { query, params? } → { success, rows, fields }
 *   POST /transaction — { queries: [{query, params?}] } → { success, results }
 *   GET  /health      — { status, database, dataDir, timestamp }
 *   GET  /tables      — { success, tables: string[] }
 */

import type { PgliteHttpConfig } from "../config/types.milady";

export interface PgliteHttpQueryResult {
  success: boolean;
  rows: Record<string, unknown>[];
  rowCount: number;
  fields?: { name: string; dataTypeID: number }[];
  error?: string;
}

export interface PgliteHttpTransactionResult {
  success: boolean;
  results?: { rows: Record<string, unknown>[]; rowCount: number }[];
  error?: string;
}

export class PgliteHttpClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;
  private readonly timeoutMs: number;

  constructor(config: PgliteHttpConfig) {
    this.baseUrl = config.url.replace(/\/+$/, "");
    this.timeoutMs = config.timeoutMs ?? 30_000;
    this.headers = { "Content-Type": "application/json" };
    if (config.authToken) {
      this.headers.Authorization = `Bearer ${config.authToken}`;
    }
  }

  async query(
    sql: string,
    params?: unknown[],
  ): Promise<PgliteHttpQueryResult> {
    const res = await fetch(`${this.baseUrl}/query`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ query: sql, params: params ?? [] }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    return (await res.json()) as PgliteHttpQueryResult;
  }

  async transaction(
    queries: { query: string; params?: unknown[] }[],
  ): Promise<PgliteHttpTransactionResult> {
    const res = await fetch(`${this.baseUrl}/transaction`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ queries }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    return (await res.json()) as PgliteHttpTransactionResult;
  }

  async health(): Promise<{
    status: string;
    database: string;
    dataDir: string;
  }> {
    const res = await fetch(`${this.baseUrl}/health`, {
      headers: this.headers,
      signal: AbortSignal.timeout(5_000),
    });
    return (await res.json()) as {
      status: string;
      database: string;
      dataDir: string;
    };
  }

  async tables(): Promise<string[]> {
    const res = await fetch(`${this.baseUrl}/tables`, {
      headers: this.headers,
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    const data = (await res.json()) as { success: boolean; tables: string[] };
    return data.tables ?? [];
  }
}

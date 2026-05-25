/**
 * Optional atomic stock decrement via Directus PostgreSQL.
 * Set DIRECTUS_DATABASE_URL to enable (e.g. postgresql://directus:pass@host:5432/directus).
 */

export type StockDecrementLine = {
  productId: string;
  size: string;
  qty: number;
};

export type StockDecrementResult =
  | { ok: true; remaining: number; rowId: string | number }
  | { ok: false; reason: "insufficient" | "not_found" | "error"; message: string };

let poolPromise: Promise<import("pg").Pool> | null = null;

async function getPool(): Promise<import("pg").Pool | null> {
  const url = process.env.DIRECTUS_DATABASE_URL?.trim();
  if (!url) return null;

  if (!poolPromise) {
    poolPromise = (async () => {
      const { Pool } = await import("pg");
      return new Pool({ connectionString: url, max: 3 });
    })();
  }

  return poolPromise;
}

function tableName(): string {
  return process.env.DIRECTUS_PRODUCTS_SIZES_TABLE ?? "products_sizes";
}

/**
 * Atomic: UPDATE ... SET quantity = quantity - qty WHERE quantity >= qty RETURNING ...
 */
export async function decrementStockLineAtomic(
  line: StockDecrementLine
): Promise<StockDecrementResult> {
  const pool = await getPool();
  if (!pool) {
    return { ok: false, reason: "error", message: "DIRECTUS_DATABASE_URL not configured" };
  }

  const table = tableName();
  const productId = line.productId;
  const size = line.size;
  const qty = Math.max(0, Math.floor(line.qty));

  if (!size || qty <= 0) {
    return { ok: false, reason: "error", message: "Invalid line" };
  }

  try {
    const sql = `
      UPDATE ${table}
      SET quantity = quantity - $1
      WHERE product_id::text = $2
        AND size = $3
        AND quantity >= $1
      RETURNING id, quantity
    `;
    const res = await pool.query<{ id: string | number; quantity: number }>(sql, [
      qty,
      productId,
      size,
    ]);

    if (res.rowCount === 0) {
      const check = await pool.query<{ quantity: number }>(
        `SELECT quantity FROM ${table} WHERE product_id::text = $1 AND size = $2 LIMIT 1`,
        [productId, size]
      );
      if (check.rowCount === 0) {
        return { ok: false, reason: "not_found", message: "Stock row not found" };
      }
      return {
        ok: false,
        reason: "insufficient",
        message: `Insufficient stock (have ${check.rows[0]?.quantity ?? 0}, need ${qty})`,
      };
    }

    const row = res.rows[0];
    return {
      ok: true,
      remaining: Number(row.quantity),
      rowId: row.id,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: "error", message: msg };
  }
}

export function isPgStockEnabled(): boolean {
  return Boolean(process.env.DIRECTUS_DATABASE_URL?.trim());
}

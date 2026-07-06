import { sql, type SQL } from "drizzle-orm";
import type { MySqlTable } from "drizzle-orm/mysql-core";
import { db } from "../db";

interface Queryable<T> {
  findMany: (config: any) => Promise<T[]>;
}

export async function getPaginatedResult<T>({
  queryable,
  table,
  where,
  orderBy,
  with: withRelations,
  page,
  limit,
}: {
  queryable: Queryable<T>;
  table: MySqlTable;
  where?: SQL;
  orderBy?: SQL | SQL[];
  with?: Record<string, any>;
  page: number;
  limit: number;
}) {
  const offset = (page - 1) * limit;

  const [items, totalResult] = await Promise.all([
    queryable.findMany({ where, orderBy, with: withRelations, limit, offset }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(table)
      .where(where),
  ]);

  return { items, total: Number(totalResult[0]?.count ?? 0) };
}

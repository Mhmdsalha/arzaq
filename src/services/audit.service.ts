import { cache } from "react";

import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 30;

export type AuditLogFilters = {
  action?: string;
  userId?: string;
  from?: string;
  to?: string;
  page?: number;
};

export const getAuditLogs = cache(async (filters: AuditLogFilters = {}) => {
  const page = Math.max(filters.page ?? 1, 1);
  const where = {
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.userId ? { userId: filters.userId } : {}),
    ...(filters.from || filters.to
      ? {
          createdAt: {
            ...(filters.from ? { gte: new Date(filters.from) } : {}),
            ...(filters.to ? { lte: new Date(filters.to) } : {}),
          },
        }
      : {}),
  };

  const [logs, total, actions] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        userId: true,
        action: true,
        entityType: true,
        entityId: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      distinct: ["action"],
      orderBy: {
        action: "asc",
      },
      select: {
        action: true,
      },
    }),
  ]);

  return {
    logs,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1),
    actions: actions.map((item) => item.action),
  };
});

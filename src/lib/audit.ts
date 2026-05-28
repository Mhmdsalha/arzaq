import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "REGISTER"
  | "LOGOUT"
  | "PASSWORD_CHANGE"
  | "PHONE_VERIFIED"
  | "EMAIL_VERIFIED"
  | "CREATE_JOB"
  | "UPDATE_JOB"
  | "DELETE_JOB"
  | "CLOSE_JOB"
  | "CREATE_OFFER"
  | "ACCEPT_OFFER"
  | "REJECT_OFFER"
  | "WITHDRAW_OFFER"
  | "CREATE_REVIEW"
  | "CREATE_REPORT"
  | "BAN_USER"
  | "UNBAN_USER"
  | "UPLOAD_FILE"
  | "ACCOUNT_TYPE_SWITCH";

export function logAudit(
  action: AuditAction,
  options?: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  },
): void {
  void prisma.auditLog
    .create({
      data: {
        action,
        userId: options?.userId,
        entityType: options?.entityType,
        entityId: options?.entityId,
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
        metadata: options?.metadata ?? {},
      },
    })
    .catch((error: unknown) => {
      console.error("Audit log failed:", error);
    });
}

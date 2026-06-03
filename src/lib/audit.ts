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
  | "CREATE_LISTING"
  | "UPDATE_LISTING"
  | "REVIEW_LISTING"
  | "PAUSE_LISTING"
  | "ACTIVATE_LISTING"
  | "DELETE_LISTING"
  | "CREATE_ORDER"
  | "UPDATE_ORDER_STATUS"
  | "CANCEL_ORDER"
  | "ACCEPT_OFFER"
  | "REJECT_OFFER"
  | "WITHDRAW_OFFER"
  | "CREATE_REVIEW"
  | "CREATE_REPORT"
  | "CREATE_ADMIN"
  | "VERIFY_ACCOUNT"
  | "UNVERIFY_ACCOUNT"
  | "BAN_USER"
  | "UNBAN_USER"
  | "TRUST_PROVIDER"
  | "UNTRUST_PROVIDER"
  | "REQUEST_PROVIDER_VERIFICATION"
  | "APPROVE_PROVIDER_VERIFICATION"
  | "REJECT_PROVIDER_VERIFICATION"
  | "APPROVE_JOB"
  | "REQUEST_JOB_EDIT"
  | "ADMIN_DELETE_JOB"
  | "REVIEW_REPORT"
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

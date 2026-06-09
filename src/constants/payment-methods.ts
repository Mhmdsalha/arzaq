import type { StorePlanPaymentMethod } from "@prisma/client";

export type PaymentMethodConfig = {
  label: string;
  shortLabel: string;
  description: string;
  details: Array<{
    label: string;
    value: string;
  }>;
  note: string;
};

export const paymentMethodOrder = [
  "BANK_OF_PALESTINE",
  "PAYPAL",
  "JAWAL_PAY",
] as const satisfies readonly StorePlanPaymentMethod[];

export const paymentMethods: Record<StorePlanPaymentMethod, PaymentMethodConfig> = {
  BANK_OF_PALESTINE: {
    label: "بنك فلسطين",
    shortLabel: "بنك فلسطين",
    description: "حوّل قيمة الباقة إلى حساب أرزاق البنكي ثم ارفع إشعار الدفع.",
    details: [
      { label: "اسم المستفيد", value: "أرزاق" },
      { label: "رقم الحساب", value: "يتم تحديثه من إعدادات الدفع" },
      { label: "ملاحظة التحويل", value: "اكتب اسمك ورقم جوالك في وصف الحوالة" },
    ],
    note: "بعد التحويل، ارفع صورة واضحة لإشعار الدفع يظهر فيها المبلغ والتاريخ.",
  },
  PAYPAL: {
    label: "محفظة PayPal",
    shortLabel: "PayPal",
    description: "أرسل المبلغ إلى محفظة أرزاق ثم أرفق لقطة شاشة من عملية الدفع.",
    details: [
      { label: "البريد", value: "payments@arzaq.ps" },
      { label: "العملة", value: "شيكل أو ما يعادله" },
      { label: "الملاحظة", value: "اكتب اسم حسابك في أرزاق" },
    ],
    note: "تأكد أن لقطة الشاشة تحتوي على رقم العملية أو البريد المرسل منه.",
  },
  JAWAL_PAY: {
    label: "محفظة جوال Pay",
    shortLabel: "جوال Pay",
    description: "حوّل المبلغ عبر جوال Pay ثم ارفع صورة الإشعار للمراجعة.",
    details: [
      { label: "اسم المحفظة", value: "أرزاق" },
      { label: "رقم المحفظة", value: "يتم تحديثه من إعدادات الدفع" },
      { label: "ملاحظة التحويل", value: "اكتب اسمك ورقم جوالك" },
    ],
    note: "يفضل إضافة رقم العملية في نموذج الدفع لتسريع المراجعة.",
  },
};

export function getPaymentMethodConfig(method: StorePlanPaymentMethod): PaymentMethodConfig {
  return paymentMethods[method];
}

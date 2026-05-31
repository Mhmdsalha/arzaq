import bcrypt from "bcryptjs";

import { approveJobPost } from "../src/services/admin.service";
import { createJob, getJobsWithFilters } from "../src/services/job.service";
import { acceptOffer, createOffer, getJobOffers } from "../src/services/offer.service";
import { getProviderVerificationSummary } from "../src/services/provider-verification.service";
import { createReview } from "../src/services/review.service";
import { getNavigationSummaryFresh, getUserNotifications } from "../src/services/navigation.service";
import { prisma } from "../src/lib/prisma";

const password = "Test@1234";

type StepResult = {
  name: string;
  ok: boolean;
  detail?: string;
};

const results: StepResult[] = [];

function record(name: string, ok: boolean, detail?: string) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` - ${detail}` : ""}`);
}

async function main() {
  const runId = Date.now().toString().slice(-8);
  const passwordHash = await bcrypt.hash(password, 12);
  const category = await prisma.category.findFirst({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  if (!category) {
    throw new Error("لا توجد تصنيفات في قاعدة البيانات");
  }

  const admin = await createTestUser({
    kind: "admin",
    runId,
    role: "ADMIN",
    accountType: "CLIENT",
    passwordHash,
  });
  const client = await createTestUser({
    kind: "client",
    runId,
    role: "USER",
    accountType: "CLIENT",
    passwordHash,
  });
  const provider = await createTestUser({
    kind: "provider",
    runId,
    role: "USER",
    accountType: "PROVIDER",
    passwordHash,
  });

  record(
    "إنشاء حسابات الاختبار",
    Boolean(admin.id && client.id && provider.id),
    `${client.email} / ${provider.email}`,
  );

  const job = await createJob(
    {
      title: `طلب اختبار E2E ${runId}`,
      description:
        "هذا طلب اختبار آلي للتأكد من دورة النشر والمراجعة والعروض والقبول والتقييم داخل أرزاق.",
      categoryId: category.id,
      region: "GAZA_CITY",
      workMode: "ONLINE",
      budget: "100₪",
      duration: "يومان",
      isUrgent: false,
    },
    client.id,
  );

  const createdJob = await prisma.jobPost.findUnique({
    where: { id: job.id },
    select: { status: true },
  });
  record("نشر طلب كصاحب طلب", createdJob?.status === "PENDING_REVIEW", createdJob?.status);

  const adminSummaryAfterJob = await getNavigationSummaryFresh(admin.id);
  record(
    "إشعار الأدمن بطلب جديد",
    adminSummaryAfterJob.unreadCount > 0,
    `${adminSummaryAfterJob.unreadCount} غير مقروء`,
  );

  await approveJobPost(job.id);
  const approvedJob = await prisma.jobPost.findUnique({
    where: { id: job.id },
    select: { status: true },
  });
  record("موافقة الأدمن على الطلب", approvedJob?.status === "OPEN", approvedJob?.status);

  const clientSummaryAfterApproval = await getNavigationSummaryFresh(client.id);
  record(
    "إشعار العميل باعتماد الطلب",
    clientSummaryAfterApproval.unreadCount > 0,
    `${clientSummaryAfterApproval.unreadCount} غير مقروء`,
  );

  const publicJobsAfterApproval = await getJobsWithFilters({ q: runId, pageSize: 20 });
  record(
    "ظهور الطلب في صفحة الطلبات العامة بعد الاعتماد",
    publicJobsAfterApproval.items.some((item) => item.id === job.id),
  );

  const offer = await createOffer(
    {
      jobPostId: job.id,
      message: "أستطيع تنفيذ هذا الطلب بجودة عالية ضمن المدة المطلوبة.",
      price: "90₪",
      duration: "يومان",
    },
    provider.id,
  );
  record("تقديم عرض من مقدم الخدمة", Boolean(offer.id), offer.id);

  const jobOffers = await getJobOffers(job.id, client.id);
  record(
    "ظهور العرض لصاحب الطلب",
    Boolean(jobOffers?.offers.some((item) => item.id === offer.id)),
    `${jobOffers?.offers.length ?? 0} عروض`,
  );

  await acceptOffer(offer.id, client.id);
  const acceptedState = await prisma.offer.findUnique({
    where: { id: offer.id },
    select: { status: true, jobPost: { select: { status: true } } },
  });
  record(
    "قبول العرض وإغلاق الطلب",
    acceptedState?.status === "ACCEPTED" && acceptedState.jobPost.status === "IN_PROGRESS",
    `${acceptedState?.status}/${acceptedState?.jobPost.status}`,
  );

  const providerSummaryAfterAccept = await getNavigationSummaryFresh(provider.id);
  record(
    "إشعار مقدم الخدمة بقبول العرض",
    providerSummaryAfterAccept.unreadCount > 0,
    `${providerSummaryAfterAccept.unreadCount} غير مقروء`,
  );

  const publicJobsAfterAccept = await getJobsWithFilters({ q: runId, pageSize: 20 });
  record(
    "اختفاء الطلب المغلق من صفحة الطلبات العامة",
    !publicJobsAfterAccept.items.some((item) => item.id === job.id),
  );

  const review = await createReview(
    {
      receiverId: provider.id,
      jobPostId: job.id,
      rating: 5,
      comment: "تجربة ممتازة ضمن اختبار E2E.",
    },
    client.id,
  );
  record("تقييم مقدم الخدمة", Boolean(review.id), review.id);

  const providerProfile = await prisma.profile.findUnique({
    where: { userId: provider.id },
    select: { avgRating: true, totalReviews: true },
  });
  record(
    "تحديث متوسط التقييم",
    providerProfile?.avgRating === 5 && providerProfile.totalReviews >= 1,
    `${providerProfile?.avgRating}/${providerProfile?.totalReviews}`,
  );

  let duplicateReviewBlocked = false;
  try {
    await createReview(
      {
        receiverId: provider.id,
        jobPostId: job.id,
        rating: 4,
        comment: "محاولة تكرار يجب رفضها.",
      },
      client.id,
    );
  } catch {
    duplicateReviewBlocked = true;
  }
  record("منع تكرار التقييم لنفس الطلب", duplicateReviewBlocked);

  const verificationSummary = await getProviderVerificationSummary(provider.id);
  record(
    "حساب تقدم التوثيق الرسمي",
    verificationSummary.acceptedOffers >= 1 && verificationSummary.remainingOffers === 4,
    `${verificationSummary.acceptedOffers}/5`,
  );

  const providerNotifications = await getUserNotifications(provider.id, "all");
  record(
    "تخزين إشعارات مقدم الخدمة",
    providerNotifications.totalCount >= 2,
    `${providerNotifications.totalCount} إشعارات`,
  );

  const failed = results.filter((item) => !item.ok);

  console.log("\nE2E credentials:");
  console.log(
    JSON.stringify(
      {
        password,
        admin: { email: admin.email, phone: admin.phone },
        client: { email: client.email, phone: client.phone },
        provider: { email: provider.email, phone: provider.phone },
      },
      null,
      2,
    ),
  );

  if (failed.length > 0) {
    throw new Error(`E2E failed: ${failed.map((item) => item.name).join(", ")}`);
  }
}

async function createTestUser({
  kind,
  runId,
  role,
  accountType,
  passwordHash,
}: {
  kind: "admin" | "client" | "provider";
  runId: string;
  role: "USER" | "ADMIN";
  accountType: "CLIENT" | "PROVIDER";
  passwordHash: string;
}) {
  const email = `e2e.${kind}.${runId}@arzaq.test`;
  const phoneSuffix = kind === "admin" ? "1" : kind === "client" ? "2" : "3";
  const phone = `059${runId.slice(-6)}${phoneSuffix}`;

  return prisma.user.create({
    data: {
      name:
        kind === "admin"
          ? "أدمن اختبار E2E"
          : kind === "client"
            ? "عميل اختبار E2E"
            : "مقدم خدمة اختبار E2E",
      email,
      phone,
      passwordHash,
      role,
      accountType,
      isVerified: true,
      profile: {
        create: {
          region: "GAZA_CITY",
          bio: kind === "provider" ? "مقدم خدمة لاختبار السيناريو الكامل." : "حساب اختبار.",
          whatsapp: "+970599000000",
          isTrusted: kind === "provider",
        },
      },
    },
    select: {
      id: true,
      email: true,
      phone: true,
    },
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

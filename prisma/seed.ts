import { JobStatus, OfferStatus, Region, UserRole, WorkMode } from "@prisma/client";
import { hash } from "bcryptjs";

import { prisma } from "../src/lib/prisma";

const categories = [
  { name: "رقمي", slug: "digital", icon: "💻", color: "#3b82f6" },
  { name: "تعليمي", slug: "education", icon: "📚", color: "#8b5cf6" },
  { name: "ميداني", slug: "field", icon: "🔧", color: "#f59e0b" },
  { name: "فرص يومية", slug: "daily", icon: "📋", color: "#ec4899" },
  { name: "عمل من البيت", slug: "remote", icon: "🏠", color: "#10b981" },
];

const skills = [
  "تصميم جرافيك",
  "برمجة",
  "إدخال بيانات",
  "Kobo Toolbox",
  "Excel",
  "لغة إنجليزية",
  "صيانة جوالات",
  "كهرباء",
  "سباكة",
  "تصوير",
  "تدريس",
  "كتابة محتوى",
  "ترجمة",
  "مونتاج",
];

const sampleUsers = [
  {
    id: "seed-user-sara",
    name: "سارة النجار",
    email: "sara@example.com",
    phone: "0599000101",
    region: Region.GAZA_CITY,
    whatsapp: "970599000101",
    bio: "مصممة واجهات وهوية بصرية للمشاريع الصغيرة.",
    isTrusted: true,
    skillNames: ["تصميم جرافيك", "كتابة محتوى", "تصوير"],
  },
  {
    id: "seed-user-ahmad",
    name: "أحمد أبو سالم",
    email: "ahmad@example.com",
    phone: "0599000102",
    region: Region.ONLINE,
    whatsapp: "970599000102",
    bio: "مطوّر ويب يبني صفحات عربية سريعة وخفيفة.",
    isTrusted: true,
    skillNames: ["برمجة", "Excel", "ترجمة"],
  },
  {
    id: "seed-user-lina",
    name: "لينا حماد",
    email: "lina@example.com",
    phone: "0599000103",
    region: Region.CENTRAL,
    whatsapp: "970599000103",
    bio: "متخصصة إدخال بيانات وتنظيف ملفات Excel وKobo.",
    isTrusted: true,
    skillNames: ["إدخال بيانات", "Kobo Toolbox", "Excel"],
  },
];

const jobPosts = [
  {
    id: "seed-job-landing-page",
    title: "تصميم صفحة هبوط لمحل مواد غذائية",
    description:
      "نحتاج صفحة هبوط عربية بسيطة تعرض المنتجات الأساسية وطرق التواصل عبر واتساب، مع اهتمام بسرعة التحميل.",
    budget: "150 - 250 شيكل",
    duration: "3 أيام",
    isUrgent: true,
    region: Region.GAZA_CITY,
    workMode: WorkMode.ONLINE,
    status: JobStatus.OPEN,
    authorId: "seed-user-lina",
    categorySlug: "digital",
  },
  {
    id: "seed-job-excel-cleanup",
    title: "تنظيم ملفات Excel لمبادرة مجتمعية",
    description: "مطلوب شخص يجيد Excel لترتيب بيانات مستفيدين وتنظيف التكرارات وتجهيز تقرير مختصر.",
    budget: "100 شيكل",
    duration: "يومين",
    isUrgent: false,
    region: Region.CENTRAL,
    workMode: WorkMode.BOTH,
    status: JobStatus.IN_PROGRESS,
    authorId: "seed-user-ahmad",
    categorySlug: "digital",
  },
  {
    id: "seed-job-electric-repair",
    title: "فني كهرباء لصيانة محل صغير",
    description: "نحتاج فني كهرباء يفحص تمديدات محل صغير ويصلح مشكلة انقطاع متكرر في الإضاءة.",
    budget: "حسب الاتفاق",
    duration: "نصف يوم",
    isUrgent: true,
    region: Region.KHAN_YOUNIS,
    workMode: WorkMode.FIELD,
    status: JobStatus.OPEN,
    authorId: "seed-user-sara",
    categorySlug: "field",
  },
  {
    id: "seed-job-field-survey",
    title: "مساعدة ميدانية لجمع بيانات استبيان",
    description: "مطلوب شخص لديه خبرة بسيطة في Kobo Toolbox لجمع بيانات ميدانية من 30 عينة.",
    budget: "120 شيكل",
    duration: "يوم واحد",
    isUrgent: false,
    region: Region.RAFAH,
    workMode: WorkMode.FIELD,
    status: JobStatus.OPEN,
    authorId: "seed-user-ahmad",
    categorySlug: "field",
  },
  {
    id: "seed-job-field-support",
    title: "مساعدة تنظيم فعالية تدريبية ليوم واحد",
    description: "مطلوب مساعدين لتسجيل الحضور وتنظيم القاعة لمدة 5 ساعات.",
    budget: "60 شيكل للفرد",
    duration: "5 ساعات",
    isUrgent: true,
    region: Region.CENTRAL,
    workMode: WorkMode.FIELD,
    status: JobStatus.OPEN,
    authorId: "seed-user-sara",
    categorySlug: "daily",
  },
  {
    id: "seed-job-content-entry",
    title: "إدخال محتوى منتجات على ملف منظم",
    description: "مطلوب إدخال أسماء وأسعار 80 منتجاً في ملف Excel مع مراجعة الأخطاء قبل التسليم.",
    budget: "80 شيكل",
    duration: "يوم واحد",
    isUrgent: false,
    region: Region.ONLINE,
    workMode: WorkMode.ONLINE,
    status: JobStatus.OPEN,
    authorId: "seed-user-sara",
    categorySlug: "daily",
  },
];

const offers = [
  {
    id: "seed-offer-landing-ahmad",
    jobPostId: "seed-job-landing-page",
    providerId: "seed-user-ahmad",
    status: OfferStatus.PENDING,
    message: "أقدر أبني صفحة هبوط عربية خفيفة خلال 3 أيام مع زر واتساب واضح.",
    price: "220 شيكل",
    duration: "3 أيام",
  },
  {
    id: "seed-offer-excel-lina",
    jobPostId: "seed-job-excel-cleanup",
    providerId: "seed-user-lina",
    status: OfferStatus.ACCEPTED,
    message: "أستطيع تنظيف الملف وترتيبه وإرسال تقرير مختصر بالأخطاء والتكرارات.",
    price: "100 شيكل",
    duration: "يومين",
  },
  {
    id: "seed-offer-survey-lina",
    jobPostId: "seed-job-field-survey",
    providerId: "seed-user-lina",
    status: OfferStatus.PENDING,
    message: "لدي خبرة في Kobo وجمع البيانات، ويمكنني تسليم النتائج بصيغة Excel.",
    price: "120 شيكل",
    duration: "يوم واحد",
  },
  {
    id: "seed-offer-content-ahmad",
    jobPostId: "seed-job-content-entry",
    providerId: "seed-user-ahmad",
    status: OfferStatus.PENDING,
    message: "أراجع البيانات قبل التسليم وأرتب الملف بطريقة سهلة للفرز والبحث.",
    price: "80 شيكل",
    duration: "يوم واحد",
  },
];

async function cleanupOldSeedData() {
  await prisma.jobPost.deleteMany({
    where: {
      id: {
        in: ["seed-job-english-tutor"],
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      id: {
        in: ["seed-user-yousef"],
      },
    },
  });
}

async function upsertCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
}

async function upsertSkills() {
  for (const name of skills) {
    const slug = slugify(name);

    await prisma.skill.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
  }
}

async function upsertUsers(passwordHash: string) {
  const admin = await prisma.user.upsert({
    where: { email: "admin@arzaq.local" },
    update: {
      name: "مدير أرزاق",
      phone: "0599000000",
      role: UserRole.ADMIN,
      isVerified: true,
    },
    create: {
      id: "seed-admin",
      name: "مدير أرزاق",
      email: "admin@arzaq.local",
      phone: "0599000000",
      passwordHash,
      role: UserRole.ADMIN,
      isVerified: true,
    },
  });

  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {
      region: Region.ONLINE,
      whatsapp: "970599000000",
      bio: "حساب إدارة المنصة للاختبار المحلي.",
      isTrusted: true,
    },
    create: {
      userId: admin.id,
      region: Region.ONLINE,
      whatsapp: "970599000000",
      bio: "حساب إدارة المنصة للاختبار المحلي.",
      isTrusted: true,
    },
  });

  for (const user of sampleUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        phone: user.phone,
        isVerified: true,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        passwordHash,
        isVerified: true,
      },
    });

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        bio: user.bio,
        region: user.region,
        whatsapp: user.whatsapp,
        isTrusted: user.isTrusted,
        avgRating: user.isTrusted ? 4.8 : 4.4,
        totalReviews: user.isTrusted ? 8 : 3,
      },
      create: {
        userId: user.id,
        bio: user.bio,
        region: user.region,
        whatsapp: user.whatsapp,
        isTrusted: user.isTrusted,
        avgRating: user.isTrusted ? 4.8 : 4.4,
        totalReviews: user.isTrusted ? 8 : 3,
      },
    });

    await prisma.profileSkill.deleteMany({
      where: { profileId: profile.id },
    });

    const profileSkills = await Promise.all(
      user.skillNames.map(async (skillName) => {
        const skill = await prisma.skill.findUniqueOrThrow({
          where: { slug: slugify(skillName) },
        });

        return {
          profileId: profile.id,
          skillId: skill.id,
        };
      }),
    );

    await prisma.profileSkill.createMany({
      data: profileSkills,
      skipDuplicates: true,
    });
  }
}

async function upsertJobs() {
  for (const jobPost of jobPosts) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: jobPost.categorySlug },
    });

    await prisma.jobPost.upsert({
      where: { id: jobPost.id },
      update: {
        title: jobPost.title,
        description: jobPost.description,
        budget: jobPost.budget,
        duration: jobPost.duration,
        isUrgent: jobPost.isUrgent,
        region: jobPost.region,
        workMode: jobPost.workMode,
        status: jobPost.status,
        authorId: jobPost.authorId,
        categoryId: category.id,
        deletedAt: null,
      },
      create: {
        id: jobPost.id,
        title: jobPost.title,
        description: jobPost.description,
        budget: jobPost.budget,
        duration: jobPost.duration,
        isUrgent: jobPost.isUrgent,
        region: jobPost.region,
        workMode: jobPost.workMode,
        status: jobPost.status,
        authorId: jobPost.authorId,
        categoryId: category.id,
      },
    });
  }
}

async function upsertOffers() {
  for (const offer of offers) {
    await prisma.offer.upsert({
      where: {
        jobPostId_providerId: {
          jobPostId: offer.jobPostId,
          providerId: offer.providerId,
        },
      },
      update: {
        status: offer.status,
        message: offer.message,
        price: offer.price,
        duration: offer.duration,
      },
      create: offer,
    });
  }
}

async function upsertRelatedSampleData() {
  await prisma.savedJob.upsert({
    where: {
      userId_jobPostId: {
        userId: "seed-user-sara",
        jobPostId: "seed-job-excel-cleanup",
      },
    },
    update: {},
    create: {
      userId: "seed-user-sara",
      jobPostId: "seed-job-excel-cleanup",
    },
  });

  await prisma.review.upsert({
    where: { id: "seed-review-sara" },
    update: {
      rating: 5,
      comment: "التواصل ممتاز والتسليم كان مرتبًا وواضحًا.",
    },
    create: {
      id: "seed-review-sara",
      rating: 5,
      comment: "التواصل ممتاز والتسليم كان مرتبًا وواضحًا.",
      giverId: "seed-user-lina",
      receiverId: "seed-user-sara",
      jobPostId: "seed-job-field-support",
    },
  });

  await prisma.portfolioItem.upsert({
    where: { id: "seed-portfolio-sara-identity" },
    update: {
      title: "هوية بصرية لمبادرة محلية",
      imageUrl:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
      description: "تصميم بطاقات نشر ولوحة ألوان عربية لمبادرة تعليمية.",
    },
    create: {
      id: "seed-portfolio-sara-identity",
      title: "هوية بصرية لمبادرة محلية",
      imageUrl:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
      description: "تصميم بطاقات نشر ولوحة ألوان عربية لمبادرة تعليمية.",
      profile: {
        connect: { userId: "seed-user-sara" },
      },
    },
  });

  await prisma.report.upsert({
    where: { id: "seed-report-job" },
    update: {
      reason: "بلاغ تجريبي على طلب يحتاج مراجعة إدارية.",
      targetId: "seed-job-field-support",
      jobPostId: "seed-job-field-support",
    },
    create: {
      id: "seed-report-job",
      reason: "بلاغ تجريبي على طلب يحتاج مراجعة إدارية.",
      targetType: "JOB_POST",
      targetId: "seed-job-field-support",
      jobPostId: "seed-job-field-support",
      reporterId: "seed-user-sara",
    },
  });

  await prisma.notification.upsert({
    where: { id: "seed-notification-admin" },
    update: {
      message: "تم تجهيز بيانات أرزاق التجريبية بنجاح.",
      isRead: false,
    },
    create: {
      id: "seed-notification-admin",
      type: "SYSTEM",
      message: "تم تجهيز بيانات أرزاق التجريبية بنجاح.",
      link: "/admin",
      userId: "seed-admin",
    },
  });
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "");
}

async function main() {
  const passwordHash = await hash("Arzaq12345!", 12);

  await cleanupOldSeedData();
  await upsertCategories();
  await upsertSkills();
  await upsertUsers(passwordHash);
  await upsertJobs();
  await upsertOffers();
  await upsertRelatedSampleData();

  console.log("تم تجهيز بيانات أرزاق التجريبية بنجاح.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

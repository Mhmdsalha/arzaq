import { PrismaClient, Region, UserRole, WorkMode } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "رقمي", slug: "digital", icon: "MonitorSmartphone", color: "#16a34a" },
  { name: "تعليمي", slug: "education", icon: "GraduationCap", color: "#2563eb" },
  { name: "ميداني", slug: "field", icon: "MapPinned", color: "#ea580c" },
  { name: "فرص يومية", slug: "daily", icon: "BriefcaseBusiness", color: "#d97706" },
  { name: "عمل من البيت", slug: "remote", icon: "Home", color: "#7c3aed" },
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
    skillNames: ["تصميم جرافيك", "كتابة محتوى"],
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
    skillNames: ["برمجة", "Excel"],
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
  {
    id: "seed-user-yousef",
    name: "يوسف برهوم",
    email: "yousef@example.com",
    phone: "0599000104",
    region: Region.KHAN_YOUNIS,
    whatsapp: "970599000104",
    bio: "فني كهرباء وصيانة ميدانية للمنازل والمحال.",
    isTrusted: false,
    skillNames: ["كهرباء", "صيانة جوالات"],
  },
];

const jobPosts = [
  {
    id: "seed-job-landing-page",
    title: "تصميم صفحة هبوط لمحل مواد غذائية",
    description:
      "نحتاج صفحة هبوط عربية بسيطة تعرض المنتجات الأساسية وطرق التواصل عبر واتساب، مع اهتمام بسرعة التحميل.",
    budget: "150 - 250 شيكل",
    isUrgent: true,
    region: Region.GAZA_CITY,
    workMode: WorkMode.ONLINE,
    authorId: "seed-user-lina",
    categorySlug: "digital",
  },
  {
    id: "seed-job-excel-cleanup",
    title: "تنظيم ملفات Excel لمبادرة مجتمعية",
    description: "مطلوب شخص يجيد Excel لترتيب بيانات مستفيدين وتنظيف التكرارات وتجهيز تقرير مختصر.",
    budget: "100 شيكل",
    isUrgent: false,
    region: Region.CENTRAL,
    workMode: WorkMode.BOTH,
    authorId: "seed-user-ahmad",
    categorySlug: "digital",
  },
  {
    id: "seed-job-english-tutor",
    title: "مدرس/ة لغة إنجليزية لطالب توجيهي",
    description: "مطلوب متابعة أسبوعية لطالب توجيهي، شرح قواعد ومحادثة وحل نماذج امتحانات.",
    budget: "حسب الاتفاق",
    isUrgent: false,
    region: Region.KHAN_YOUNIS,
    workMode: WorkMode.FIELD,
    authorId: "seed-user-sara",
    categorySlug: "education",
  },
  {
    id: "seed-job-field-support",
    title: "مساعدة تنظيم فعالية تدريبية ليوم واحد",
    description: "مطلوب مساعدين لتسجيل الحضور وتنظيم القاعة لمدة 5 ساعات.",
    budget: "60 شيكل للفرد",
    isUrgent: true,
    region: Region.CENTRAL,
    workMode: WorkMode.FIELD,
    authorId: "seed-user-yousef",
    categorySlug: "daily",
  },
];

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
    await prisma.skill.upsert({
      where: { slug: slugify(name) },
      update: { name },
      create: { name, slug: slugify(name) },
    });
  }
}

async function upsertUsers(passwordHash: string) {
  const admin = await prisma.user.upsert({
    where: { email: "admin@arzaq.local" },
    update: {
      name: "مدير أرزاق",
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
      profile: {
        create: {
          region: Region.ONLINE,
          whatsapp: "970599000000",
          bio: "حساب إدارة المنصة للاختبار المحلي.",
          isTrusted: true,
        },
      },
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
        isUrgent: jobPost.isUrgent,
        region: jobPost.region,
        workMode: jobPost.workMode,
        categoryId: category.id,
      },
      create: {
        id: jobPost.id,
        title: jobPost.title,
        description: jobPost.description,
        budget: jobPost.budget,
        isUrgent: jobPost.isUrgent,
        region: jobPost.region,
        workMode: jobPost.workMode,
        authorId: jobPost.authorId,
        categoryId: category.id,
      },
    });
  }
}

async function upsertRelatedSampleData() {
  await prisma.offer.upsert({
    where: {
      jobPostId_providerId: {
        jobPostId: "seed-job-landing-page",
        providerId: "seed-user-ahmad",
      },
    },
    update: {
      message: "أقدر أبني صفحة هبوط عربية خفيفة خلال 3 أيام مع زر واتساب واضح.",
      price: "220 شيكل",
      duration: "3 أيام",
    },
    create: {
      id: "seed-offer-landing-ahmad",
      jobPostId: "seed-job-landing-page",
      providerId: "seed-user-ahmad",
      message: "أقدر أبني صفحة هبوط عربية خفيفة خلال 3 أيام مع زر واتساب واضح.",
      price: "220 شيكل",
      duration: "3 أيام",
    },
  });

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
      jobPostId: "seed-job-english-tutor",
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
      message: "تم تجهيز بيانات Phase 2 التجريبية بنجاح.",
      isRead: false,
    },
    create: {
      id: "seed-notification-admin",
      type: "SYSTEM",
      message: "تم تجهيز بيانات Phase 2 التجريبية بنجاح.",
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

  await upsertCategories();
  await upsertSkills();
  await upsertUsers(passwordHash);
  await upsertJobs();
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

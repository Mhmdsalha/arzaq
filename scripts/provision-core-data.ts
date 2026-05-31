import { AccountType, PrismaClient, Region, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "رقمي", slug: "digital", icon: "MonitorSmartphone", color: "bg-blue-100 text-blue-700" },
  { name: "تعليمي", slug: "education", icon: "GraduationCap", color: "bg-violet-100 text-violet-700" },
  { name: "ميداني", slug: "field", icon: "MapPinned", color: "bg-amber-100 text-amber-700" },
  { name: "فرص يومية", slug: "daily", icon: "BriefcaseBusiness", color: "bg-pink-100 text-pink-700" },
  { name: "عمل من البيت", slug: "remote", icon: "Home", color: "bg-emerald-100 text-emerald-700" },
];

const skills = [
  "تصميم جرافيك",
  "تصميم شعارات وهوية بصرية",
  "تصميم سوشيال ميديا",
  "تصميم واجهات UI UX",
  "برمجة",
  "تطوير مواقع",
  "تطوير تطبيقات موبايل",
  "تطوير ووردبريس",
  "تطوير متاجر إلكترونية",
  "إدارة قواعد بيانات",
  "تحليل بيانات",
  "إدخال بيانات",
  "Kobo Toolbox",
  "Excel",
  "Google Sheets",
  "Power BI",
  "إدارة مشاريع",
  "مساعد افتراضي",
  "خدمة عملاء",
  "لغة إنجليزية",
  "لغة عربية",
  "لغة عبرية",
  "صيانة جوالات",
  "صيانة حواسيب",
  "شبكات وإنترنت",
  "كهرباء",
  "سباكة",
  "نجارة",
  "دهان",
  "تبليط",
  "ألمنيوم",
  "حدادة",
  "طاقة شمسية",
  "تصوير",
  "تصوير منتجات",
  "تصوير فيديو",
  "تدريس",
  "تدريس رياضيات",
  "تدريس علوم",
  "تدريس لغة إنجليزية",
  "كتابة محتوى",
  "تدقيق لغوي",
  "إدارة صفحات التواصل",
  "تسويق إلكتروني",
  "إعلانات ممولة",
  "تحسين محركات البحث SEO",
  "ترجمة",
  "مونتاج",
  "تعليق صوتي",
  "موشن جرافيك",
  "رسم رقمي",
  "طباعة وتنسيق ملفات",
  "إعداد عروض تقديمية",
  "بحث ميداني",
  "جمع بيانات",
  "تنظيم فعاليات",
  "توصيل ومشاوير",
  "تحميل وتنزيل",
  "عمالة يومية",
  "تنظيف",
  "طبخ منزلي",
  "خياطة",
  "تجميل وعناية",
  "تمريض منزلي",
  "رعاية أطفال",
  "محاسبة",
  "استشارات قانونية",
  "استشارات أعمال",
];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "");
}

async function provisionReferenceData() {
  const jobsCount = await prisma.jobPost.count();

  if (jobsCount === 0) {
    await prisma.profileSkill.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.category.deleteMany();
  }

  for (const category of categories) {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ slug: category.slug }, { name: category.name }],
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.category.update({ where: { id: existing.id }, data: category });
    } else {
      await prisma.category.create({ data: category });
    }
  }

  for (const name of skills) {
    const slug = slugify(name);
    const existing = await prisma.skill.findFirst({
      where: {
        OR: [{ slug }, { name }],
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.skill.update({ where: { id: existing.id }, data: { name, slug } });
    } else {
      await prisma.skill.create({ data: { name, slug } });
    }
  }
}

async function provisionAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }

  const adminPhone = process.env.ADMIN_PHONE ?? "0599000000";
  const passwordHash = await hash(adminPassword, 12);
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [{ email: adminEmail }, { phone: adminPhone }],
    },
    select: { id: true },
  });

  const adminData = {
    name: "مدير أرزاق",
    email: adminEmail,
    phone: adminPhone,
    passwordHash,
    role: UserRole.ADMIN,
    accountType: AccountType.CLIENT,
    isVerified: true,
    isBanned: false,
    deletedAt: null,
  };

  const admin = existingAdmin
    ? await prisma.user.update({ where: { id: existingAdmin.id }, data: adminData })
    : await prisma.user.create({ data: adminData });

  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {
      region: Region.ONLINE,
      title: "إدارة المنصة",
      bio: "حساب إدارة منصة أرزاق.",
      whatsapp: null,
      showWhatsapp: false,
      isTrusted: true,
      isAvailable: false,
    },
    create: {
      userId: admin.id,
      region: Region.ONLINE,
      title: "إدارة المنصة",
      bio: "حساب إدارة منصة أرزاق.",
      isTrusted: true,
      isAvailable: false,
    },
  });

  return adminEmail;
}

async function main() {
  await provisionReferenceData();
  const adminEmail = await provisionAdmin();
  const [users, admins, categoryCount, skillCount, jobs] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { role: UserRole.ADMIN } }),
    prisma.category.count(),
    prisma.skill.count(),
    prisma.jobPost.count(),
  ]);

  console.log(
    JSON.stringify(
      {
        ok: true,
        adminEmail,
        counts: {
          users,
          admins,
          categories: categoryCount,
          skills: skillCount,
          jobs,
        },
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

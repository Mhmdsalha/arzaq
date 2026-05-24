import { AccountType, Region, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

import { prisma } from "../src/lib/prisma";

const categories = [
  { name: "رقمي", slug: "digital", icon: "MonitorSmartphone", color: "bg-blue-100 text-blue-700" },
  {
    name: "تعليمي",
    slug: "education",
    icon: "GraduationCap",
    color: "bg-violet-100 text-violet-700",
  },
  { name: "ميداني", slug: "field", icon: "MapPinned", color: "bg-amber-100 text-amber-700" },
  {
    name: "فرص يومية",
    slug: "daily",
    icon: "BriefcaseBusiness",
    color: "bg-pink-100 text-pink-700",
  },
  { name: "عمل من البيت", slug: "remote", icon: "Home", color: "bg-emerald-100 text-emerald-700" },
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

async function upsertAdmin() {
  const passwordHash = await hash("Arzaq12345!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@arzaq.local" },
    update: {
      name: "مدير أرزاق",
      phone: "0599000000",
      role: UserRole.ADMIN,
      accountType: AccountType.CLIENT,
      isVerified: true,
    },
    create: {
      id: "seed-admin",
      name: "مدير أرزاق",
      email: "admin@arzaq.local",
      phone: "0599000000",
      passwordHash,
      role: UserRole.ADMIN,
      accountType: AccountType.CLIENT,
      isVerified: true,
    },
  });

  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {
      region: Region.ONLINE,
      whatsapp: "970599000000",
      bio: "حساب إدارة المنصة.",
      isTrusted: true,
      isAvailable: false,
    },
    create: {
      userId: admin.id,
      region: Region.ONLINE,
      whatsapp: "970599000000",
      bio: "حساب إدارة المنصة.",
      isTrusted: true,
      isAvailable: false,
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
  await upsertCategories();
  await upsertSkills();
  await upsertAdmin();

  console.log("تم تجهيز البيانات الأساسية فقط: التصنيفات، المهارات، وحساب المدير.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

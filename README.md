# أرزاق

منصة عربية محلية لربط أصحاب الطلبات بمقدمي الخدمات في غزة.

## Phase 0

تم تجهيز أساس المشروع باستخدام Next.js 16، TypeScript، Tailwind CSS v3، shadcn/ui،
Prisma، PostgreSQL، NextAuth v5، وواجهة RTL عربية.

## Cloud Architecture

- التطبيق: Vercel Free/Hobby
- قاعدة البيانات: Neon PostgreSQL Free
- الصور والملفات: Supabase Storage Free
- DNS/CDN والحماية: Cloudflare Free

مع Neon نستخدم رابطين:

- `DATABASE_URL`: رابط pooled للتطبيق في Vercel.
- `DATABASE_URL_UNPOOLED`: رابط direct لتشغيل Prisma migrations.

```bash
npm install
npm run dev
```

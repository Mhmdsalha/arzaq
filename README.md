# أرزاق | Arzaq

منصة عربية RTL محلية تربط أصحاب الطلبات بمقدمي الخدمات في غزة. تساعد المنصة المستخدمين على نشر طلبات عمل وخدمات، استقبال العروض، بناء ملفات مهنية موثوقة، وإتمام التواصل خارجياً عبر واتساب وفق ضوابط الخصوصية.

> الحالة الحالية: نسخة تطوير متقدمة قيد التجهيز للإطلاق التجريبي.

## فكرة النظام

أرزاق مصممة كسوق خدمات محلي خفيف وسريع يخدم:

- أصحاب الطلبات: أفراد، محلات صغيرة، مؤسسات وفرق تحتاج خدمة أو عامل.
- مقدمي الخدمات: مصممون، مطورون، مدرسون، مدخلو بيانات، فنيون ومهارات محلية.
- الشباب والخريجون: لبناء بروفايل مهني والحصول على فرص حقيقية.

## أهم المزايا

- تسجيل حساب بنوعين: صاحب طلب أو مقدم خدمة.
- تسجيل دخول بالبريد الإلكتروني أو رقم الجوال.
- توثيق البريد الإلكتروني عبر رمز رسمي.
- نشر الطلبات مع مراجعة إدارية قبل الظهور العام.
- حالات واضحة للطلبات: قيد المراجعة، يحتاج تعديل، مفتوح، مغلق.
- تقديم العروض من مقدمي الخدمات فقط.
- قبول عرض واحد وإغلاق الطلب تلقائياً.
- حماية خصوصية صاحب الطلب: لا يظهر واتساب صاحب الطلب إلا لمقدم الخدمة المقبول.
- تحكم مقدم الخدمة في إظهار أو إخفاء زر واتساب في ملفه العام.
- ملفات عامة لمقدمي الخدمات تشمل المهارات، التقييمات، روابط الأعمال، ومؤشر التوثيق.
- نظام تقييم بالنجوم بعد إتمام العمل.
- إشعارات داخلية، مع تحسينات real-time تدريجية.
- لوحة إدارة لمراجعة الطلبات، المستخدمين، التوثيق والبلاغات.
- رفع صور آمن إلى Cloudflare R2 مع قيود حجم ونوع الملف.
- واجهة عربية RTL، mobile-first، ومتوافقة مع الأجهزة الضعيفة نسبياً.

## الستاك التقني

| الطبقة         | التقنية                                                |
| -------------- | ------------------------------------------------------ |
| Framework      | Next.js 16 App Router                                  |
| Language       | TypeScript Strict                                      |
| UI             | Tailwind CSS v3 + shadcn/ui                            |
| Direction      | Arabic RTL-first                                       |
| Forms          | React Hook Form + Zod                                  |
| Auth           | NextAuth.js v5 Credentials + JWT                       |
| ORM            | Prisma                                                 |
| Database       | Neon PostgreSQL                                        |
| Storage        | Cloudflare R2                                          |
| Email          | Gmail SMTP للتطوير + Resend جاهز للإنتاج عند ربط دومين |
| Rate limiting  | Upstash Redis                                          |
| Icons          | Lucide React                                           |
| Toasts         | Sonner                                                 |
| Image handling | browser-image-compression + server-side upload checks  |

## المعمارية

```text
src/
  app/                 صفحات App Router، API routes، layouts
  actions/             Server Actions للعمليات الحساسة
  services/            طبقة الأعمال والوصول إلى Prisma
  components/          مكونات UI منظمة حسب المجال
  lib/                 auth, prisma, security, email, uploads
  schemas/             Zod validation schemas
  constants/           إعدادات ثابتة وروابط وتسميات
  hooks/               hooks للواجهة
  types/               أنواع TypeScript المشتركة
  mock/                بيانات واجهة احتياطية/قديمة
  providers/           React providers
  styles/              CSS عام وخطوط
```

قواعد مهمة في المشروع:

- Prisma يستخدم داخل `services/` أو API/server code فقط.
- جميع التعديلات الحساسة تمر عبر Server Actions.
- التحقق يتم عبر Zod ثم sanitization ثم تنفيذ العملية.
- Client Components تستخدم فقط عند الحاجة للتفاعل أو hooks أو browser APIs.
- لا يتم عرض بيانات حساسة مثل `passwordHash` أو أرقام التواصل الخاصة إلا وفق الصلاحيات.

## التشغيل المحلي

### 1. تثبيت الحزم

```bash
npm install
```

### 2. إعداد متغيرات البيئة

انسخ الملف:

```bash
cp .env.example .env
```

ثم املأ القيم المطلوبة. أهم القيم:

```env
DATABASE_URL=""
DATABASE_URL_UNPOOLED=""
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

CLOUDFLARE_ACCOUNT_ID=""
CLOUDFLARE_R2_ACCESS_KEY_ID=""
CLOUDFLARE_R2_SECRET_ACCESS_KEY=""
CLOUDFLARE_R2_BUCKET_NAME=""
CLOUDFLARE_R2_PUBLIC_URL=""
NEXT_PUBLIC_R2_PUBLIC_URL=""

EMAIL_PROVIDER="smtp"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASSWORD=""
EMAIL_FROM="Arzaq <your-email@gmail.com>"
```

ملاحظة: لا تستخدم كلمة مرور Gmail العادية. استخدم Gmail App Password.

### 3. تجهيز قاعدة البيانات

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. تشغيل بيئة التطوير

```bash
npm run dev
```

افتح:

```text
http://localhost:3000
```

## أوامر مفيدة

```bash
npm run dev                 # تشغيل Next.js مع Turbopack
npm run build               # بناء production
npm run lint                # فحص ESLint
npm run format              # تنسيق الملفات
npm run db:studio           # فتح Prisma Studio
npm run db:migrate          # Migration في التطوير
npm run db:deploy           # تطبيق migrations في الإنتاج
npm run test:e2e:smoke      # اختبار سيناريو أساسي كامل
npm run security:audit      # فحص npm audit
```

## الاختبارات والتحقق

قبل أي نشر:

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run test:e2e:smoke
npm run security:audit
```

يوجد تحذير معروف حالياً من `npm audit` مرتبط بتبعية داخل `next-auth@5 beta` و `nodemailer`. لا يتم استخدام المدخلات التي تستغل التحذير داخل كود أرزاق، ولا نستخدم `npm audit fix --force` لأنه يكسر NextAuth v5 ويعيد المشروع لمسار غير متوافق.

## الأمان

النظام يحتوي على طبقات حماية أساسية:

- Headers أمنية في `next.config.ts`.
- CSRF protection للـ API routes الحساسة.
- Rate limiting عبر Upstash.
- Password hashing باستخدام bcryptjs.
- Zod validation لجميع النماذج المهمة.
- Input sanitization للنصوص والروابط وأرقام الجوال.
- تحقق صلاحيات server-side وليس عبر الواجهة فقط.
- منع نشر الطلبات من مقدمي الخدمة ومنع تقديم العروض من أصحاب الطلبات.
- إخفاء بيانات التواصل الخاصة حسب قواعد الخصوصية.
- Audit logging للأحداث الحساسة.
- قيود رفع الصور: نوع، حجم، واسم ملف آمن.

راجع [SECURITY.md](./SECURITY.md) لتفاصيل أكبر.

## الإطلاق المقترح

الاستضافة المقترحة:

- App: Vercel
- Database: Neon PostgreSQL
- Storage: Cloudflare R2
- Redis: Upstash
- Email: Gmail SMTP للتطوير، Resend أو بريد دومين رسمي للإنتاج
- DNS/CDN: Cloudflare

راجع [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) قبل أي إطلاق.

## خارطة التطوير القريبة

- تحسين real-time notifications.
- تحسين infinite scroll وoptimistic UI في صفحات الطلبات.
- تحويل إحصائيات الهيرو لاحقاً إلى بيانات فعلية أو أهداف معلنة.
- تحسين لوحة الإدارة وتحليلات الاستخدام.
- ربط دومين رسمي للبريد وتفعيل Resend للإنتاج.
- إضافة مراجعات جودة يدوية قبل الإطلاق العام.

## الترخيص

هذا المشروع خاص حالياً. جميع الحقوق محفوظة لفريق أرزاق.

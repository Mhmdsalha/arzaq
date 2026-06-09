import type { ProviderProfile } from "@/types/marketplace";

export const providers: ProviderProfile[] = [
  {
    id: "provider-sara-design",
    name: "سارة النجار",
    title: "مصممة واجهات وهوية بصرية",
    bio: "أصمم واجهات عربية خفيفة وهوية بصرية للمشاريع الصغيرة، مع اهتمام بتجربة المستخدم على الجوال.",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    region: "GAZA_CITY",
    categorySlugs: ["digital", "creative"],
    skills: ["UI/UX", "هوية بصرية", "Figma", "تصميم سوشيال"],
    rating: 4.9,
    reviewsCount: 18,
    completedJobs: 31,
    isTrusted: true,
    storePlan: "GAZA",
    whatsapp: "970599100101",
    portfolio: [
      {
        id: "sara-1",
        title: "واجهة متجر محلي",
        imageUrl:
          "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=900&q=80",
        description: "تصميم صفحة هبوط عربية لمتجر مواد غذائية.",
      },
      {
        id: "sara-2",
        title: "هوية مبادرة تعليمية",
        imageUrl:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
        description: "نظام ألوان وبطاقات نشر لمبادرة تدريب.",
      },
    ],
    reviews: [
      {
        id: "review-sara-1",
        giverName: "مركز بداية",
        rating: 5,
        comment: "التسليم كان سريع والملفات مرتبة جدًا.",
        createdAt: "2026-05-10",
      },
    ],
  },
  {
    id: "provider-ahmad-dev",
    name: "أحمد أبو سالم",
    title: "مطوّر ويب Next.js",
    bio: "أبني صفحات ومواقع سريعة بالعربية، وأهتم بالأداء وتجربة المستخدم والربط مع واتساب.",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    region: "ONLINE",
    categorySlugs: ["digital", "remote"],
    skills: ["Next.js", "TypeScript", "Tailwind", "SEO"],
    rating: 4.8,
    reviewsCount: 14,
    completedJobs: 24,
    isTrusted: true,
    storePlan: "GAZA",
    whatsapp: "970599100102",
    portfolio: [
      {
        id: "ahmad-1",
        title: "موقع خدمات صغير",
        imageUrl:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
        description: "موقع تعريفي سريع لمكتب خدمات محلي.",
      },
    ],
    reviews: [
      {
        id: "review-ahmad-1",
        giverName: "بقالة البركة",
        rating: 5,
        comment: "ممتاز في التواصل والتعديلات.",
        createdAt: "2026-05-12",
      },
    ],
  },
  {
    id: "provider-lina-data",
    name: "لينا حماد",
    title: "إدخال بيانات وتحليل Excel",
    bio: "خبرة في تنظيف ملفات Excel وGoogle Sheets وتجهيز تقارير مختصرة وواضحة للفرق الميدانية.",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    region: "CENTRAL",
    categorySlugs: ["digital", "remote"],
    skills: ["Excel", "Google Sheets", "Kobo Toolbox", "تنظيف بيانات"],
    rating: 4.7,
    reviewsCount: 11,
    completedJobs: 19,
    isTrusted: true,
    storePlan: "GAZA",
    whatsapp: "970599100103",
    portfolio: [
      {
        id: "lina-1",
        title: "لوحة متابعة Excel",
        imageUrl:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
        description: "تنظيم بيانات مستفيدين لمبادرة مجتمعية.",
      },
    ],
    reviews: [
      {
        id: "review-lina-1",
        giverName: "مبادرة عون",
        rating: 5,
        comment: "دقيقة ومنظمة وملتزمة بالموعد.",
        createdAt: "2026-05-09",
      },
    ],
  },
  {
    id: "provider-yousef-electric",
    name: "يوسف برهوم",
    title: "فني كهرباء وصيانة",
    bio: "أوفر زيارات ميدانية للصيانة والتركيب وفحص الأعطال للمنازل والمحال الصغيرة.",
    avatarUrl:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80",
    region: "KHAN_YOUNIS",
    categorySlugs: ["field", "daily"],
    skills: ["كهرباء", "تركيب إنارة", "صيانة", "معاينة"],
    rating: 4.6,
    reviewsCount: 9,
    completedJobs: 22,
    isTrusted: false,
    storePlan: "GAZA",
    whatsapp: "970599100104",
    portfolio: [
      {
        id: "yousef-1",
        title: "تركيب إنارة محل",
        imageUrl:
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80",
        description: "تركيب وفحص لوحة كهرباء لمحل صغير.",
      },
    ],
    reviews: [
      {
        id: "review-yousef-1",
        giverName: "معرض النور",
        rating: 4,
        comment: "العمل جيد والتكلفة واضحة.",
        createdAt: "2026-05-07",
      },
    ],
  },
  {
    id: "provider-mariam-teacher",
    name: "مريم الشاعر",
    title: "مدرسة لغة إنجليزية",
    bio: "متابعة طلاب المدارس والتوجيهي، محادثة وقواعد وحل نماذج بطريقة مبسطة.",
    avatarUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80",
    region: "RAFAH",
    categorySlugs: ["education"],
    skills: ["لغة إنجليزية", "توجيهي", "محادثة", "تأسيس"],
    rating: 4.9,
    reviewsCount: 23,
    completedJobs: 38,
    isTrusted: true,
    storePlan: "GAZA",
    whatsapp: "970599100105",
    portfolio: [
      {
        id: "mariam-1",
        title: "خطة متابعة شهرية",
        imageUrl:
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
        description: "خطة دروس ومراجعات لطالب توجيهي.",
      },
    ],
    reviews: [
      {
        id: "review-mariam-1",
        giverName: "أم محمد",
        rating: 5,
        comment: "شرحها واضح ومتابعتها ممتازة.",
        createdAt: "2026-05-11",
      },
    ],
  },
  {
    id: "provider-omar-photo",
    name: "عمر المصري",
    title: "مصور منتجات ومونتير",
    bio: "تصوير منتجات للمشاريع المنزلية ومونتاج فيديوهات قصيرة للنشر على السوشيال.",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    region: "NORTH_GAZA",
    categorySlugs: ["creative", "field"],
    skills: ["تصوير منتجات", "مونتاج", "Reels", "إضاءة"],
    rating: 4.5,
    reviewsCount: 8,
    completedJobs: 16,
    isTrusted: false,
    storePlan: "GAZA",
    whatsapp: "970599100106",
    portfolio: [
      {
        id: "omar-1",
        title: "تصوير منتجات منزلية",
        imageUrl:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
        description: "صور منتجات بخلفية نظيفة وإضاءة طبيعية.",
      },
    ],
    reviews: [
      {
        id: "review-omar-1",
        giverName: "مشروع بيتنا",
        rating: 4,
        comment: "صور جميلة ومناسبة للنشر.",
        createdAt: "2026-05-06",
      },
    ],
  },
  {
    id: "provider-huda-content",
    name: "هدى رضوان",
    title: "كاتبة محتوى ومترجمة",
    bio: "أكتب محتوى عربي واضح وأترجم نصوصًا إنسانية وتعليمية مع تحرير لغوي مناسب للجمهور المحلي.",
    avatarUrl:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80",
    region: "ONLINE",
    categorySlugs: ["creative", "remote"],
    skills: ["كتابة محتوى", "ترجمة", "تحرير", "سوشيال ميديا"],
    rating: 4.8,
    reviewsCount: 13,
    completedJobs: 20,
    isTrusted: true,
    storePlan: "GAZA",
    whatsapp: "970599100107",
    portfolio: [
      {
        id: "huda-1",
        title: "حملة منشورات تعليمية",
        imageUrl:
          "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
        description: "صياغة منشورات قصيرة لمنصة تدريب.",
      },
    ],
    reviews: [
      {
        id: "review-huda-1",
        giverName: "مساحة تعلم",
        rating: 5,
        comment: "لغة ممتازة وسرعة في التسليم.",
        createdAt: "2026-05-08",
      },
    ],
  },
  {
    id: "provider-samir-plumber",
    name: "سمير أبو عودة",
    title: "فني سباكة وصيانة منزلية",
    bio: "زيارات ميدانية للسباكة والصيانة المنزلية الخفيفة مع تسعير واضح قبل التنفيذ.",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    region: "GAZA_CITY",
    categorySlugs: ["field", "daily"],
    skills: ["سباكة", "صيانة منزلية", "تركيب", "معاينة"],
    rating: 4.4,
    reviewsCount: 7,
    completedJobs: 15,
    isTrusted: false,
    storePlan: "GAZA",
    whatsapp: "970599100108",
    portfolio: [
      {
        id: "samir-1",
        title: "صيانة منزلية",
        imageUrl:
          "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
        description: "إصلاحات منزلية خفيفة وتركيب قطع.",
      },
    ],
    reviews: [
      {
        id: "review-samir-1",
        giverName: "أبو خالد",
        rating: 4,
        comment: "ملتزم وواضح في التكلفة.",
        createdAt: "2026-05-04",
      },
    ],
  },
];

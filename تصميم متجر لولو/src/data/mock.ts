/*
Image mapping from Stitch:
- /images/stitch/logo.png: Stitch logo reference, kept for visual parity.
- /images/stitch/hero-children.png: homepage hero image from Stitch.
- /images/stitch/generated/*.png: standalone generated product/category/banner images from Stitch board.
*/

export type CategorySlug = "girls" | "boys" | "toys" | "shoes" | "accessories";
export type AgeRange = "0-2 سنة" | "3-5 سنوات" | "6-9 سنوات" | "10+ سنوات";
export type Size = "2T" | "3T" | "4T" | "5T" | "6T" | "8T" | "XS" | "S" | "M" | "L";

export interface ProductColor {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategorySlug;
  categoryLabel: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  ageRange: AgeRange;
  sizes: Size[];
  colors: ProductColor[];
  image: string;
  gallery: string[];
  description: string;
  badge: string;
  isToy?: boolean;
}

export interface CartLine {
  key: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  size?: Size;
  ageRange: AgeRange;
  quantity: number;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  image: string;
  tone: string;
}

export const categories: Category[] = [
  {
    slug: "girls",
    name: "بنات",
    description: "تصاميم ساحرة لكل مناسبة",
    image: "/images/stitch/generated/girls-floral-dress-hanger.png",
    tone: "rose",
  },
  {
    slug: "boys",
    name: "أولاد",
    description: "أناقة عصرية لكل يوم",
    image: "/images/stitch/generated/boys-linen-flatlay.png",
    tone: "blue",
  },
  {
    slug: "toys",
    name: "ألعاب",
    description: "عالم من الخيال والمرح",
    image: "/images/stitch/generated/toy-wooden-rainbow-set.png",
    tone: "yellow",
  },
  {
    slug: "shoes",
    name: "حديثي الولادة",
    description: "نعومة فائقة لأولى خطواتهم",
    image: "/images/stitch/generated/baby-knit-outfit-hanger.png",
    tone: "mint",
  },
  {
    slug: "accessories",
    name: "إكسسوارات",
    description: "تفاصيل صغيرة تكمل الإطلالة",
    image: "/images/stitch/generated/banner-back-to-school-room.png",
    tone: "lavender",
  },
];

const colors: ProductColor[] = [
  { name: "أزرق سماوي", value: "#4f8ef7" },
  { name: "كورال", value: "#ff6b81" },
  { name: "أصفر مشمس", value: "#ffb84d" },
  { name: "نعناعي", value: "#7bd389" },
];

const stitchProductOverride: Product = {
  id: "lolo-dress-sky",
  name: "طقم ملابس صيفي للأطفال",
  category: "girls",
  categoryLabel: "ملابس بنات",
  price: 150,
  originalPrice: 200,
  rating: 4.8,
  reviews: 124,
  ageRange: "3-5 سنوات",
  sizes: ["2T", "3T", "4T", "5T", "6T"],
  colors,
  image: "/images/stitch/product-page/summer-set-main.png",
  gallery: [
    "/images/stitch/product-page/summer-set-main.png",
    "/images/stitch/product-page/summer-set-closeup.png",
    "/images/stitch/product-page/summer-set-back.png",
    "/images/stitch/product-page/summer-set-fabric.png",
    "/images/stitch/product-page/summer-set-lifestyle.png",
  ],
  description:
    "طقم صيفي ناعم ومريح للأطفال، مصمم بألوان مرحة وخامة قطنية خفيفة مناسبة للعب والخروج اليومي.",
  badge: "خصم 25%",
};

export const products: Product[] = [
  {
    id: "lolo-dress-sky",
    name: "فستان سماوي بطيات ناعمة",
    category: "girls",
    categoryLabel: "ملابس بنات",
    price: 129,
    originalPrice: 169,
    rating: 4.8,
    reviews: 46,
    ageRange: "3-5 سنوات",
    sizes: ["2T", "3T", "4T", "5T", "6T"],
    colors,
    image: "/images/stitch/generated/girls-floral-dress-hanger.png",
    gallery: ["/images/stitch/generated/girls-floral-dress-hanger.png", "/images/stitch/generated/girls-autumn-cardigan-set.png", "/images/stitch/generated/banner-autumn-child.png"],
    description: "فستان خفيف بقصة مريحة وخامة قطنية ناعمة مناسبة للعب والمناسبات الصغيرة.",
    badge: "الأكثر طلبا",
  },
  {
    id: "lolo-boys-set",
    name: "طقم أولاد قطني للرحلات",
    category: "boys",
    categoryLabel: "ملابس أولاد",
    price: 118,
    originalPrice: 148,
    rating: 4.7,
    reviews: 38,
    ageRange: "6-9 سنوات",
    sizes: ["4T", "5T", "6T", "8T"],
    colors,
    image: "/images/stitch/generated/boys-linen-flatlay.png",
    gallery: ["/images/stitch/generated/boys-linen-flatlay.png", "/images/stitch/generated/boys-quilted-vest-set.png", "/images/stitch/generated/banner-back-to-school-room.png"],
    description: "طقم عملي بملمس ناعم وتفاصيل تتحمل الحركة اليومية دون أن يفقد شكله الأنيق.",
    badge: "جديد",
  },
  {
    id: "lolo-wooden-toy",
    name: "مجموعة لعب تخيلية آمنة",
    category: "toys",
    categoryLabel: "ألعاب",
    price: 89,
    originalPrice: 119,
    rating: 4.9,
    reviews: 57,
    ageRange: "3-5 سنوات",
    sizes: ["S", "M", "L"],
    colors,
    image: "/images/stitch/generated/toy-stacking-rings-car.png",
    gallery: ["/images/stitch/generated/toy-stacking-rings-car.png", "/images/stitch/generated/toy-wooden-rainbow-set.png", "/images/stitch/generated/toy-knit-dinosaur-blocks.png"],
    description: "مجموعة لعب بألوان هادئة وخامات آمنة تشجع الطفل على التركيب وسرد القصص.",
    badge: "آمن للأطفال",
    isToy: true,
  },
  {
    id: "lolo-sneakers",
    name: "حذاء خطوات أولى مبطن",
    category: "shoes",
    categoryLabel: "أحذية",
    price: 99,
    originalPrice: 139,
    rating: 4.6,
    reviews: 31,
    ageRange: "0-2 سنة",
    sizes: ["XS", "S", "M", "L"],
    colors,
    image: "/images/stitch/generated/shoes-leather-boots-beanie.png",
    gallery: [
      "/images/stitch/generated/shoes-leather-boots-beanie.png",
      "/images/stitch/product-shoes.png",
      "/images/stitch/generated/baby-knit-outfit-hanger.png",
    ],
    description: "حذاء خفيف ببطانة ناعمة ونعل مرن يمنح الطفل راحة في خطواته الأولى.",
    badge: "راحة يومية",
  },
  {
    id: "lolo-hair-set",
    name: "ربطات شعر بألوان لولو",
    category: "accessories",
    categoryLabel: "إكسسوارات",
    price: 39,
    originalPrice: 55,
    rating: 4.5,
    reviews: 24,
    ageRange: "3-5 سنوات",
    sizes: ["S", "M"],
    colors,
    image: "/images/stitch/generated/toy-bunny-alphabet-blocks.png",
    gallery: ["/images/stitch/generated/toy-bunny-alphabet-blocks.png", "/images/stitch/art-pencils.png", "/images/stitch/art-sketchbook.png"],
    description: "إكسسوارات ناعمة لا تشد الشعر وتضيف لمسة مرحة للإطلالة اليومية.",
    badge: "هدية لطيفة",
  },
  {
    id: "lolo-cardigan",
    name: "كارديغان دافئ بنسيج قطني",
    category: "girls",
    categoryLabel: "ملابس بنات",
    price: 142,
    originalPrice: 188,
    rating: 4.8,
    reviews: 41,
    ageRange: "6-9 سنوات",
    sizes: ["4T", "5T", "6T", "8T"],
    colors,
    image: "/images/stitch/generated/girls-autumn-cardigan-set.png",
    gallery: ["/images/stitch/generated/girls-autumn-cardigan-set.png", "/images/stitch/generated/girls-floral-dress-hanger.png", "/images/stitch/generated/banner-autumn-child.png"],
    description: "كارديغان خفيف للطبقات اليومية، يحافظ على الدفء دون ثقل.",
    badge: "ناعم",
  },
  {
    id: "lolo-polo",
    name: "قميص بولو للأطفال النشطين",
    category: "boys",
    categoryLabel: "ملابس أولاد",
    price: 74,
    originalPrice: 98,
    rating: 4.4,
    reviews: 18,
    ageRange: "10+ سنوات",
    sizes: ["6T", "8T", "XS", "S"],
    colors,
    image: "/images/stitch/generated/boys-quilted-vest-set.png",
    gallery: ["/images/stitch/generated/boys-quilted-vest-set.png", "/images/stitch/generated/boys-linen-flatlay.png", "/images/stitch/generated/banner-back-to-school-room.png"],
    description: "قميص مرتب بخامة قابلة للتنفس يناسب المدرسة والخروج.",
    badge: "سهل التنسيق",
  },
  {
    id: "lolo-soft-blocks",
    name: "مكعبات ناعمة للتعلم",
    category: "toys",
    categoryLabel: "ألعاب",
    price: 64,
    originalPrice: 84,
    rating: 4.7,
    reviews: 29,
    ageRange: "0-2 سنة",
    sizes: ["S", "M"],
    colors,
    image: "/images/stitch/generated/toy-wooden-rainbow-set.png",
    gallery: ["/images/stitch/generated/toy-wooden-rainbow-set.png", "/images/stitch/generated/toy-stacking-rings-car.png", "/images/stitch/art-watercolors.png"],
    description: "مكعبات خفيفة وآمنة تساعد على تنمية التوازن والتعرف على الألوان.",
    badge: "تعليمي",
    isToy: true,
  },
  {
    id: "lolo-sandals",
    name: "صندل صيفي مرن",
    category: "shoes",
    categoryLabel: "أحذية",
    price: 82,
    originalPrice: 112,
    rating: 4.3,
    reviews: 17,
    ageRange: "3-5 سنوات",
    sizes: ["XS", "S", "M", "L"],
    colors,
    image: "/images/stitch/generated/shoes-leather-boots-beanie.png",
    gallery: [
      "/images/stitch/generated/shoes-leather-boots-beanie.png",
      "/images/stitch/product-shoes.png",
      "/images/stitch/generated/banner-autumn-child.png",
    ],
    description: "صندل خفيف للعب الصيفي مع إغلاق ثابت وسهل.",
    badge: "عرض صيفي",
  },
  {
    id: "lolo-backpack",
    name: "حقيبة صغيرة للروضة",
    category: "accessories",
    categoryLabel: "إكسسوارات",
    price: 96,
    originalPrice: 126,
    rating: 4.8,
    reviews: 34,
    ageRange: "3-5 سنوات",
    sizes: ["S", "M"],
    colors,
    image: "/images/stitch/generated/banner-back-to-school-room.png",
    gallery: ["/images/stitch/generated/banner-back-to-school-room.png", "/images/stitch/art-sketchbook.png", "/images/stitch/generated/boys-linen-flatlay.png"],
    description: "حقيبة خفيفة بجيوب منظمة ومقاس مناسب للروضة والنزهات.",
    badge: "خفيفة",
  },
  {
    id: "lolo-baby-set",
    name: "طقم مواليد قطن عضوي",
    category: "girls",
    categoryLabel: "ملابس بنات",
    price: 155,
    originalPrice: 199,
    rating: 4.9,
    reviews: 52,
    ageRange: "0-2 سنة",
    sizes: ["2T", "3T"],
    colors,
    image: "/images/stitch/generated/baby-knit-outfit-hanger.png",
    gallery: ["/images/stitch/generated/baby-knit-outfit-hanger.png", "/images/stitch/generated/girls-floral-dress-hanger.png", "/images/stitch/hero-children.png"],
    description: "طقم مواليد بملمس لطيف على البشرة الحساسة وخياطة ناعمة من الداخل.",
    badge: "قطن عضوي",
  },
  {
    id: "lolo-raincoat",
    name: "جاكيت خفيف ضد المطر",
    category: "boys",
    categoryLabel: "ملابس أولاد",
    price: 134,
    originalPrice: 178,
    rating: 4.5,
    reviews: 21,
    ageRange: "6-9 سنوات",
    sizes: ["4T", "5T", "6T", "8T"],
    colors,
    image: "/images/stitch/product-jacket.png",
    gallery: ["/images/stitch/product-jacket.png", "/images/stitch/generated/boys-quilted-vest-set.png", "/images/stitch/hero-children.png"],
    description: "جاكيت عملي للطقس المتقلب، خفيف وسهل الطي داخل الحقيبة.",
    badge: "عملي",
  },
];

export const bestSellers = products.slice(0, 4);

export const ageRanges: { label: AgeRange; href: string; image: string; tone: string }[] = [
  { label: "0-2 سنة", href: "/category/shoes?age=0-2", image: "/images/stitch/generated/baby-knit-outfit-hanger.png", tone: "mint" },
  { label: "3-5 سنوات", href: "/category/toys?age=3-5", image: "/images/stitch/generated/toy-bunny-alphabet-blocks.png", tone: "yellow" },
  { label: "6-9 سنوات", href: "/category/boys?age=6-9", image: "/images/stitch/generated/boys-linen-flatlay.png", tone: "blue" },
  { label: "10+ سنوات", href: "/category/boys?age=10-plus", image: "/images/stitch/generated/boys-quilted-vest-set.png", tone: "rose" },
];

export function getProduct(id: string) {
  if (id === stitchProductOverride.id) {
    return stitchProductOverride;
  }

  return products.find((product) => product.id === id) ?? products[0];
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug) ?? categories[0];
}

export function getProductsByCategory(slug: string) {
  return products.filter((product) => product.category === slug);
}

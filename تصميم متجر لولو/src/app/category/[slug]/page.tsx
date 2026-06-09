import Image from "next/image";
import { FilterSidebar } from "@/components/category/FilterSidebar";
import { ProductGrid } from "@/components/category/ProductGrid";
import { SortBar } from "@/components/category/SortBar";
import { getCategory, getProductsByCategory } from "@/data/mock";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  const categoryProducts = getProductsByCategory(category.slug);

  return (
    <main>
      <section className="page-hero">
        <div className="container page-hero-card">
          <div>
            <p className="muted">الرئيسية ← {category.name}</p>
            <h1 className="page-title">{category.name}</h1>
            <p className="muted" style={{ lineHeight: 1.9 }}>
              {category.description} كل المنتجات هنا مرتبة لتكون سهلة الفحص والاختيار، مع صور واضحة ومقاسات مختصرة.
            </p>
          </div>
          <div className="image-box">
            <Image
              src={category.image}
              alt={category.name}
              fill
              quality={100}
              priority
              sizes="50vw"
              style={{ objectFit: "cover", objectPosition: "top" }}
            />
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container category-layout">
          <FilterSidebar />
          <div>
            <SortBar count={categoryProducts.length} />
            <ProductGrid products={categoryProducts} />
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <button className="secondary-button" type="button">
                تحميل المزيد
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

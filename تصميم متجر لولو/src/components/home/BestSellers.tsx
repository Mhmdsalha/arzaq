import { bestSellers } from "@/data/mock";
import { ProductCard } from "@/components/ui/ProductCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export function BestSellers() {
  return (
    <section className="section section-soft">
      <div className="container">
        <div className="section-heading">
          <div>
            <h2>الأكثر مبيعًا</h2>
            <p>أحدث صيحات الموضة للأطفال كما ظهرت في تصميم Stitch.</p>
          </div>
          <PrimaryButton href="/category/girls" variant="secondary">
            عرض الكل
          </PrimaryButton>
        </div>
        <div className="product-grid">
          {bestSellers.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 2} />
          ))}
        </div>
      </div>
    </section>
  );
}

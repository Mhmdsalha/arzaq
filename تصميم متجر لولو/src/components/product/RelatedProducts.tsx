import { ProductCard } from "@/components/ui/ProductCard";
import { products } from "@/data/mock";

export function RelatedProducts({ currentId }: { currentId: string }) {
  const related = products.filter((product) => product.id !== currentId).slice(0, 4);

  return (
    <section className="section section-soft">
      <div className="container">
        <div className="section-heading">
          <div>
            <h2>منتجات مشابهة</h2>
            <p>اقتراحات تكمل اختيارك الحالي.</p>
          </div>
        </div>
        <div className="product-grid">
          {related.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

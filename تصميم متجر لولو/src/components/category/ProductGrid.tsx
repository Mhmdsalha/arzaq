import type { Product } from "@/data/mock";
import { ProductCard } from "@/components/ui/ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <div className="empty-state">لا توجد منتجات مطابقة حاليًا.</div>;
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 2} />
      ))}
    </div>
  );
}

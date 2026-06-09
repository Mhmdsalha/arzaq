import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { getProduct } from "@/data/mock";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);

  return (
    <main className="product-page-shell">
      <section className="product-hero-section">
        <div className="container">
          <nav className="product-breadcrumb" aria-label="مسار المنتج">
            الرئيسية ← {product.categoryLabel} ← {product.name}
          </nav>
          <div className="product-detail stitch-product-detail">
            <ProductGallery images={product.gallery} name={product.name} />
            <ProductInfo product={product} />
          </div>
        </div>
      </section>

      <section className="stitch-details-section">
        <div className="container">
          <div className="stitch-tabs" role="tablist" aria-label="تفاصيل المنتج">
            <button className="is-active" type="button">
              كل التفاصيل
            </button>
            <button type="button">المواصفات</button>
            <button type="button">رأي الأصدقاء ({product.reviews})</button>
          </div>
          <div className="stitch-detail-grid">
            <article className="stitch-detail-card">
              <span>تفاصيل المنتج</span>
              <h2>تصميم مريح يشبه شاشة Stitch</h2>
              <p>
                {product.description} القصة ناعمة ومرنة للحركة اليومية، مع تفاصيل ملونة وخامة لطيفة على بشرة الأطفال.
              </p>
            </article>
            <article className="stitch-care-card">
              <span>العناية</span>
              <ul>
                <li>غسيل لطيف بدرجة حرارة منخفضة.</li>
                <li>تجفيف في الظل للحفاظ على اللون.</li>
                <li>يكوى بحرارة خفيفة عند الحاجة.</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <RelatedProducts currentId={product.id} />
    </main>
  );
}

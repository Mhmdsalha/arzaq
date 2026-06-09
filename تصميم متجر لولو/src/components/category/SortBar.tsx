export function SortBar({ count }: { count: number }) {
  return (
    <div className="sort-bar">
      <span className="muted">عرض {count} منتج</span>
      <select aria-label="ترتيب المنتجات" defaultValue="best">
        <option value="best">الأكثر مبيعًا</option>
        <option value="low">السعر: من الأقل</option>
        <option value="new">الأحدث</option>
        <option value="rating">التقييم</option>
      </select>
    </div>
  );
}

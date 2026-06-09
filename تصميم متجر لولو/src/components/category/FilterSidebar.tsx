import { SlidersHorizontal } from "lucide-react";

export function FilterSidebar() {
  return (
    <aside className="filter-panel">
      <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: 0 }}>
        <SlidersHorizontal size={20} />
        تصفية
      </h3>
      <div className="filter-group">
        <strong>الفئة العمرية</strong>
        <div className="filter-options" style={{ marginTop: "0.8rem" }}>
          {["0-2", "3-5", "6-9", "10+"].map((age) => (
            <button className="selector-button" key={age} type="button">
              {age}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <strong>السعر</strong>
        <input aria-label="السعر" max="250" min="20" style={{ width: "100%", marginTop: "0.8rem" }} type="range" />
      </div>
      <div className="filter-group">
        <strong>المقاس</strong>
        <div className="filter-options" style={{ marginTop: "0.8rem" }}>
          {["XS", "S", "M", "L", "XL"].map((size) => (
            <button className="selector-button" key={size} type="button">
              {size}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <strong>اللون</strong>
        <div className="swatches" style={{ marginTop: "0.8rem" }}>
          {["#4f8ef7", "#ffb84d", "#ff6b81", "#7bd389"].map((color) => (
            <span className="swatch" key={color} style={{ background: color }} />
          ))}
        </div>
      </div>
      <div className="filter-group">
        <strong>التقييم</strong>
        <p className="muted">4 نجوم فأكثر</p>
      </div>
    </aside>
  );
}

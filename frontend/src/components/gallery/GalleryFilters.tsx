import { Search, SlidersHorizontal } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface GalleryFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  activeType: string;
  setActiveType: (value: string) => void;
  activeCategory: string;
  setActiveCategory: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  discountOnly: boolean;
  setDiscountOnly: (value: boolean) => void;
  inStockOnly: boolean;
  setInStockOnly: (value: boolean) => void;
  categories: string[];
  productTypes: Option[];
  sortOptions: Option[];
  allFilterValue: string;
  itemCount: number;
  t: (key: string) => string;
}

export default function GalleryFilters({
  search,
  setSearch,
  activeType,
  setActiveType,
  activeCategory,
  setActiveCategory,
  sort,
  setSort,
  discountOnly,
  setDiscountOnly,
  inStockOnly,
  setInStockOnly,
  categories,
  productTypes,
  sortOptions,
  allFilterValue,
  itemCount,
  t,
}: GalleryFiltersProps) {
  return (
    <div className="site-card reveal-up stagger-2 mb-8 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <label className="lg:col-span-2 flex items-center gap-2 rounded-xl border border-[#d8e6df] bg-white px-3">
          <Search size={16} className="text-[#5f726c]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("gallery.searchPlaceholder")}
            className="w-full py-2.5 bg-transparent outline-none text-sm"
          />
        </label>

        <select
          value={activeType}
          onChange={(e) => setActiveType(e.target.value)}
          className="rounded-xl border border-[#d8e6df] bg-white px-3 py-2.5 text-sm"
        >
          {productTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          className="rounded-xl border border-[#d8e6df] bg-white px-3 py-2.5 text-sm"
        >
          <option value={allFilterValue}>{t("gallery.categoryAll")}</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-[#d8e6df] bg-white px-3 py-2.5 text-sm"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-sm text-[#445852]">
          <input
            type="checkbox"
            checked={discountOnly}
            onChange={(e) => setDiscountOnly(e.target.checked)}
            className="h-4 w-4 rounded border-[#c8dbd2]"
          />
          {t("gallery.discountedOnly")}
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-[#445852]">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-[#c8dbd2]"
          />
          {t("gallery.inStockOnly")}
        </label>

        <span className="text-xs uppercase tracking-widest text-[#6c817a] flex items-center gap-1 whitespace-nowrap">
          <SlidersHorizontal size={12} />
          {itemCount} {t("gallery.itemsLabel")}
        </span>
      </div>
    </div>
  );
}

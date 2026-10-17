"use client";
import { confirmDialog } from "@/lib/dialog";

import { Edit, Plus, Trash2, UploadCloud } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import type { StoreSettings } from "@/context/StoreContext";
import { DEFAULT_CATEGORIES } from "@/data/products";
import type { Product } from "@/data/products";


interface Props {
  settingsForm: StoreSettings;
  filteredProductsList: Product[];
  categoryFilter: string;
  setCategoryFilter: React.Dispatch<React.SetStateAction<string>>;
  productSearch: string;
  setProductSearch: React.Dispatch<React.SetStateAction<string>>;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  handleOpenNewProduct: () => void;
  handleOpenEditProduct: (prod: Product) => void;
  addToast: (title: string, message: string, type: "cart" | "wishlist" | "promo" | "info") => void;

}

export default function ProductsTab({ settingsForm, filteredProductsList, categoryFilter, setCategoryFilter, productSearch, setProductSearch, updateProduct, deleteProduct, handleOpenNewProduct, handleOpenEditProduct, addToast }: Props) {
  const { pendingProductChanges, publishProducts, discardProductChanges } = useStore();
  return (
    <div className="space-y-6">
      {/* Unpublished-changes bar: nothing reaches the live site until "publish" is pressed */}
      <div
        className={`sticky top-2 z-20 rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm ${
          pendingProductChanges > 0 ? "bg-amber-50 border-amber-300" : "bg-emerald-50 border-emerald-200"
        }`}
      >
        <div className="text-xs font-bold text-[#292722]">
          {pendingProductChanges > 0
            ? `عندك ${pendingProductChanges} تعديل على المنتجات لسه ما اتنشرش على الموقع (العملاء مش شايفينه)`
            : "كل تعديلات المنتجات منشورة على الموقع ✓"}
        </div>
        {pendingProductChanges > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                if (await confirmDialog("هتتجاهل كل التعديلات اللي لسه ما اتنشرتش وترجع المنتجات زي ما هي على الموقع. متأكد؟", { title: "تجاهل التعديلات", confirmText: "تجاهل", danger: true })) {
                  discardProductChanges();
                }
              }}
              className="px-4 py-2 rounded-lg border border-[#d8c8b4] bg-white text-xs font-bold text-[#292722] hover:bg-[#F5F0E7]"
            >
              تجاهل التعديلات
            </button>
            <button
              onClick={publishProducts}
              className="px-5 py-2 rounded-lg bg-[#292722] text-[#F5F0E7] text-xs font-bold hover:bg-[#2e2925] shadow-md flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4 text-[#c5a880]" />
              <span>نشر على الموقع</span>
            </button>
          </div>
        )}
      </div>

      {/* Top Controls */}
      <div className="bg-white rounded-xl p-4 border border-[#e8ded0] flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <button
          onClick={handleOpenNewProduct}
          className="px-5 py-2.5 rounded-lg bg-[#292722] text-[#F5F0E7] text-xs font-bold hover:bg-[#2e2925] transition-colors shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#c5a880]" />
          <span>إضافة قطعة جديدة</span>
        </button>

        <div className="flex items-center gap-3 flex-1 max-w-md">
          <input
            type="text"
            placeholder="ابحث في المنتجات..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#292722] focus:outline-none focus:border-[#292722]"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#292722] focus:outline-none"
          >
            <option value="all">كافة الكولكشن والأقسام</option>
            {(settingsForm.categories && settingsForm.categories.length > 0
              ? settingsForm.categories
              : DEFAULT_CATEGORIES
            ).map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProductsList.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-[#e8ded0] p-4 flex flex-col justify-between shadow-sm hover:border-[#b8a892] transition-colors"
          >
            <div>
              {/* Photo */}
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#F5F0E7] mb-3 border border-[#ded2c0]">
                <img
                  src={product.images[0]}
                  alt={product.arabicName}
                  className="w-full h-full object-cover"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                    نفذت الكمية
                  </div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {product.isBestSeller && (
                    <span className="bg-[#292722] text-[#c5a880] text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      الأكثر مبيعاً
                    </span>
                  )}
                  {product.isNew && (
                    <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      جديد
                    </span>
                  )}
                </div>
              </div>

              <h4 className="text-sm font-bold text-[#292722] line-clamp-1 mb-1">
                {product.arabicName}
              </h4>
              {product.name && (
                <p className="text-[11px] text-[#8c7865] line-clamp-1 mb-2 font-mono">
                  {product.name}
                </p>
              )}

              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-[#292722]">
                  {product.price.toLocaleString("en-US")} ج.م
                </span>
                {product.originalPrice && (
                  <span className="text-[11px] text-[#8c7865] line-through">
                    {product.originalPrice.toLocaleString("en-US")} ج.م
                  </span>
                )}
              </div>

              {/* Product Collections Badges */}
              <div className="flex flex-wrap items-center gap-1 mb-3">
                {(product.collections && product.collections.length > 0
                  ? product.collections
                  : [product.category]
                ).map((colId) => {
                  const matchedCol = (settingsForm.categories || DEFAULT_CATEGORIES).find(
                    (c) => c.id === colId || c.slug === colId
                  );
                  return (
                    <span
                      key={colId}
                      className="text-[9px] bg-[#f0e7db] text-[#5c4f42] px-1.5 py-0.5 rounded font-medium"
                    >
                      {matchedCol?.label || colId}
                    </span>
                  );
                })}
              </div>
              {/* Inventory Stock Indicator with quick adjustment */}
              <div className="bg-[#F5F0E7] rounded-lg p-2 mb-3 border border-[#ded2c0] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      !product.inStock || (product.stockQuantity ?? 10) <= 0
                        ? "bg-rose-500"
                        : (product.stockQuantity ?? 10) <= 5
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />
                  <span className="font-medium text-[#292722]">
                    المخزون:{" "}
                    <strong className="font-bold">
                      {product.stockQuantity !== undefined ? product.stockQuantity : (product.inStock ? 10 : 0)}
                    </strong>{" "}
                    قطعة
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = product.stockQuantity !== undefined ? product.stockQuantity : (product.inStock ? 10 : 0);
                      const next = Math.max(0, cur - 1);
                      updateProduct(product.id, {
                        stockQuantity: next,
                        inStock: next > 0,
                      });
                    }}
                    className="w-9 h-9 md:w-5 md:h-5 rounded bg-white border border-[#ded2c0] flex items-center justify-center text-sm md:text-xs font-bold hover:bg-gray-100"
                    title="خصم 1 من المخزون"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = product.stockQuantity !== undefined ? product.stockQuantity : (product.inStock ? 10 : 0);
                      const next = cur + 1;
                      updateProduct(product.id, {
                        stockQuantity: next,
                        inStock: true,
                      });
                    }}
                    className="w-9 h-9 md:w-5 md:h-5 rounded bg-white border border-[#ded2c0] flex items-center justify-center text-sm md:text-xs font-bold hover:bg-gray-100"
                    title="إضافة 1 للمخزون"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions & Stock Toggle */}
            <div className="pt-3 border-t border-[#f0e8dc] flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  const nextInStock = !product.inStock;
                  const nextStock = nextInStock ? (product.stockQuantity && product.stockQuantity > 0 ? product.stockQuantity : 10) : 0;
                  updateProduct(product.id, {
                    inStock: nextInStock,
                    stockQuantity: nextStock,
                  });
                  addToast("تم التحديث", `تم تعديل حالة توفر "${product.arabicName}"`, "info");
                }}
                className={`text-[11px] font-bold px-3 py-2 md:px-2.5 md:py-1 rounded transition-colors ${
                  product.inStock && (product.stockQuantity === undefined || product.stockQuantity > 0)
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                {product.inStock && (product.stockQuantity === undefined || product.stockQuantity > 0) ? "متوفر للطلب" : "غير متوفر (SOLD OUT)"}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditProduct(product)}
                  className="p-1.5 rounded text-[#5c4f42] hover:text-[#292722] hover:bg-[#F5F0E7]"
                  title="تعديل القطعة"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    if (
                      await confirmDialog(`هل أنت متأكد من حذف "${product.arabicName}"؟\nهيتحذف من المتجر ومن قاعدة البيانات ومش هيظهر للعملاء.`, {
                        danger: true,
                        confirmText: "احذف القطعة",
                      })
                    ) {
                      deleteProduct(product.id);
                    }
                  }}
                  className="p-1.5 rounded text-[#baa894] hover:text-rose-600 hover:bg-rose-50"
                  title="حذف القطعة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

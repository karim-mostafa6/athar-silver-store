"use client";

import { Edit, ExternalLink, Layers, Plus, Save, Trash2 } from "lucide-react";
import type { StoreSettings } from "@/context/StoreContext";
import Link from "next/link";
import { DEFAULT_CATEGORIES } from "@/data/products";
import type { Product, StoreCategory } from "@/data/products";


interface Props {
  settingsForm: StoreSettings;
  handleSaveSettings: () => void;
  products: Product[];
  isSavingSettings: boolean;
  handleOpenAddCollection: () => void;
  handleOpenEditCollection: (col: StoreCategory) => void;
  handleDeleteCollection: (id: string, label: string) => void;

}

export default function CollectionsTab({ settingsForm, handleSaveSettings, products, isSavingSettings, handleOpenAddCollection, handleOpenEditCollection, handleDeleteCollection }: Props) {
  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl p-5 border border-[#e8ded0] flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="font-bold text-sm text-[#292722] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#c5a880]" />
            <span>إدارة الكولكشن والمجموعات (Collections & Categories)</span>
          </h3>
          <p className="text-xs text-[#756555] mt-1">
            أنشئ كولكشن جديد، خصص صورته وعنوانه، ووزع المنتجات على أي كولكشن بحرية تامة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddCollection}
            className="px-5 py-2.5 rounded-lg bg-[#292722] text-[#F5F0E7] text-xs font-bold hover:bg-[#2e2925] transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#c5a880]" />
            <span>إضافة كولكشن جديد</span>
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className="px-4 py-2.5 rounded-lg bg-[#c5a880] text-[#292722] text-xs font-bold hover:bg-[#b8996e] transition-all shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>حفظ السحابة</span>
          </button>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {(settingsForm.categories && settingsForm.categories.length > 0
          ? settingsForm.categories
          : DEFAULT_CATEGORIES
        ).map((col) => {
          const assignedCount = products.filter(
            (p) =>
              p.category === col.id ||
              (Array.isArray(p.collections) &&
                (p.collections.includes(col.id) || (col.slug && p.collections.includes(col.slug))))
          ).length;

          return (
            <div
              key={col.id}
              className="bg-white rounded-xl border border-[#e8ded0] overflow-hidden shadow-sm flex flex-col justify-between hover:border-[#b8a892] transition-colors"
            >
              {/* Banner Image Preview */}
              <div className="relative h-32 w-full bg-[#1c1815] overflow-hidden">
                {col.bannerImage ? (
                  <img
                    src={col.bannerImage}
                    alt={col.label}
                    className="w-full h-full object-cover brightness-[0.75]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1715] to-[#2c241d] text-[#c5a880]">
                    <Layers className="w-7 h-7 text-[#c5a880]/80 mb-1" />
                    <span className="font-amiri font-bold text-sm text-white/90">{col.label}</span>
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-white text-[10px] font-bold flex items-center gap-1.5">
                  <span>{assignedCount} قطع</span>
                </div>
                <div className="absolute bottom-2.5 right-2.5 text-white">
                  <span className="font-bold text-sm">{col.label}</span>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 space-y-2 flex-1">
                {col.englishTitle && (
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8c7865]">
                    {col.englishTitle}
                  </div>
                )}
                <p className="text-xs text-[#756555] line-clamp-2">
                  {col.description || `تشكيلة ${col.label} من الفضة الإسترليني عيار 925`}
                </p>
                <div className="pt-2 text-[11px] font-mono text-[#8c7865] dir-ltr flex items-center gap-1">
                  <span className="text-[#c5a880]">URL:</span> /collection/{col.slug || col.id}
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-3 bg-[#faf6f0] border-t border-[#e8ded0] flex items-center justify-between">
                <Link
                  href={`/collection/${col.slug || col.id}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#ded2c0] text-[#292722] hover:bg-[#ede3d3] text-xs font-medium flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>معاينة في المتجر</span>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditCollection(col)}
                    className="p-1.5 rounded text-[#5c4f42] hover:text-[#292722] hover:bg-white"
                    title="تعديل الكولكشن"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(col.id, col.label)}
                    className="p-1.5 rounded text-[#baa894] hover:text-rose-600 hover:bg-rose-50"
                    title="حذف الكولكشن"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

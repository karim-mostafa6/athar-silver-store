"use client";

import { BookOpen, Edit, ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import type { StoreSettings } from "@/context/StoreContext";
import Link from "next/link";
import { DEFAULT_CUSTOM_PAGES } from "@/data/products";
import type { CustomPage } from "@/data/products";


interface Props {
  settingsForm: StoreSettings;
  handleSaveSettings: () => void;
  isSavingSettings: boolean;
  handleOpenAddPage: () => void;
  handleOpenEditPage: (page: CustomPage) => void;
  handleDeletePage: (id: string, title: string) => void;

}

export default function PagesTab({ settingsForm, handleSaveSettings, isSavingSettings, handleOpenAddPage, handleOpenEditPage, handleDeletePage }: Props) {
  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl p-5 border border-[#e8ded0] flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="font-bold text-sm text-[#292722] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#c5a880]" />
            <span>إدارة الصفحات المستقلة والبراند (Custom Pages & Brand)</span>
          </h3>
          <p className="text-xs text-[#756555] mt-1">
            أنشئ صفحات مستقلة بروابط خاصة (مثل قصة براند ORMA، دليل الفضة، سياسات المتجر) وتحكم في روابط الفوتر.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddPage}
            className="px-5 py-2.5 rounded-lg bg-[#292722] text-[#F5F0E7] text-xs font-bold hover:bg-[#2e2925] transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#c5a880]" />
            <span>إنشاء صفحة جديدة</span>
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

      {/* Pages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {(settingsForm.customPages && settingsForm.customPages.length > 0
          ? settingsForm.customPages
          : DEFAULT_CUSTOM_PAGES
        ).map((page) => (
          <div
            key={page.id}
            className="bg-white rounded-xl border border-[#e8ded0] overflow-hidden shadow-sm flex flex-col justify-between hover:border-[#b8a892] transition-colors"
          >
            {/* Page Banner Preview */}
            <div className="relative h-28 w-full bg-[#1c1815] overflow-hidden">
              {page.bannerImage ? (
                <img
                  src={page.bannerImage}
                  alt={page.title}
                  className="w-full h-full object-cover brightness-[0.7]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[#211d19] to-[#332b24] text-[#c5a880] text-sm font-bold">
                  {page.title}
                </div>
              )}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    page.isPublished !== false
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-600 text-white"
                  }`}
                >
                  {page.isPublished !== false ? "منشورة" : "مسودة"}
                </span>
                {page.showInFooter !== false && (
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-[#292722] text-[10px] font-bold">
                    في الفوتر
                  </span>
                )}
              </div>
            </div>

            {/* Page Content Info */}
            <div className="p-4 space-y-2 flex-1">
              <h4 className="font-bold text-sm text-[#292722] line-clamp-1">{page.title}</h4>
              {page.englishTitle && (
                <div className="text-[10px] font-mono text-[#8c7865] uppercase">
                  {page.englishTitle}
                </div>
              )}
              {page.subtitle && (
                <p className="text-xs text-[#756555] line-clamp-2">{page.subtitle}</p>
              )}
              <div className="pt-2 text-[11px] font-mono text-[#8c7865] dir-ltr">
                <span className="text-[#c5a880]">URL:</span> /page/{page.slug}
              </div>
            </div>

            {/* Card Actions */}
            <div className="p-3 bg-[#faf6f0] border-t border-[#e8ded0] flex items-center justify-between">
              <Link
                href={`/page/${page.slug}`}
                target="_blank"
                className="px-3 py-1.5 rounded-lg bg-white border border-[#ded2c0] text-[#292722] hover:bg-[#ede3d3] text-xs font-medium flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>معاينة حية ↗</span>
              </Link>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditPage(page)}
                  className="p-1.5 rounded text-[#5c4f42] hover:text-[#292722] hover:bg-white"
                  title="تعديل الصفحة"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePage(page.id, page.title)}
                  className="p-1.5 rounded text-[#baa894] hover:text-rose-600 hover:bg-rose-50"
                  title="حذف الصفحة"
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

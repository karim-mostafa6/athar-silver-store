"use client";

import { Layers, Plus, Save, Trash2 } from "lucide-react";
import type { StoreSettings, NavLinkItem } from "@/context/StoreContext";

interface Props {
  settingsForm: StoreSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<StoreSettings>>;
  handleSaveSettings: () => void;

}

export default function NavTab({ settingsForm, setSettingsForm, handleSaveSettings }: Props) {
  // Helper for NavLinks Updates
  const updateNavLinkItem = (id: string, updates: Partial<NavLinkItem>) => {
    const updated = (settingsForm.navLinks || []).map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setSettingsForm((prev) => ({ ...prev, navLinks: updated }));
  };

  const addNavLinkItem = () => {
    const newItem: NavLinkItem = {
      id: `nav-${Date.now()}`,
      label: "رابط جديد",
      href: "/collections",
      visible: true,
      isSpecial: false,
      badge: "",
      badgeColor: "amber",
      targetBlank: false,
    };
    setSettingsForm((prev) => ({
      ...prev,
      navLinks: [...(prev.navLinks || []), newItem],
    }));
  };

  const removeNavLinkItem = (id: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      navLinks: (prev.navLinks || []).filter((item) => item.id !== id),
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
        <div className="text-sm font-bold text-[#292722] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
          <Layers className="w-4 h-4 text-[#c5a880]" />
          <span>روابط قائمة التنقل العلوية (Navigation Links)</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#756555] mb-1.5">
            النص التوضيحي داخل شريط البحث (Search Placeholder)
          </label>
          <input
            type="text"
            value={settingsForm.searchPlaceholder || "ابحث عن خاتم، سلسلة، عيار 925..."}
            onChange={(e) => setSettingsForm({ ...settingsForm, searchPlaceholder: e.target.value })}
            className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] focus:outline-none focus:border-[#292722]"
          />
        </div>

        <div className="pt-2 border-t border-[#f0e8dc] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#292722]">روابط القائمة الرئيسية:</span>
            <button
              type="button"
              onClick={addNavLinkItem}
              className="px-3 py-1.5 rounded-lg bg-[#292722] text-[#F5F0E7] text-xs font-bold hover:bg-[#2e2925] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة رابط جديد</span>
            </button>
          </div>

          <div className="space-y-3">
            {(settingsForm.navLinks || []).map((link) => (
              <div
                key={link.id}
                className="p-3 bg-[#F5F0E7] rounded-lg border border-[#e4dcce] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
              >
                <div className="sm:col-span-3">
                  <label className="block text-[10px] text-[#756555] mb-0.5">اسم الرابط</label>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateNavLinkItem(link.id, { label: e.target.value })}
                    className="w-full bg-white border border-[#ded2c0] rounded px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] text-[#756555] mb-0.5">الرابط (Href)</label>
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => updateNavLinkItem(link.id, { href: e.target.value })}
                    className="w-full bg-white border border-[#ded2c0] rounded px-2.5 py-1.5 text-xs dir-ltr"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-[#756555] mb-0.5">شارة (Badge)</label>
                  <input
                    type="text"
                    value={link.badge || ""}
                    onChange={(e) => updateNavLinkItem(link.id, { badge: e.target.value })}
                    placeholder="جديد / خصم"
                    className="w-full bg-white border border-[#ded2c0] rounded px-2 py-1.5 text-xs"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 pt-3 sm:pt-0">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={link.visible}
                      onChange={(e) => updateNavLinkItem(link.id, { visible: e.target.checked })}
                      className="rounded border-[#ded2c0] text-[#292722]"
                    />
                    <span>ظاهر</span>
                  </label>

                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={link.isSpecial || false}
                      onChange={(e) => updateNavLinkItem(link.id, { isSpecial: e.target.checked })}
                      className="rounded border-[#ded2c0] text-[#292722]"
                    />
                    <span className="text-amber-700 font-bold">مميز</span>
                  </label>
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeNavLinkItem(link.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                    title="حذف الرابط"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sub-items manager for this link */}
                <div className="sm:col-span-12 pt-2 border-t border-[#ded2c0]/60 mt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#5c4d3f]">
                      الأقسام الفرعية بالقائمة المنسدلة (تظهر عند الوقوف على الرابط بالماوس):
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = link.subItems || [];
                        updateNavLinkItem(link.id, {
                          subItems: [...cur, { label: "قسم جديد", href: link.href }],
                        });
                      }}
                      className="text-[10px] font-bold text-[#c5a880] hover:text-[#9e7a4f] bg-[#292722] px-2.5 py-1 rounded-md"
                    >
                      + إضافة قسم فرعي
                    </button>
                  </div>
                  {(link.subItems && link.subItems.length > 0) ? (
                    <div className="space-y-1.5 pr-2 border-r-2 border-[#c5a880]/50">
                      {link.subItems.map((sub, subIdx) => (
                        <div key={subIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={sub.label}
                            placeholder="اسم القسم (مثال: خواتم رجالي)"
                            onChange={(e) => {
                              const updated = [...(link.subItems || [])];
                              updated[subIdx] = { ...updated[subIdx], label: e.target.value };
                              updateNavLinkItem(link.id, { subItems: updated });
                            }}
                            className="w-1/3 bg-white border border-[#ded2c0] rounded px-2.5 py-1 text-xs font-medium"
                          />
                          <input
                            type="text"
                            value={sub.href}
                            placeholder="الرابط (مثال: /collection/rings?gender=men)"
                            onChange={(e) => {
                              const updated = [...(link.subItems || [])];
                              updated[subIdx] = { ...updated[subIdx], href: e.target.value };
                              updateNavLinkItem(link.id, { subItems: updated });
                            }}
                            className="flex-1 bg-white border border-[#ded2c0] rounded px-2.5 py-1 text-xs dir-ltr"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (link.subItems || []).filter((_, idx) => idx !== subIdx);
                              updateNavLinkItem(link.id, { subItems: updated });
                            }}
                            className="p-1 text-rose-500 hover:text-rose-700"
                            title="حذف هذا القسم الفرعي"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#8c7865] font-light">
                      يستخدم الأقسام الفرعية الافتراضية الذكية تلقائياً. يمكنك الضغط على &quot;+ إضافة قسم فرعي&quot; لإضافة أو تخصيص أقسام خاصة بك.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveSettings}
        className="w-full py-3 rounded-xl bg-[#292722] text-[#F5F0E7] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4 text-[#c5a880]" />
        <span>حفظ قائمة التنقل والبحث</span>
      </button>
    </div>
  );
}

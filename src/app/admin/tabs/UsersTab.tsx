"use client";

import { Crown, KeyRound, Shield, ShoppingBag, Sparkles, Trash2, UserCheck, UserPlus, Users } from "lucide-react";
import type { StoreSettings } from "@/context/StoreContext";


interface Props {
  settingsForm: StoreSettings;
  onOpenAddUser: () => void;
  handleToggleUserActive: (userId: string) => void;
  handleDeleteUser: (userId: string, userName: string) => void;

}

export default function UsersTab({ settingsForm, onOpenAddUser, handleToggleUserActive, handleDeleteUser }: Props) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Box */}
      <div className="bg-white rounded-2xl border border-[#e8ded0] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#292722] text-[#c5a880]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#292722] font-amiri">
                إدارة المستخدمين وصلاحيات لوحة التحكم
              </h2>
              <p className="text-xs text-[#756555] mt-0.5">
                التحكم الكامل في حسابات فريق العمل وتحديد صفحات الوصول بدقة
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onOpenAddUser();
          }}
          className="px-4 py-2.5 rounded-xl bg-[#292722] hover:bg-[#2e2925] text-[#F5F0E7] text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4 text-[#c5a880]" />
          <span>+ إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* Master Super Admin Card (Permanent & Protected) */}
      <div className="bg-gradient-to-l from-[#faf6ee] to-white rounded-2xl border-2 border-[#c5a880]/50 p-6 shadow-sm space-y-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 bg-[#c5a880] text-[#292722] px-3 py-1 rounded-br-xl text-[10px] font-black flex items-center gap-1 shadow-xs">
          <Crown className="w-3 h-3 text-[#292722]" />
          <span>المالك والمدير العام (Master Super Admin)</span>
        </div>

        <div className="flex items-start justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#292722] text-[#c5a880] flex items-center justify-center font-bold text-lg shadow-md">
              ك
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#292722] flex items-center gap-2">
                <span>كريم مصطفى</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#292722] text-[#c5a880]">
                  karim mostafa
                </span>
              </h3>
              <p className="text-xs text-[#756555] mt-0.5">
                صلاحية مطلقة: إدارة الطلبات والعملاء + تعديل نصوص وإعدادات المتجر + إدارة المستخدمين
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            حساب رئيسي دائم
          </span>
        </div>

        <div className="bg-white/80 rounded-xl p-3 border border-[#e8ded0] text-[11px] text-[#756555] flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#c5a880] shrink-0" />
          <span>
            كلمة مرور الحساب الماستر مشفرة ومحمية بسجلات التشفير السحابية. لا يمكن حذفه أو تقييد صلاحياته لأسباب أمنية.
          </span>
        </div>
      </div>

      {/* Sub-Admins List */}
      <div className="bg-white rounded-2xl border border-[#e8ded0] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#292722] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#c5a880]" />
              <span>المستخدمون المصرح لهم (الموظفون وفريق العمل)</span>
            </h3>
            <p className="text-xs text-[#756555] mt-0.5">
              يمكنك تحديد ما يظهر لكل مستخدم عند تسجيل دخوله (الطلبات فقط، أو تعديل المتجر فقط، أو كلاهما)
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#8c7865] bg-[#fbf9f5] px-2.5 py-1 rounded-lg border border-[#e8ded0]">
            {(settingsForm.adminUsers || []).length} مستخدم
          </span>
        </div>

        {(!settingsForm.adminUsers || settingsForm.adminUsers.length === 0) ? (
          <div className="py-10 text-center space-y-3 bg-[#fbf9f5] rounded-xl border border-dashed border-[#ded2c0]">
            <div className="w-12 h-12 rounded-full bg-[#f4ece0] text-[#8c7865] flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6 text-[#c5a880]" />
            </div>
            <h4 className="text-xs font-bold text-[#292722]">لا يوجد مستخدمون فرعيون مضافون</h4>
            <p className="text-[11px] text-[#8c7865] max-w-sm mx-auto">
              يمكنك الآن إضافة موظف مبيعات لرؤية الطلبات فقط، أو مصمم ومسؤول محتوى لتعديل الموقع والمنتجات فقط دون الوصول للطلبات.
            </p>
            <button
              type="button"
              onClick={() => {
                onOpenAddUser();
              }}
              className="px-4 py-2 rounded-xl bg-[#292722] text-[#F5F0E7] text-xs font-bold hover:bg-[#2e2925] transition-all"
            >
              + إضافة أول مستخدم الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {settingsForm.adminUsers.map((u) => (
              <div
                key={u.id}
                className={`p-4 rounded-xl border transition-all ${
                  u.isActive
                    ? "bg-[#fbf9f5] border-[#e8ded0] hover:border-[#c5a880]"
                    : "bg-gray-50 border-gray-200 opacity-60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#ded2c0] flex items-center justify-center font-bold text-sm text-[#292722] shadow-xs">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#292722]">{u.name}</span>
                        <span className="font-mono text-[11px] text-[#8c7865] bg-white px-2 py-0.5 rounded-md border border-[#ded2c0]">
                          @{u.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {u.role === "orders_customers" && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3 text-blue-600" />
                            <span>الطلبات والعملاء فقط</span>
                          </span>
                        )}
                        {u.role === "store_editor" && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>تعديل المتجر والموقع فقط</span>
                          </span>
                        )}
                        {u.role === "all" && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                            <Shield className="w-3 h-3 text-emerald-600" />
                            <span>كامل الصلاحيات (الطلبات + المتجر)</span>
                          </span>
                        )}
                        <span className="text-[10px] text-[#8c7865]">
                          أنشئ في: {u.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Password Badge */}
                    <div className="px-2.5 py-1 rounded-lg bg-white border border-[#ded2c0] text-[11px] font-mono text-[#5c4f42] flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-[#c5a880]" />
                      <span title="كلمة المرور مشفّرة ولا يمكن عرضها. لتغييرها احذف الحساب وأنشئه من جديد.">••••••••</span>
                    </div>

                    {/* Toggle Active Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleUserActive(u.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                        u.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-amber-50 hover:text-amber-700"
                          : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                      title={u.isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
                    >
                      {u.isActive ? "نشط" : "معطل"}
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                      title="حذف المستخدم نهائياً"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

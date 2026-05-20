import React, { useState } from "react";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { BookOpen, UserPlus, CheckCircle, RefreshCw } from "lucide-react";
import { cn } from "@/pages/Borrow/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import "@/Index.css";

const inputClass = cn(
    "w-full px-4 py-3 rounded-xl border-2 border-border text-base transition-all duration-200",
    "bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary shadow-sm"
);

export default function LoanPage() {
  const [subscriberNumber, setSubscriberNumber] = useState("");
  const [bookBarcode, setBookBarcode] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // --- 1. جلب بيانات المشتركين ---
  const loadMemberOptions = (inputValue: string) => {
    if (!inputValue) return Promise.resolve([]);

    return axios.get(`/api/Subscription/member-names?MemberName=${encodeURIComponent(inputValue)}`, {
      headers: getAuthHeaders(),
    })
        .then(res => {
          let data = res.data;
          // التعامل مع تغليف البيانات من API
          if (data && data.$values) data = data.$values;
          const items = Array.isArray(data) ? data : [];

          return items.map((m: any) => ({
            label: m.fullName || m.FullName || m.memberName || "اسم غير معروف",
            value: m.memberId || m.MemberId || m.id,
          }));
        })
        .catch(() => []);
  };

  // --- 2. جلب بيانات الكتب (تم التعديل هنا لضمان ظهور الخيارات) ---
  const loadBookOptions = async (inputValue: string) => {
    if (!inputValue || inputValue.length < 1) return []; // لا يبحث إلا بعد كتابة حرفين

    try {
      const res = await axios.get(
          `/api/Book/books/titles?BookTitle=${encodeURIComponent(inputValue)}`,
          { headers: getAuthHeaders() }
      );

      let rawData = res.data;
      // ميكانزم فحص البيانات (Array أو Wrapped Object)
      let items = [];
      if (Array.isArray(rawData)) {
        items = rawData;
      } else if (rawData?.$values) {
        items = rawData.$values;
      } else if (rawData?.data) {
        items = Array.isArray(rawData.data) ? rawData.data : (rawData.data?.$values || []);
      }

      return items.map((b: any) => ({
        // فحص كل الاحتمالات لأسماء الحقول القادمة من الـ API
        label: b.bookTitle || b.BookTitle || b.title || "عنوان غير معروف",
        value: String(b.bookId || b.BookId || b.id || b.Id),
      }));
    } catch (error) {
      console.error("Book Search Error:", error);
      return [];
    }
  };

  const handleFinalLoan = async () => {
    if ((!selectedMember && !subscriberNumber) || (!selectedBook && !bookBarcode)) {
      toast.error("يرجى إكمال البيانات المطلوبة");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        memberID: selectedMember ? parseInt(selectedMember.value) : null,
        bookID: selectedBook ? parseInt(selectedBook.value) : null,
        memberNumber: subscriberNumber || null,
        barcode: bookBarcode || null
      };

      await axios.post("/api/Borrow/borrow", payload, {
        headers: getAuthHeaders()
      });

      toast.success("تمت عملية الإعارة بنجاح!");
      setConfirmOpen(false);

      setBookBarcode("");
      setSubscriberNumber("");
      setSelectedMember(null);
      setSelectedBook(null);

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "فشلت العملية، تأكد من البيانات";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      borderRadius: '0.75rem',
      borderColor: '#e2e8f0',
      minHeight: '48px',
      boxShadow: 'none',
      '&:hover': { borderColor: '#3b82f6' }
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) // لضمان ظهور القائمة فوق الديالوج
  };

  return (
      <div className="max-w-4xl mx-auto p-4 space-y-6" dir="rtl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-primary">إعارة كتاب</h1>
          <button onClick={() => window.location.reload()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <RefreshCw className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* قسم المستعير */}
          <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-4 border-t-4 border-t-primary">
            <div className="flex items-center gap-2 text-primary font-bold">
              <UserPlus className="w-5 h-5" /> المستعير
            </div>

            <AsyncSelect
                cacheOptions
                isClearable
                defaultOptions
                loadOptions={loadMemberOptions}
                value={selectedMember}
                menuPortalTarget={document.body}
                onChange={(opt: any) => {
                  setSelectedMember(opt);
                  if (opt) setSubscriberNumber("");
                }}
                placeholder="ابحث باسم المشترك..."
                loadingMessage={() => "جاري البحث..."}
                noOptionsMessage={() => "لا توجد نتائج"}
                styles={customSelectStyles}
            />

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs">أو</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <input
                type="text"
                className={inputClass}
                value={subscriberNumber}
                onChange={(e) => {
                  setSubscriberNumber(e.target.value);
                  if (e.target.value) setSelectedMember(null);
                }}
                placeholder="أدخل رقم المشترك يدوياً"
            />
          </div>

          {/* قسم الكتاب */}
          <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-4 border-t-4 border-t-orange-500">
            <div className="flex items-center gap-2 text-orange-500 font-bold">
              <BookOpen className="w-5 h-5" /> الكتاب
            </div>

            <AsyncSelect
                cacheOptions
                isClearable
                loadOptions={loadBookOptions}
                defaultOptions={false}
                value={selectedBook}
                menuPortalTarget={document.body} // حل مشكلة اختفاء القائمة خلف العناصر
                onChange={(opt: any) => {
                  setSelectedBook(opt);
                  if (opt) setBookBarcode("");
                }}
                placeholder="ابحث بعنوان الكتاب..."
                loadingMessage={() => "جاري البحث..."}
                noOptionsMessage={() => "لا توجد نتائج"}
                styles={customSelectStyles}
            />

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs">أو</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <input
                type="text"
                className={inputClass}
                value={bookBarcode}
                onChange={(e) => {
                  setBookBarcode(e.target.value);
                  if (e.target.value) setSelectedBook(null);
                }}
                placeholder="أدخل باركود الكتاب"
            />
          </div>
        </div>

        <button
            onClick={() => setConfirmOpen(true)}
            disabled={(!selectedMember && !subscriberNumber) || (!selectedBook && !bookBarcode)}
            className={cn(
                "w-full py-5 text-white rounded-2xl font-black shadow-xl text-xl transition-all flex items-center justify-center gap-3",
                ((!selectedMember && !subscriberNumber) || (!selectedBook && !bookBarcode)) ? "bg-slate-300 cursor-not-allowed" : "bg-primary hover:opacity-90"
            )}
        >
          <CheckCircle className="w-6 h-6" /> تأكيد عملية الإعارة
        </button>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="rounded-3xl max-w-md text-right" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right text-2xl font-bold">تأكيد الإعارة</DialogTitle>
            </DialogHeader>
            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed space-y-4 mt-4">
              <div className="flex justify-between items-start border-b pb-2">
                <span className="text-slate-500">المستعير:</span>
                <b className="text-primary text-left">{selectedMember ? selectedMember.label : subscriberNumber}</b>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-500">الكتاب:</span>
                <b className="text-orange-600 text-left">{selectedBook ? selectedBook.label : bookBarcode}</b>
              </div>
            </div>
            <DialogFooter className="mt-6 flex flex-row gap-3">
              <button onClick={() => setConfirmOpen(false)} className="flex-1 py-3 rounded-xl border-2 font-bold hover:bg-slate-50 transition-colors">تراجع</button>
              <button
                  onClick={handleFinalLoan}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-opacity"
              >
                {saving ? "جاري الحفظ..." : "تأكيد نهائي"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
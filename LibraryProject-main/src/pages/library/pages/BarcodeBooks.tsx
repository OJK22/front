import { useState, useRef, useEffect, useCallback } from "react";
import JsBarcode from "jsbarcode";
import Swal from "sweetalert2"; // استيراد المكتبة
import withReactContent from "sweetalert2-react-content";

import "@/Index.css";

const MySwal = withReactContent(Swal);

// تنسيق افتراضي لـ SweetAlert ليكون متناسق مع التصميم
const Toast = MySwal.mixin({
  target: "#rtl-container",
  customClass: {
    confirmButton: "btn-gov-primary px-6 py-2 mx-2",
    cancelButton: "btn-gov-secondary px-6 py-2 mx-2",
  },
  buttonsStyling: false,
});

interface BarcodeSticker {
  value: string;
}

const BarcodeItem = ({ value }: { value: string }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 60,
          displayValue: false,
          margin: 5,
        });
      } catch (e) {
        console.error("Error generating barcode:", e);
      }
    }
  }, [value]);

  return (
      <div
          className="barcode-item flex flex-col items-center justify-between text-center m-2 p-1.5 border border-border rounded bg-card"
          style={{ width: 180, height: 130 }}
      >
        <div className="barcode-title text-sm font-bold text-foreground w-full text-center">
          {value}
        </div>
        <svg ref={svgRef} className="w-[90%]" style={{ height: 60 }} />
        <div className="barcode-footer text-xs font-bold text-muted-foreground mb-1 w-full text-center">
          0000{value}00001
        </div>
      </div>
  );
};

const Barcode = () => {
  const [genType, setGenType] = useState<"single" | "range">("single");
  const [singleValue, setSingleValue] = useState("123456789");
  const [fromNum, setFromNum] = useState("");
  const [toNum, setToNum] = useState("");
  const [barcodes, setBarcodes] = useState<BarcodeSticker[]>([]);

  const printRef = useRef<HTMLDivElement>(null);

  const generate = useCallback(() => {
    if (genType === "single") {
      const val = singleValue.trim();
      if (!val) {
        Toast.fire({
          icon: "error",
          title: "عذراً!",
          text: "الرجاء إدخال قيمة صحيحة للباركود.",
          confirmButtonText: "مفهوم",
        });
        setBarcodes([]);
        return;
      }
      setBarcodes([{ value: val }]);

      // تنبيه نجاح صغير (Toast)
      Toast.fire({
        icon: "success",
        title: "تم التوليد بنجاح",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } else {
      const from = parseInt(fromNum);
      const to = parseInt(toNum);

      if (isNaN(from) || isNaN(to) || from > to || from < 0) {
        Toast.fire({
          icon: "warning",
          title: "خطأ في النطاق",
          text: "الرجاء التأكد من الأرقام المدخلة (يجب أن يكون الرقم الثاني أكبر من الأول).",
          confirmButtonText: "تعديل",
        });
        setBarcodes([]);
        return;
      }

      if (to - from + 1 > 200) {
        Toast.fire({
          icon: "info",
          title: "نطاق كبير جداً",
          text: "الحد الأقصى هو 200 باركود لتجنب بطء المتصفح.",
          confirmButtonText: "حسناً",
        });
        setBarcodes([]);
        return;
      }

      const items: BarcodeSticker[] = [];
      for (let i = from; i <= to; i++) {
        items.push({ value: i.toString() });
      }

      setBarcodes(items);

      Toast.fire({
        icon: "success",
        title: `تم توليد ${items.length} باركود بنجاح`,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    }
  }, [genType, singleValue, fromNum, toNum]);

  const handlePrint = () => {
    if (barcodes.length === 0) {
      Toast.fire({
        icon: "question",
        title: "لا يوجد بيانات",
        text: "يجب توليد الباركود أولاً قبل عملية الطباعة.",
        confirmButtonText: "فهمت",
      });
      return;
    }

    // رسالة تأكيد قبل الطباعة
    Toast.fire({
      title: "بدء الطباعة؟",
      text: `سيتم تحضير ${barcodes.length} ملصق للطباعة.`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "نعم، اطبع الآن",
      cancelButtonText: "إلغاء",
    }).then((result) => {
      if (result.isConfirmed) {
        const content = printRef.current?.innerHTML;
        const printWindow = window.open("", "", "width=900,height=700");

        if (printWindow && content) {
          printWindow.document.write(`
            <html>
              <head>
                <title>طباعة الباركود</title>
                <style>
                  body { direction: rtl; padding: 20px; font-family: Arial, sans-serif; }
                  .barcode-container { display: flex; flex-wrap: wrap; justify-content: center; }
                  .barcode-item { 
                    width: 180px; height: 130px; border: 1px solid #ddd; 
                    border-radius: 8px; margin: 8px; padding: 6px; 
                    display: flex; flex-direction: column; 
                    justify-content: space-between; align-items: center; 
                    page-break-inside: avoid; 
                  }
                  svg { width: 90%; height: 60px; }
                </style>
              </head>
              <body>
                <div class="barcode-container">${content}</div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }
    });
  };

  return (
      <div dir="rtl" id="rtl-container">
        <div className="max-w-3xl mx-auto">
          <div className="gov-card mb-6 shadow-lg border-t-4 border-primary">
            <div className="gov-card-body">
              <h2 className="text-2xl font-bold text-center text-primary mb-6">
                🖨️ نظام توليد وطباعة الباركود
              </h2>

              <div className="mb-4 bg-muted/30 p-4 rounded-lg">
                <label className="gov-label font-bold mb-2 block">نوع التوليد:</label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                        type="radio"
                        checked={genType === "single"}
                        onChange={() => setGenType("single")}
                        className="w-4 h-4 accent-primary"
                    />
                    <span>قيمة واحدة</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                        type="radio"
                        checked={genType === "range"}
                        onChange={() => setGenType("range")}
                        className="w-4 h-4 accent-primary"
                    />
                    <span>نطاق أرقام</span>
                  </label>
                </div>
              </div>

              {genType === "single" ? (
                  <div className="mb-4">
                    <label className="gov-label">القيمة / النص:</label>
                    <input
                        type="text"
                        className="gov-input w-full text-center text-lg font-mono tracking-widest"
                        value={singleValue}
                        onChange={(e) => setSingleValue(e.target.value)}
                        placeholder="أدخل النص هنا..."
                    />
                  </div>
              ) : (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="gov-label">من رقم:</label>
                      <input
                          type="number"
                          className="gov-input w-full text-center"
                          value={fromNum}
                          onChange={(e) => setFromNum(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="gov-label">إلى رقم:</label>
                      <input
                          type="number"
                          className="gov-input w-full text-center"
                          value={toNum}
                          onChange={(e) => setToNum(e.target.value)}
                      />
                    </div>
                  </div>
              )}

              <div className="flex gap-4">
                <button
                    onClick={generate}
                    className="btn-gov-primary flex-[2] py-3 text-lg transition-transform active:scale-95"
                >
                  عرض الباركود
                </button>

                <button
                    onClick={handlePrint}
                    className="flex-1 py-3 rounded-xl font-semibold text-white shadow-md hover:opacity-90 transition-all active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #10b981, #059669)",
                    }}
                >
                  طباعة
                </button>
              </div>
            </div>
          </div>

          <div className="gov-card shadow-inner min-h-[200px]">
            <div className="gov-card-body">
              <div ref={printRef} className="barcode-container flex flex-wrap justify-center gap-2">
                {barcodes.length > 0 ? (
                    barcodes.map((b, i) => <BarcodeItem key={i} value={b.value} />)
                ) : (
                    <div className="flex flex-col items-center opacity-30 py-10">
                      <span className="text-6xl mb-2">📊</span>
                      <p>لا توجد باركودات لعرضها حالياً</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Barcode;
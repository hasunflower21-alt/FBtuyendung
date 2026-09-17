import React, { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Eye,
  Shuffle,
  Trash2,
  Check,
  Upload,
  Layers,
  Edit3,
} from "lucide-react";
import { resolveSpintax, calculateCombinations } from "../utils/spintax";

interface PostComposerProps {
  rawContent: string;
  setRawContent: (val: string) => void;
  spintaxContent: string;
  setSpintaxContent: (val: string) => void;
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  onGoToNextTab: () => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  rawContent,
  setRawContent,
  spintaxContent,
  setSpintaxContent,
  images,
  setImages,
  onGoToNextTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"spintax" | "raw">("spintax");
  const [mobilePane, setMobilePane] = useState<"editor" | "preview" | "both">("both");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [variationIntensity] = useState<"minimal" | "moderate">("minimal");
  const [previewVariations, setPreviewVariations] = useState<string[]>([]);
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const combinations = calculateCombinations(spintaxContent);

  // Generate 5 spin samples
  const handleGenerateVariations = () => {
    const samples: string[] = [];
    for (let i = 0; i < 5; i++) {
      samples.push(resolveSpintax(spintaxContent));
    }
    setPreviewVariations(samples);
    setShowVariationsModal(true);
  };

  // AI Generator via backend with minimal variation instruction
  const handleGenerateSpintaxWithAI = async () => {
    if (!rawContent.trim() && !spintaxContent.trim()) {
      alert("Vui lòng nhập nội dung bài viết trước khi tạo Spintax.");
      return;
    }

    setIsGeneratingAI(true);
    setAiMessage(null);
    try {
      const textToTransform = rawContent.trim() || spintaxContent.trim();
      const response = await fetch("/api/ai/spintax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToTransform,
          variationIntensity: variationIntensity,
        }),
      });

      const data = await response.json();
      if (data.spintax) {
        setSpintaxContent(data.spintax);
        setActiveSubTab("spintax");
        setAiMessage(
          data.message ||
            "✅ Đã tạo biến thể nhẹ: Giữ trọn vẹn 95% câu từ và văn phong gốc của bài viết."
        );
      }
    } catch (err: any) {
      console.error(err);
      setAiMessage("Không thể gọi AI, đã sử dụng cấu hình mặc định.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Add sample image
  const handleAddSampleImage = (url: string) => {
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const currentPreviewSample = resolveSpintax(spintaxContent || rawContent);

  return (
    <div className="space-y-3 sm:space-y-5">
      {/* Mobile View Toggle Bar: Quickly switch between Editor & Preview on mobile to see full overview */}
      <div className="flex sm:hidden items-center justify-between bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-[11px] font-semibold">
        <button
          onClick={() => setMobilePane("both")}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors ${
            mobilePane === "both" ? "bg-blue-50 text-blue-700 shadow-2xs" : "text-slate-600"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Xem Tất Cả</span>
        </button>
        <button
          onClick={() => setMobilePane("editor")}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors ${
            mobilePane === "editor" ? "bg-blue-50 text-blue-700 shadow-2xs" : "text-slate-600"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Soạn Bài</span>
        </button>
        <button
          onClick={() => setMobilePane("preview")}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors ${
            mobilePane === "preview" ? "bg-blue-50 text-blue-700 shadow-2xs" : "text-slate-600"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Mô Phỏng Feed</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
        {/* Left Column: Editor & Media (7 cols on desktop, controlled on mobile) */}
        <div
          className={`lg:col-span-7 space-y-3 sm:space-y-4 ${
            mobilePane === "preview" ? "hidden sm:block" : "block"
          }`}
        >
          {/* Editor Box */}
          <div className="bg-white rounded-xl p-3 sm:p-5 border border-slate-200 shadow-2xs">
            {/* Header row */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                    Nội Dung Bài Viết & Spintax
                  </h2>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                    {combinations > 1 ? `~${combinations.toLocaleString()} biến thể` : "1 biến thể"}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                  Cú pháp <code className="text-blue-700 font-mono bg-blue-50 px-1 py-0.2 rounded font-semibold">{"{từ 1|từ 2}"}</code> đổi nhẹ lời chào, giữ nguyên 95% văn phong.
                </p>
              </div>

              {/* Sub tabs: Spintax vs Raw */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                <button
                  onClick={() => setActiveSubTab("spintax")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all whitespace-nowrap ${
                    activeSubTab === "spintax"
                      ? "bg-white text-blue-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Spintax
                </button>
                <button
                  onClick={() => setActiveSubTab("raw")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all whitespace-nowrap ${
                    activeSubTab === "raw"
                      ? "bg-white text-blue-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Văn Bản Thô
                </button>
              </div>
            </div>

            {/* AI Assistant Banner - Dense & Compact */}
            <div className="mt-2.5 p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded-md bg-blue-600 text-white flex-shrink-0 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-900 block leading-tight">
                    Tạo Biến Thể Nhẹ Bằng AI
                  </span>
                  <span className="text-[10px] text-slate-600 block truncate">
                    Chỉ đổi nhẹ câu chào và lời kết, giữ nguyên toàn bộ giá & thông tin liên hệ.
                  </span>
                </div>
              </div>

              <button
                id="ai-generate-spintax-btn"
                onClick={handleGenerateSpintaxWithAI}
                disabled={isGeneratingAI}
                className="w-full sm:w-auto px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-2xs flex items-center justify-center gap-1 whitespace-nowrap transition-all disabled:opacity-50 flex-shrink-0"
              >
                {isGeneratingAI ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Tạo Spintax Giữ Văn Phong</span>
                  </>
                )}
              </button>
            </div>

            {aiMessage && (
              <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                <span className="font-medium">{aiMessage}</span>
              </div>
            )}

            {/* Textarea - Compact typography */}
            <div className="mt-2.5">
              {activeSubTab === "spintax" ? (
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold mb-1">
                    <span>Nội dung bài viết (Spintax):</span>
                    <span className="font-mono text-slate-400 font-normal">
                      {spintaxContent.length} ký tự
                    </span>
                  </div>
                  <textarea
                    id="spintax-editor-textarea"
                    value={spintaxContent}
                    onChange={(e) => setSpintaxContent(e.target.value)}
                    rows={6}
                    placeholder="{Chào mọi người|Xin chào cả nhà}! {Hôm nay bên em|Shop em hiện đang}..."
                    className="w-full bg-slate-50/60 hover:bg-white focus:bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono leading-relaxed transition-colors"
                  ></textarea>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold mb-1">
                    <span>Nội dung thô (văn bản thường):</span>
                    <span className="font-mono text-slate-400 font-normal">
                      {rawContent.length} ký tự
                    </span>
                  </div>
                  <textarea
                    id="raw-editor-textarea"
                    value={rawContent}
                    onChange={(e) => setRawContent(e.target.value)}
                    rows={6}
                    placeholder="Nhập bài viết bình thường tại đây rồi bấm 'Tạo Spintax Giữ Văn Phong'..."
                    className="w-full bg-slate-50/60 hover:bg-white focus:bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed transition-colors"
                  ></textarea>
                </div>
              )}
            </div>

            {/* Quick Actions below textarea */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
              <button
                id="preview-variations-btn"
                onClick={handleGenerateVariations}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
              >
                <Shuffle className="w-3 h-3 text-amber-600" />
                <span>Xem Thử 5 Biến Thể</span>
              </button>

              <span className="text-[10px] text-slate-500">
                Icon ngẫu nhiên: <code className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">{"{🔥|🌟|⚡}"}</code>
              </span>
            </div>
          </div>

          {/* Media / Image Attachments - Mobile Compact Grid */}
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Hình Ảnh Đính Kèm ({images.length})
                </h3>
              </div>
              <span className="text-[10px] text-slate-500">Đính kèm tự động khi đăng</span>
            </div>

            {/* Compact Image Grid (h-16 to h-20, dense & scannable) */}
            <div className="mt-2.5 space-y-2">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {/* Upload Button */}
                <label className="flex flex-col items-center justify-center h-16 sm:h-20 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg bg-slate-50 hover:bg-blue-50/40 cursor-pointer transition-all p-1 text-center group">
                  <Upload className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform mb-0.5" />
                  <span className="text-[10px] text-slate-700 font-bold leading-tight">Thêm Ảnh</span>
                  <span className="text-[9px] text-slate-400">JPG, PNG</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Uploaded Image Thumbnails */}
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group h-16 sm:h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs"
                  >
                    <img
                      src={img}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xs"
                      title="Xóa ảnh này"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/60 text-[9px] font-medium text-white">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Sample Photo Chips */}
              <div className="pt-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                <span className="text-[10px] text-slate-400 whitespace-nowrap">Ảnh mẫu:</span>
                <button
                  type="button"
                  onClick={() =>
                    handleAddSampleImage(
                      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60"
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium whitespace-nowrap flex-shrink-0"
                >
                  + Cơ Điện
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleAddSampleImage(
                      "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=60"
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium whitespace-nowrap flex-shrink-0"
                >
                  + Công Trình
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleAddSampleImage(
                      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60"
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium whitespace-nowrap flex-shrink-0"
                >
                  + Báo Giá
                </button>
              </div>
            </div>
          </div>

          {/* Next Step Callout */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200 shadow-2xs gap-2">
            <span className="text-[11px] text-slate-600">
              Đã sẵn sàng nội dung và ảnh đính kèm.
            </span>
            <button
              onClick={onGoToNextTab}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0"
            >
              <span>Chọn Nhóm</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        {/* Right Column: Mobile-Ready Facebook Feed Preview (5 cols on desktop, toggleable on mobile) */}
        <div
          className={`lg:col-span-5 space-y-2.5 ${
            mobilePane === "editor" ? "hidden sm:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 whitespace-nowrap">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Mô Phỏng Facebook Feed</span>
            </h3>
            <button
              onClick={() => {
                setSpintaxContent((prev) => prev);
              }}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 whitespace-nowrap"
            >
              <Shuffle className="w-3 h-3" />
              <span>Đổi Biến Thể</span>
            </button>
          </div>

          {/* Facebook Mock Post Card - Scaled for Mobile Clarity */}
          <div className="bg-white text-slate-900 rounded-xl border border-slate-200 shadow-xs overflow-hidden font-sans">
            {/* Post Header */}
            <div className="p-2.5 sm:p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-blue-100 flex-shrink-0">
                  FB
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-xs leading-tight">
                    <span className="font-bold text-slate-900 whitespace-nowrap">
                      Nguyễn Văn An
                    </span>
                    <span className="text-blue-600 text-[10px] font-bold">✓</span>
                    <span className="text-[10px] text-slate-400">▶</span>
                    <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[120px] xs:max-w-[160px]">
                      Hội Cơ Điện & Xây Dựng
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
                    <span>Vừa xong</span>
                    <span>•</span>
                    <span>🌐 Công khai</span>
                  </div>
                </div>
              </div>

              <div className="text-slate-400 text-sm font-bold px-1 flex-shrink-0">
                •••
              </div>
            </div>

            {/* Post Content */}
            <div className="px-2.5 pb-2.5 sm:px-3 sm:pb-3 text-xs leading-relaxed whitespace-pre-line text-slate-800">
              {currentPreviewSample || "Nội dung bài viết sẽ hiển thị tại đây khi bạn nhập vào ô soạn thảo..."}
            </div>

            {/* Image Preview - Compact Grid */}
            {images.length > 0 && (
              <div
                className={`grid gap-0.5 bg-slate-100 border-t border-b border-slate-200 ${
                  images.length === 1
                    ? "grid-cols-1"
                    : images.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-2"
                }`}
              >
                {images.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="relative aspect-video sm:aspect-square overflow-hidden bg-slate-200">
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === 3 && images.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm">
                        +{images.length - 3}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Post Stats & Reactions */}
            <div className="px-2.5 py-1.5 flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-100">
              <span className="flex items-center gap-1">
                <span>👍❤️</span> <span>24 lượt tương tác</span>
              </span>
              <span>3 bình luận • 1 chia sẻ</span>
            </div>

            {/* Like, Comment, Share Action Buttons */}
            <div className="grid grid-cols-3 text-center py-1.5 text-[11px] font-semibold text-slate-600">
              <button className="hover:bg-slate-50 py-1 rounded">Thích</button>
              <button className="hover:bg-slate-50 py-1 rounded">Bình luận</button>
              <button className="hover:bg-slate-50 py-1 rounded">Chia sẻ</button>
            </div>
          </div>
        </div>
      </div>

      {/* Variations Modal */}
      {showVariationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Shuffle className="w-4 h-4 text-amber-600" />
                5 Mẫu Biến Thể Xoay Vòng Thử Nghiệm
              </h3>
              <button
                onClick={() => setShowVariationsModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-2 text-xs divide-y divide-slate-100">
              {previewVariations.map((text, i) => (
                <div key={i} className="pt-2 first:pt-0 space-y-1">
                  <div className="text-[10px] font-bold text-blue-600 uppercase">
                    Mẫu #{i + 1} (Gửi vào nhóm #{i + 1}):
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-800 text-[11px] leading-relaxed whitespace-pre-line font-mono border border-slate-200">
                    {text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowVariationsModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
              >
                Đã Hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

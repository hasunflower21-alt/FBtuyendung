import React, { useState } from "react";
import { Terminal, Copy, Download, Check } from "lucide-react";
import { generatePlaywrightScript } from "../utils/playwrightScript";
import { FacebookGroup, ScheduleConfig } from "../types";

interface PlaywrightExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: FacebookGroup[];
  spintax: string;
  config: ScheduleConfig;
}

export const PlaywrightExportModal: React.FC<PlaywrightExportModalProps> = ({
  isOpen,
  onClose,
  groups,
  spintax,
  config,
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const scriptCode = generatePlaywrightScript(groups, spintax, config);

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([scriptCode], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fb_auto_post.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Mã Nguồn Script Tự Động Hóa Playwright (Node.js)
              </h3>
              <p className="text-xs text-slate-500">
                Chạy độc lập trên máy tính của bạn với profile Chrome đã đăng nhập sẵn Facebook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1.5 rounded-lg"
          >
            ✕ Đóng
          </button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
            <strong className="text-blue-700 font-bold block mb-1">1. Cài đặt Playwright:</strong>
            <code className="bg-slate-100 px-2 py-0.5 rounded text-emerald-700 font-mono text-[11px] block mt-1 border border-slate-200 font-semibold">
              npm install playwright-core
            </code>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
            <strong className="text-amber-800 font-bold block mb-1">2. Sử dụng Profile Chrome thật:</strong>
            <p className="text-slate-600 text-[11px]">
              Chỉ định thư mục <code className="text-slate-800 font-semibold bg-slate-100 px-1 py-0.5 rounded">user-data-dir</code> của Chrome để không cần nhập mật khẩu hay 2FA.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
            <strong className="text-emerald-800 font-bold block mb-1">3. Khởi chạy Script:</strong>
            <code className="bg-slate-100 px-2 py-0.5 rounded text-emerald-700 font-mono text-[11px] block mt-1 border border-slate-200 font-semibold">
              node fb_auto_post.js
            </code>
          </div>
        </div>

        {/* Code editor view */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed">
          <pre className="whitespace-pre overflow-x-auto selection:bg-blue-600 selection:text-white">
            {scriptCode}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-600 font-medium">
            Script đã tích hợp sẵn {groups.filter((g) => g.isActive).length} nhóm và nội dung Spintax hiện tại của bạn.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? "Đã Copy Thành Công!" : "Copy Mã Nguồn"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải File fb_auto_post.js</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

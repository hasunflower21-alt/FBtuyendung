import React, { useState } from "react";
import {
  Users,
  Plus,
  Trash2,
  ExternalLink,
  CheckSquare,
  Square,
  Upload,
  Download,
  Search,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { FacebookGroup } from "../types";

interface GroupManagerProps {
  groups: FacebookGroup[];
  setGroups: React.Dispatch<React.SetStateAction<FacebookGroup[]>>;
  onGoToSchedule: () => void;
}

export const GroupManager: React.FC<GroupManagerProps> = ({
  groups,
  setGroups,
  onGoToSchedule,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterShift, setFilterShift] = useState<"all" | "morning" | "evening">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form states for adding single group
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupUrl, setNewGroupUrl] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState<"discussion" | "marketplace">("discussion");
  const [newGroupShift, setNewGroupShift] = useState<"all" | "morning" | "evening">("all");

  // Form states for bulk import
  const [importText, setImportText] = useState("");

  const handleToggleGroup = (id: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isActive: !g.isActive } : g))
    );
  };

  const handleToggleAll = (active: boolean) => {
    setGroups((prev) => prev.map((g) => ({ ...g, isActive: active })));
  };

  const handleDeleteGroup = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhóm này khỏi danh sách?")) {
      setGroups((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupUrl.trim()) return;

    const newGroup: FacebookGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      url: newGroupUrl.trim(),
      isActive: true,
      category: newGroupCategory,
      shift: newGroupShift,
      lastStatus: "ready",
    };

    setGroups((prev) => [newGroup, ...prev]);
    setNewGroupName("");
    setNewGroupUrl("");
    setShowAddModal(false);
  };

  const handleBatchImport = () => {
    const lines = importText.split("\n");
    const newItems: FacebookGroup[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.includes("|")) {
        const [name, url] = trimmed.split("|").map((s) => s.trim());
        if (url) {
          newItems.push({
            id: `imported-${Date.now()}-${idx}`,
            name: name || `Nhóm FB ${idx + 1}`,
            url,
            isActive: true,
            category: "discussion",
            shift: "all",
            lastStatus: "ready",
          });
        }
      } else if (trimmed.startsWith("http")) {
        newItems.push({
          id: `imported-${Date.now()}-${idx}`,
          name: `Nhóm FB #${groups.length + newItems.length + 1}`,
          url: trimmed,
          isActive: true,
          category: "discussion",
          shift: "all",
          lastStatus: "ready",
        });
      }
    });

    if (newItems.length > 0) {
      setGroups((prev) => [...prev, ...newItems]);
      setImportText("");
      setShowImportModal(false);
    }
  };

  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesShift =
      filterShift === "all" || g.shift === "all" || g.shift === filterShift;
    return matchesSearch && matchesShift;
  });

  const selectedCount = groups.filter((g) => g.isActive).length;

  return (
    <div className="space-y-3 sm:space-y-5">
      {/* Top Header Card - Compact & Full Info */}
      <div className="bg-white rounded-xl p-3 sm:p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 sm:gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Danh Sách Nhóm Mục Tiêu ({groups.length} nhóm)
            </h2>
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              Đang chọn: {selectedCount}/{groups.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Bot lần lượt đăng vào các nhóm đã chọn theo độ trễ an toàn ngẫu nhiên 4 – 8 phút để bảo vệ nick.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 w-full md:w-auto flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Nhóm</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Dán Nhiều Link</span>
          </button>
          <button
            onClick={() => {
              const dataStr =
                "data:text/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify(groups, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", "facebook_groups_config.json");
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs"
            title="Xuất file JSON sao lưu"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Xuất JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên nhóm hoặc link..."
            className="w-full pl-8 pr-2.5 py-1 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Shift Filter & Selection actions */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 flex-wrap">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setFilterShift("all")}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all whitespace-nowrap ${
                filterShift === "all" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tất Cả ({groups.length})
            </button>
            <button
              onClick={() => setFilterShift("morning")}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all whitespace-nowrap ${
                filterShift === "morning" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Ca Sáng
            </button>
            <button
              onClick={() => setFilterShift("evening")}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all whitespace-nowrap ${
                filterShift === "evening" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Ca Tối
            </button>
          </div>

          <div className="flex items-center gap-1 pl-1 text-[11px]">
            <button
              onClick={() => handleToggleAll(true)}
              className="text-blue-600 hover:text-blue-700 font-bold px-1.5 py-0.5 rounded bg-blue-50/50"
            >
              Chọn Hết
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => handleToggleAll(false)}
              className="text-slate-500 hover:text-slate-700 font-medium px-1.5 py-0.5"
            >
              Bỏ Chọn
            </button>
          </div>
        </div>
      </div>

      {/* BẢNG BIỂU CHUẨN MOBILE & DESKTOP (Hiển thị đầy đủ mọi thông tin, bao quát, không bị khuất) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* MOBILE VIEW: DENSE CARD ROWS (Hiển thị trên điện thoại <640px) */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {filteredGroups.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs font-medium">
              Không tìm thấy nhóm nào phù hợp với bộ lọc tìm kiếm.
            </div>
          ) : (
            filteredGroups.map((group, index) => (
              <div
                key={group.id}
                className={`p-2.5 transition-colors ${
                  group.isActive ? "bg-white" : "bg-slate-50/70 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Left: Checkbox + Group Info */}
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <button
                      onClick={() => handleToggleGroup(group.id)}
                      className="mt-0.5 text-blue-600 p-0.5 flex-shrink-0"
                      aria-label="Chọn nhóm này"
                    >
                      {group.isActive ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      {/* Name & Index */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          #{index + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {group.name}
                        </h4>
                        {group.memberCount && (
                          <span className="text-[10px] text-slate-500 font-normal">
                            ({group.memberCount})
                          </span>
                        )}
                      </div>

                      {/* URL */}
                      <div className="mt-0.5 flex items-center gap-1 text-[10px] text-blue-600 font-mono">
                        <a
                          href={group.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline truncate max-w-[200px]"
                        >
                          {group.url}
                        </a>
                        <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 text-slate-400" />
                      </div>

                      {/* Badges row: Full Info in one compact line on mobile */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {/* Category */}
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold whitespace-nowrap ${
                            group.category === "discussion"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          <Tag className="w-2.5 h-2.5" />
                          <span>{group.category === "discussion" ? "Thảo luận" : "Mua bán/Rao vặt"}</span>
                        </span>

                        {/* Shift */}
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                          <Clock className="w-2.5 h-2.5 text-slate-500" />
                          <span>
                            {group.shift === "all"
                              ? "Cả 2 ca"
                              : group.shift === "morning"
                              ? "Ca sáng"
                              : "Ca tối"}
                          </span>
                        </span>

                        {/* Status */}
                        {group.lastStatus === "success" && (
                          <span className="inline-flex items-center gap-0.5 text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded text-[9px] font-bold border border-emerald-200 whitespace-nowrap">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Đã đăng xong</span>
                          </span>
                        )}
                        {group.lastStatus === "pending_approval" && (
                          <span className="inline-flex items-center gap-0.5 text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded text-[9px] font-bold border border-amber-200 whitespace-nowrap">
                            <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                            <span>Chờ duyệt</span>
                          </span>
                        )}
                        {group.lastStatus === "ready" && (
                          <span className="inline-flex items-center text-slate-500 text-[9px] whitespace-nowrap">
                            • Sẵn sàng
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Delete button */}
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                    title="Xóa nhóm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* TABLE VIEW FOR TABLET & DESKTOP (Hiển thị khi >=640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider">
              <tr className="whitespace-nowrap">
                <th className="py-2.5 px-3 w-10 text-center">Chọn</th>
                <th className="py-2.5 px-3">Tên Nhóm & Đường Dẫn Facebook</th>
                <th className="py-2.5 px-3 w-28">Phân Loại</th>
                <th className="py-2.5 px-3 w-24">Ca Đăng</th>
                <th className="py-2.5 px-3 w-32">Trạng Thái</th>
                <th className="py-2.5 px-3 w-12 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-medium text-xs">
                    Không tìm thấy nhóm nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group, index) => (
                  <tr
                    key={group.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      group.isActive ? "bg-white" : "opacity-50 bg-slate-50/40"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => handleToggleGroup(group.id)}
                        className="text-blue-600 hover:text-blue-700 p-0.5 inline-flex items-center justify-center transition-transform active:scale-95"
                      >
                        {group.isActive ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    </td>

                    {/* Name & URL */}
                    <td className="py-2 px-3 min-w-[200px]">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                        <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                          #{index + 1}
                        </span>
                        <span className="truncate max-w-xs md:max-w-md" title={group.name}>
                          {group.name}
                        </span>
                        {group.memberCount && (
                          <span className="text-[10px] text-slate-500 font-normal whitespace-nowrap flex-shrink-0">
                            ({group.memberCount})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-blue-600 font-mono">
                        <a
                          href={group.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline truncate max-w-xs"
                        >
                          {group.url}
                        </a>
                        <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 text-slate-400" />
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                          group.category === "discussion"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        <Tag className="w-2.5 h-2.5" />
                        <span>{group.category === "discussion" ? "Thảo luận" : "Rao vặt/Bán"}</span>
                      </span>
                    </td>

                    {/* Shift */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                        <Clock className="w-2.5 h-2.5 text-slate-500" />
                        <span>
                          {group.shift === "all"
                            ? "Cả 2 ca"
                            : group.shift === "morning"
                            ? "Ca sáng"
                            : "Ca tối"}
                        </span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      {group.lastStatus === "success" && (
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] font-bold whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> <span>Đã đăng xong</span>
                        </span>
                      )}
                      {group.lastStatus === "pending_approval" && (
                        <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px] font-bold whitespace-nowrap">
                          <AlertCircle className="w-3 h-3 text-amber-600" /> <span>Chờ duyệt</span>
                        </span>
                      )}
                      {group.lastStatus === "ready" && (
                        <span className="inline-flex items-center gap-1 text-slate-500 text-[10px] whitespace-nowrap">
                          <span>• Sẵn sàng</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Xóa nhóm này"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & next button */}
        <div className="p-2.5 sm:p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="text-slate-600 text-center sm:text-left text-[11px]">
            Đã chọn <span className="font-bold text-slate-900">{selectedCount}</span> / {groups.length} nhóm để chạy tự động.
          </div>
          <button
            onClick={onGoToSchedule}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
          >
            <span>Tiếp tục: Cài Đặt Lịch & Giãn Cách</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      {/* Add Single Group Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-2xs">
          <form
            onSubmit={handleAddGroup}
            className="bg-white border border-slate-200 rounded-xl w-full max-w-sm p-4 space-y-3 shadow-2xl"
          >
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              Thêm Nhóm Facebook Mới
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tên Nhóm:
              </label>
              <input
                type="text"
                required
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="VD: Hội Xây Dựng & Cơ Điện Hà Nội"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Đường Dẫn URL Nhóm (Facebook):
              </label>
              <input
                type="url"
                required
                value={newGroupUrl}
                onChange={(e) => setNewGroupUrl(e.target.value)}
                placeholder="https://www.facebook.com/groups/..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Phân Loại:
                </label>
                <select
                  value={newGroupCategory}
                  onChange={(e) => setNewGroupCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="discussion">Thảo luận</option>
                  <option value="marketplace">Mua bán / Rao vặt</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ca Đăng:
                </label>
                <select
                  value={newGroupShift}
                  onChange={(e) => setNewGroupShift(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Cả 2 ca</option>
                  <option value="morning">Chỉ ca Sáng</option>
                  <option value="evening">Chỉ ca Tối</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
              >
                Lưu Nhóm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batch Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                Nhập Hàng Loạt Link Nhóm
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕ Đóng
              </button>
            </div>

            <p className="text-[11px] text-slate-600 leading-normal">
              Dán danh sách URL nhóm Facebook vào đây (mỗi nhóm 1 dòng, có thể nhập dạng <code className="text-blue-700 font-semibold bg-blue-50 px-1 rounded">Tên | Link</code>):
            </p>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="https://www.facebook.com/groups/nhom1&#10;Hội Cơ Điện | https://www.facebook.com/groups/nhom2"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            ></textarea>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 font-medium">
                {importText.split("\n").filter((l) => l.trim()).length} nhóm nhận diện
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleBatchImport}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                >
                  Nạp Vào Danh Sách
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

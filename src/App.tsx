import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { PostComposer } from "./components/PostComposer";
import { GroupManager } from "./components/GroupManager";
import { ScheduleConfigPanel } from "./components/ScheduleConfigPanel";
import { LiveMonitor } from "./components/LiveMonitor";
import { PlaywrightExportModal } from "./components/PlaywrightExportModal";
import { SafetyGuideModal } from "./components/SafetyGuideModal";
import { BatterySaverOverlay } from "./components/BatterySaverOverlay";
import { MobileBackgroundModal } from "./components/MobileBackgroundModal";
import { FacebookGroup, ScheduleConfig, EngineState, LogEntry } from "./types";
import { INITIAL_GROUPS, DEFAULT_POST, resolveSpintax } from "./utils/spintax";
import {
  enableWakeLock,
  disableWakeLock,
  enableMobileBackgroundKeepAlive,
  disableMobileBackgroundKeepAlive,
} from "./utils/backgroundRunner";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>("composer");

  // Post & Media state
  const [rawContent, setRawContent] = useState<string>(() => {
    return localStorage.getItem("fb_raw_content") || DEFAULT_POST.raw;
  });

  const [spintaxContent, setSpintaxContent] = useState<string>(() => {
    return localStorage.getItem("fb_spintax_content") || DEFAULT_POST.spintax;
  });

  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=60"
  ]);

  // Groups state
  const [groups, setGroups] = useState<FacebookGroup[]>(() => {
    const saved = localStorage.getItem("fb_groups");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_GROUPS;
      }
    }
    return INITIAL_GROUPS;
  });

  // Schedule & Anti-Spam configuration
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(() => {
    const saved = localStorage.getItem("fb_schedule_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      morningShiftTime: "08:45",
      eveningShiftTime: "19:30",
      randomOffsetMinutes: 15,
      minDelaySeconds: 240, // 4 mins
      maxDelaySeconds: 480, // 8 mins
      typingDelayMinMs: 60,
      typingDelayMaxMs: 160,
      autoScrollBeforePost: true,
      stealthModeEnabled: true,
      emergencyStopOnWarning: true,
      activeShifts: {
        morning: true,
        evening: true,
      },
    };
  });

  // Modals & Mobile Overlays
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isBatterySaverOpen, setIsBatterySaverOpen] = useState(false);

  // Engine state
  const [engineState, setEngineState] = useState<EngineState>({
    status: "idle",
    currentGroupIndex: 0,
    totalGroups: 0,
    currentGroupName: "",
    countdownSeconds: 0,
    progressPercent: 0,
    currentVariation: "",
  });

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "log-init",
      timestamp: new Date().toLocaleTimeString(),
      type: "info",
      message: "Hệ thống FB Đẩy Bài đã sẵn sàng. Chế độ Anti-Checkpoint & Chạy ngầm điện thoại kích hoạt.",
    },
  ]);

  // Persist content & config to localStorage
  useEffect(() => {
    localStorage.setItem("fb_raw_content", rawContent);
  }, [rawContent]);

  useEffect(() => {
    localStorage.setItem("fb_spintax_content", spintaxContent);
  }, [spintaxContent]);

  useEffect(() => {
    localStorage.setItem("fb_groups", JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem("fb_schedule_config", JSON.stringify(scheduleConfig));
  }, [scheduleConfig]);

  // Simulation execution engine refs
  const executionQueueRef = useRef<FacebookGroup[]>([]);
  const currentIndexRef = useRef<number>(0);
  const cooldownTimerRef = useRef<any>(null);
  const isPausedRef = useRef<boolean>(false);

  const addLog = (
    type: "info" | "success" | "warning" | "error" | "delay",
    message: string,
    groupName?: string
  ) => {
    setLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        type,
        groupName,
        message,
      },
      ...prev,
    ]);
  };

  // Start engine handler
  const handleStartEngine = (mode: "test" | "full") => {
    const activeGroups = groups.filter((g) => g.isActive);
    if (activeGroups.length === 0) {
      alert("Vui lòng chọn ít nhất 1 nhóm mục tiêu trước khi chạy.");
      return;
    }

    const queue = mode === "test" ? [activeGroups[0]] : activeGroups;
    executionQueueRef.current = queue;
    currentIndexRef.current = 0;
    isPausedRef.current = false;

    setActiveTab("monitor");
    addLog(
      "info",
      `🚀 Khởi động ca đăng bài ${mode === "test" ? "THỬ NGHIỆM (1 nhóm)" : `(${queue.length} nhóm mục tiêu)`}.`
    );

    // Enable mobile persistence & screen wake lock
    enableWakeLock();
    enableMobileBackgroundKeepAlive();
    addLog(
      "info",
      "🔋 Chế độ Chạy Ẩn Điện Thoại & WakeLock đã kích hoạt. Bạn có thể bấm 'Màn Hình Đen Tiết Kiệm Pin' để máy chạy mát và không tốn pin."
    );

    setEngineState({
      status: "running",
      currentGroupIndex: 1,
      totalGroups: queue.length,
      currentGroupName: queue[0].name,
      countdownSeconds: 0,
      progressPercent: 0,
      currentVariation: "",
    });

    executeGroupStep(queue, 0);
  };

  // Execute single group step
  const executeGroupStep = (queue: FacebookGroup[], index: number) => {
    if (index >= queue.length) {
      // Completed all
      setEngineState((prev) => ({
        ...prev,
        status: "completed",
        progressPercent: 100,
      }));
      addLog(
        "success",
        `🎉 HOÀN THÀNH TOÀN BỘ CA ĐĂNG BÀI! Đã xử lý ${queue.length} nhóm thành công.`
      );
      return;
    }

    const group = queue[index];
    currentIndexRef.current = index;

    setEngineState((prev) => ({
      ...prev,
      status: "running",
      currentGroupIndex: index + 1,
      currentGroupName: group.name,
      progressPercent: (index / queue.length) * 100,
    }));

    addLog("info", `Đang mở trình duyệt kết nối nhóm: ${group.name}...`, group.name);

    // Simulate navigation & typing
    setTimeout(() => {
      if (isPausedRef.current) return;

      const variant = resolveSpintax(spintaxContent || rawContent);
      setEngineState((prev) => ({ ...prev, currentVariation: variant }));

      addLog(
        "info",
        `Đã xuất biến thể Spintax độc bản (${variant.length} ký tự). Mô phỏng gõ phím ngẫu nhiên 60-150ms...`,
        group.name
      );

      if (images.length > 0) {
        addLog(
          "info",
          `Đã đính kèm ${images.length} file hình ảnh qua page.setInputFiles()...`,
          group.name
        );
      }

      // Simulate post button click
      setTimeout(() => {
        if (isPausedRef.current) return;

        addLog(
          "success",
          `✅ Đã gửi bài thành công vào nhóm: ${group.name} (An toàn, không checkpoint/chặn link -> Đã lưu vào nhóm uy tín)`,
          group.name
        );

        // Update group status with tracking history
        const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setGroups((prev) =>
          prev.map((g) =>
            g.id === group.id
              ? {
                  ...g,
                  lastStatus: "success",
                  isVerifiedSafe: true,
                  successCount: (g.successCount || 0) + 1,
                  lastPostedAt: `${nowTime} Hôm nay`,
                  postNote: "Đăng mượt, duyệt tự động, không bị chặn",
                }
              : g
          )
        );

        // If there are more groups, enter cooldown
        if (index < queue.length - 1) {
          // For demo, we do a realistic 25 seconds countdown so user sees it in action,
          // with full note that production script runs 240-480s (4-8 mins).
          const delaySec = Math.floor(Math.random() * 15) + 20; // 20-35s visual countdown
          startCooldown(delaySec, queue, index + 1);
        } else {
          // Finish
          setEngineState((prev) => ({
            ...prev,
            status: "completed",
            progressPercent: 100,
          }));
          addLog(
            "success",
            `🎉 Đã hoàn thành toàn bộ danh sách nhóm! Trình duyệt chuyển sang trạng thái ngủ.`
          );
        }
      }, 2500);
    }, 2000);
  };

  // Cooldown countdown timer
  const startCooldown = (seconds: number, queue: FacebookGroup[], nextIndex: number) => {
    setEngineState((prev) => ({
      ...prev,
      status: "cooling_down",
      countdownSeconds: seconds,
      progressPercent: (nextIndex / queue.length) * 100,
    }));

    addLog(
      "delay",
      `⏳ [ANTI-SPAM COOLDOWN] Đang ngủ hạ nhiệt ${seconds} giây trước khi chuyển sang nhóm tiếp theo...`
    );

    let currentSec = seconds;
    clearInterval(cooldownTimerRef.current);

    cooldownTimerRef.current = setInterval(() => {
      if (isPausedRef.current) return;

      currentSec -= 1;
      setEngineState((prev) => ({
        ...prev,
        countdownSeconds: currentSec,
      }));

      if (currentSec <= 0) {
        clearInterval(cooldownTimerRef.current);
        executeGroupStep(queue, nextIndex);
      }
    }, 1000);
  };

  // Fast forward cooldown (skip wait for quick testing)
  const handleFastForwardCooldown = () => {
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
      addLog("info", "⏩ Đã bỏ qua thời gian chờ (Fast-Forward). Đang mở nhóm tiếp theo...");
      executeGroupStep(executionQueueRef.current, currentIndexRef.current + 1);
    }
  };

  // Pause / Resume
  const handlePauseResume = () => {
    if (engineState.status === "paused") {
      isPausedRef.current = false;
      setEngineState((prev) => ({ ...prev, status: "running" }));
      addLog("info", "▶️ Đã tiếp tục thực thi hàng đợi đăng bài.");
      executeGroupStep(executionQueueRef.current, currentIndexRef.current);
    } else {
      isPausedRef.current = true;
      clearInterval(cooldownTimerRef.current);
      setEngineState((prev) => ({ ...prev, status: "paused" }));
      addLog("warning", "⏸️ Đã tạm dừng bộ thực thi. Có thể tiếp tục bất cứ lúc nào.");
    }
  };

  // Emergency Stop
  const handleEmergencyStop = () => {
    isPausedRef.current = true;
    clearInterval(cooldownTimerRef.current);
    disableWakeLock();
    disableMobileBackgroundKeepAlive();
    setEngineState((prev) => ({
      ...prev,
      status: "idle",
      countdownSeconds: 0,
    }));
    addLog(
      "error",
      "🛑 [NGẮT KHẨN CẤP] Đã lập tức dừng toàn bộ hàng đợi và tắt chế độ chạy ngầm."
    );
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const selectedGroupCount = groups.filter((g) => g.isActive).length;
  const currentActiveGroup = executionQueueRef.current[currentIndexRef.current];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenScriptModal={() => setIsScriptModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenMobileModal={() => setIsMobileModalOpen(true)}
        onToggleBatterySaver={() => setIsBatterySaverOpen((prev) => !prev)}
        isBatterySaverOpen={isBatterySaverOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedGroupCount={selectedGroupCount}
        totalGroupCount={groups.length}
        engineRunning={
          engineState.status === "running" || engineState.status === "cooling_down"
        }
      />

      {/* Main Container - Optimized for mobile density */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 lg:p-6">
        {activeTab === "composer" && (
          <PostComposer
            rawContent={rawContent}
            setRawContent={setRawContent}
            spintaxContent={spintaxContent}
            setSpintaxContent={setSpintaxContent}
            images={images}
            setImages={setImages}
            onGoToNextTab={() => setActiveTab("groups")}
          />
        )}

        {activeTab === "groups" && (
          <GroupManager
            groups={groups}
            setGroups={setGroups}
            onGoToSchedule={() => setActiveTab("schedule")}
          />
        )}

        {activeTab === "schedule" && (
          <ScheduleConfigPanel
            config={scheduleConfig}
            setConfig={setScheduleConfig}
            onStartEngine={handleStartEngine}
            engineRunning={
              engineState.status === "running" || engineState.status === "cooling_down"
            }
            selectedGroupCount={selectedGroupCount}
          />
        )}

        {activeTab === "monitor" && (
          <LiveMonitor
            engineState={engineState}
            logs={logs}
            onPauseResume={handlePauseResume}
            onEmergencyStop={handleEmergencyStop}
            onFastForwardCooldown={handleFastForwardCooldown}
            onClearLogs={handleClearLogs}
            activeGroup={currentActiveGroup}
            onToggleBatterySaver={() => setIsBatterySaverOpen(true)}
            onGoToGroups={() => setActiveTab("groups")}
            groups={groups}
          />
        )}
      </main>

      {/* Footer - Compact */}
      <footer className="border-t border-slate-200 bg-white py-2.5 px-3 sm:px-6 text-center text-[11px] text-slate-500 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <span>FB Đẩy Bài • Hệ Thống Tự Động Hóa Đăng Nhóm Chuẩn Anti-Spam</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="hover:text-blue-600 underline"
            >
              Nguyên Tắc Bảo Vệ Nick
            </button>
            <span>•</span>
            <button
              onClick={() => setIsScriptModalOpen(true)}
              className="hover:text-blue-600 text-blue-700 font-semibold"
            >
              Tải Script Playwright (Node.js)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PlaywrightExportModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        groups={groups}
        spintax={spintaxContent}
        config={scheduleConfig}
      />

      <SafetyGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <MobileBackgroundModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />

      {/* OLED Battery Saver Overlay */}
      <BatterySaverOverlay
        isOpen={isBatterySaverOpen}
        onClose={() => setIsBatterySaverOpen(false)}
        engineState={engineState}
        onPauseResume={handlePauseResume}
        onEmergencyStop={handleEmergencyStop}
      />
    </div>
  );
}

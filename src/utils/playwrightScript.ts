import { FacebookGroup, ScheduleConfig } from "../types";

export function generatePlaywrightScript(
  groups: FacebookGroup[],
  spintax: string,
  config: ScheduleConfig
): string {
  const activeGroups = groups.filter((g) => g.isActive);

  return `/**
 * FB ĐẨY BÀI - PLAYWRIGHT AUTOMATION ENGINE
 * Phiên bản: Chống phát hiện (Stealth Mode) + Giữ Session Chrome thật
 * -------------------------------------------------------------
 * HƯỚNG DẪN CHẠY:
 * 1. Cài đặt thư viện:
 *    npm install playwright-core
 * 
 * 2. Đường dẫn User Data của Chrome (đã đăng nhập sẵn FB của bạn):
 *    - Windows: C:\\\\Users\\\\<Tên_Ban>\\\\AppData\\\\Local\\\\Google\\\\Chrome\\\\User Data
 *    - Mac: /Users/<Tên_Ban>/Library/Application Support/Google/Chrome
 * 
 * 3. Chạy script:
 *    node fb_auto_post.js
 */

const { chromium } = require('playwright-core');
const path = require('path');

// CẤU HÌNH THỜI GIAN & GIÃN CÁCH AN TOÀN
const CONFIG = {
  // Thay đổi đường dẫn này trỏ tới thư mục Profile Chrome của bạn:
  userDataDir: process.env.CHROME_USER_DATA || './chrome-fb-profile',
  executablePath: process.env.CHROME_BIN || undefined, // Tự tìm Chrome mặc định nếu undefined
  minDelaySec: ${config.minDelaySeconds}, // Nghỉ tối thiểu ${Math.round(config.minDelaySeconds / 60)} phút giữa các nhóm
  maxDelaySec: ${config.maxDelaySeconds}, // Nghỉ tối đa ${Math.round(config.maxDelaySeconds / 60)} phút
  typingMinMs: ${config.typingDelayMinMs},
  typingMaxMs: ${config.typingDelayMaxMs},
};

// DANH SÁCH ${activeGroups.length} NHÓM MỤC TIÊU ĐÃ CHỌN
const TARGET_GROUPS = ${JSON.stringify(
    activeGroups.map((g) => ({ id: g.id, name: g.name, url: g.url })),
    null,
    2
  )};

// NỘI DUNG BÀI ĐĂNG (CÚ PHÁP SPINTAX)
const SPINTAX_CONTENT = \`${spintax.replace(/`/g, "\\`").replace(/\${/g, "\\${")}\`;

// HÀM GIẢI MÃ SPINTAX THÀNH BIẾN THỂ ĐỘC BẢN CHO TỪNG NHÓM
function resolveSpintax(text) {
  let spin = text;
  const regex = /\\{([^{}]+)\\}/;
  while (regex.test(spin)) {
    spin = spin.replace(regex, (_, choicesStr) => {
      const choices = choicesStr.split('|');
      return choices[Math.floor(Math.random() * choices.length)];
    });
  }
  return spin;
}

// HÀM NGỦ RANDOM (COOLDOWN)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// MÔ PHỎNG GÕ PHÍM NGƯỜI THẬT
async function humanType(element, text) {
  for (const char of text) {
    await element.type(char, { delay: randomDelay(CONFIG.typingMinMs, CONFIG.typingMaxMs) });
  }
}

async function runAutoPoster() {
  console.log('🚀 Đang khởi động trình duyệt Chrome với profile người dùng thật...');
  
  const context = await chromium.launchPersistentContext(CONFIG.userDataDir, {
    headless: false, // Mở cửa sổ thật để an toàn và bạn dễ theo dõi
    executablePath: CONFIG.executablePath,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
    ],
    viewport: { width: 1280, height: 800 },
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  // Kiểm tra đăng nhập
  console.log('🔍 Kiểm tra trạng thái đăng nhập Facebook...');
  await page.goto('https://www.facebook.com', { waitUntil: 'domcontentloaded' });
  await sleep(3000);

  let successCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < TARGET_GROUPS.length; i++) {
    const group = TARGET_GROUPS[i];
    console.log(\`\\n========================================================\`);
    console.log(\`📌 [\${i + 1}/\${TARGET_GROUPS.length}] Đang xử lý nhóm: \${group.name}\`);
    console.log(\`🌐 Link: \${group.url}\`);

    try {
      await page.goto(group.url, { waitUntil: 'networkidle', timeout: 45000 });
      await sleep(randomDelay(3000, 6000));

      // Cuộn trang nhẹ nhàng như người lướt tin thật
      await page.mouse.wheel(0, randomDelay(300, 700));
      await sleep(2000);

      // Tạo biến thể nội dung độc bản cho nhóm này
      const groupContent = resolveSpintax(SPINTAX_CONTENT);
      console.log(\`📝 Biến thể bài viết:\n"\${groupContent.substring(0, 100)}..."\`);

      // Tìm nút "Bạn viết gì đi..." hoặc "Viết bài thảo luận..."
      const writePostSelector = [
        'div[role="button"]:has-text("Bạn đang nghĩ gì")',
        'div[role="button"]:has-text("Viết bài thảo luận")',
        'div[role="button"]:has-text("Tạo bài viết công khai")',
        'div[role="button"]:has-text("Write something...")'
      ].join(',');

      const writeBtn = await page.waitForSelector(writePostSelector, { timeout: 15000 });
      if (!writeBtn) {
        console.warn('⚠️ Không tìm thấy ô tạo bài viết (có thể nhóm bắt duyệt làm thành viên).');
        skippedCount++;
        continue;
      }

      await writeBtn.click();
      await sleep(2000);

      // Tìm ô nhập nội dung bên trong modal
      const editorBox = await page.waitForSelector('div[role="textbox"][contenteditable="true"]', { timeout: 10000 });
      if (editorBox) {
        await humanType(editorBox, groupContent);
        await sleep(2000);

        // Bấm nút Đăng
        const postButton = await page.$('div[aria-label="Đăng"], div[aria-label="Post"], div[role="button"]:has-text("Đăng")');
        if (postButton) {
          await postButton.click();
          console.log(\`✅ Đã gửi bài thành công vào nhóm: \${group.name}\`);
          successCount++;
        }
      }

    } catch (err) {
      console.error(\`❌ Lỗi xử lý nhóm \${group.name}:\`, err.message);
    }

    // NẾU CHƯA PHẢI NHÓM CUỐI, THỰC HIỆN NGHỈ AN TOÀN (COOLDOWN)
    if (i < TARGET_GROUPS.length - 1) {
      const waitSec = randomDelay(CONFIG.minDelaySec, CONFIG.maxDelaySec);
      console.log(\`⏳ [ANTI-SPAM] Đang ngủ hạ nhiệt \${Math.floor(waitSec / 60)} phút \${waitSec % 60} giây trước khi sang nhóm tiếp theo...\`);
      await sleep(waitSec * 1000);
    }
  }

  console.log(\`\\n🎉 HOÀN THÀNH CA ĐĂNG BÀI!\`);
  console.log(\`Thành công: \${successCount}/\${TARGET_GROUPS.length} nhóm. Bỏ qua: \${skippedCount}\`);
  await context.close();
}

runAutoPoster().catch(console.error);
`;
}

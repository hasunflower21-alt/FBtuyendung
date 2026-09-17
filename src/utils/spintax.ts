import { FacebookGroup } from "../types";

/**
 * Resolves a spintax string into a randomized singular variation.
 * Handles nested or multi-level spintax patterns like {Hello|Hi {there|friend}}
 */
export function resolveSpintax(spintax: string): string {
  if (!spintax) return "";
  let spin = spintax;
  const regex = /\{([^{}]+)\}/;

  while (regex.test(spin)) {
    spin = spin.replace(regex, (_, choicesStr) => {
      const choices = choicesStr.split("|");
      const randomIndex = Math.floor(Math.random() * choices.length);
      return choices[randomIndex] || "";
    });
  }

  return spin;
}

/**
 * Calculates the rough combination count of a spintax text
 */
export function calculateCombinations(spintax: string): number {
  if (!spintax) return 1;
  const matches = spintax.match(/\{([^{}]+)\}/g);
  if (!matches || matches.length === 0) return 1;

  let total = 1;
  for (const match of matches) {
    const inner = match.slice(1, -1);
    const count = inner.split("|").length;
    total *= Math.max(1, count);
  }
  return total;
}

export const INITIAL_GROUPS: FacebookGroup[] = [
  {
    id: "grp-1",
    name: "Cộng Đồng Khởi Nghiệp & Kinh Doanh VN",
    url: "https://www.facebook.com/groups/startup.kinhdoanh.vn",
    category: "discussion",
    memberCount: "320K thành viên",
    isActive: true,
    shift: "all",
    lastStatus: "ready",
  },
  {
    id: "grp-2",
    name: "Hội Mua Bán - Trao Đổi Đồ Gia Dụng & Nội Thất",
    url: "https://www.facebook.com/groups/noithat.giadung.hanoi",
    category: "discussion",
    memberCount: "185K thành viên",
    isActive: true,
    shift: "morning",
    lastStatus: "ready",
  },
  {
    id: "grp-3",
    name: "Cộng Đồng Marketing & Dịch Vụ Online",
    url: "https://www.facebook.com/groups/marketing.online.vietnam",
    category: "discussion",
    memberCount: "410K thành viên",
    isActive: true,
    shift: "all",
    lastStatus: "ready",
  },
  {
    id: "grp-4",
    name: "Diễn Đàn Bất Động Sản & Dự Án Xây Dựng",
    url: "https://www.facebook.com/groups/bds.duan.vietnam",
    category: "discussion",
    memberCount: "250K thành viên",
    isActive: true,
    shift: "morning",
    lastStatus: "ready",
  },
  {
    id: "grp-5",
    name: "Hội Doanh Nghiệp SME & Đối Tác B2B",
    url: "https://www.facebook.com/groups/sme.doanhnghiep.vn",
    category: "discussion",
    memberCount: "98K thành viên",
    isActive: true,
    shift: "all",
    lastStatus: "ready",
  },
  {
    id: "grp-6",
    name: "Chợ Dịch Vụ Kỹ Thuật & Cơ Điện ME",
    url: "https://www.facebook.com/groups/kythuat.codien.me",
    category: "discussion",
    memberCount: "65K thành viên",
    isActive: true,
    shift: "morning",
    lastStatus: "ready",
  },
  {
    id: "grp-7",
    name: "Cộng Đồng Dân Cư Khu Đô Thị Smart City",
    url: "https://www.facebook.com/groups/cu.dan.smartcity",
    category: "discussion",
    memberCount: "140K thành viên",
    isActive: true,
    shift: "evening",
    lastStatus: "ready",
  },
  {
    id: "grp-8",
    name: "Hội Review Sản Phẩm & Mua Sắm Thông Minh",
    url: "https://www.facebook.com/groups/review.muasam.tietkiem",
    category: "discussion",
    memberCount: "520K thành viên",
    isActive: true,
    shift: "evening",
    lastStatus: "ready",
  },
  {
    id: "grp-9",
    name: "Cộng Đồng Kinh Doanh F&B & Quán Cafe",
    url: "https://www.facebook.com/groups/kinhdoanh.fb.vietnam",
    category: "discussion",
    memberCount: "115K thành viên",
    isActive: true,
    shift: "morning",
    lastStatus: "ready",
  },
  {
    id: "grp-10",
    name: "Hội Tìm Kiếm Đối Tác & Đại Lý Phân Phối",
    url: "https://www.facebook.com/groups/daily.phanphoi.toanquoc",
    category: "discussion",
    memberCount: "210K thành viên",
    isActive: true,
    shift: "all",
    lastStatus: "ready",
  },
  {
    id: "grp-11",
    name: "Cộng Đồng Freelancer & Việc Làm Remote",
    url: "https://www.facebook.com/groups/freelance.remote.vn",
    category: "discussion",
    memberCount: "290K thành viên",
    isActive: true,
    shift: "all",
    lastStatus: "ready",
  },
  {
    id: "grp-12",
    name: "Chợ Máy Móc & Thiết Bị Công Nghiệp",
    url: "https://www.facebook.com/groups/thietbi.maymoc.congnghiep",
    category: "discussion",
    memberCount: "82K thành viên",
    isActive: true,
    shift: "morning",
    lastStatus: "ready",
  },
  {
    id: "grp-13",
    name: "Hội Cư Dân Ocean Park & Vinhomes",
    url: "https://www.facebook.com/groups/cudan.oceanpark.vin",
    category: "discussion",
    memberCount: "175K thành viên",
    isActive: true,
    shift: "evening",
    lastStatus: "ready",
  },
  {
    id: "grp-14",
    name: "Cộng Đồng Logistic, Vận Tải & Kho Bãi",
    url: "https://www.facebook.com/groups/vantai.logistics.vietnam",
    category: "discussion",
    memberCount: "135K thành viên",
    isActive: true,
    shift: "morning",
    lastStatus: "ready",
  },
  {
    id: "grp-15",
    name: "Diễn Đàn Xây Dựng, Vật Liệu & Hoàn Thiện",
    url: "https://www.facebook.com/groups/xaydung.vatlieu.hoanthien",
    category: "discussion",
    memberCount: "160K thành viên",
    isActive: true,
    shift: "all",
    lastStatus: "ready",
  },
  {
    id: "grp-16",
    name: "Chợ Đồ Công Nghệ & Thiết Bị Thông Minh",
    url: "https://www.facebook.com/groups/smartdevice.congnghe",
    category: "discussion",
    memberCount: "380K thành viên",
    isActive: true,
    shift: "evening",
    lastStatus: "ready",
  },
  {
    id: "grp-17",
    name: "Hội Chủ Doanh Nghiệp Trẻ Việt Nam",
    url: "https://www.facebook.com/groups/chudoanhnghiep.tre.vn",
    category: "discussion",
    memberCount: "74K thành viên",
    isActive: true,
    shift: "all",
    lastStatus: "ready",
  },
  {
    id: "grp-18",
    name: "Cộng Đồng Thợ Điện Nước & Kỹ Thuật Gia Đình",
    url: "https://www.facebook.com/groups/diennuoc.kythuat.giadinh",
    category: "discussion",
    memberCount: "92K thành viên",
    isActive: true,
    shift: "morning",
    lastStatus: "ready",
  },
  {
    id: "grp-19",
    name: "Hội Giao Lưu Kinh Tế & Thương Mại Sài Gòn",
    url: "https://www.facebook.com/groups/thuongmai.kinhte.saigon",
    category: "discussion",
    memberCount: "195K thành viên",
    isActive: true,
    shift: "evening",
    lastStatus: "ready",
  },
  {
    id: "grp-20",
    name: "Diễn Đàn Giải Pháp Tiết Kiệm Năng Lượng",
    url: "https://www.facebook.com/groups/nangluong.tietkiem.xanh",
    category: "discussion",
    memberCount: "58K thành viên",
    isActive: true,
    shift: "evening",
    lastStatus: "ready",
  },
];

export const DEFAULT_POST = {
  raw: `Xin chào mọi người! Bên mình chuyên tư vấn, thiết kế và thi công hệ thống M&E, điện nước và cơ điện lạnh cho công trình, biệt thự, nhà phố và xưởng sản xuất.
- Đội ngũ kỹ sư trên 8 năm kinh nghiệm thực chiến.
- Thi công đúng kỹ thuật, cam kết tiến độ và bảo hành dài hạn.
- Chi phí tối ưu, báo giá minh bạch và khảo sát tận nơi miễn phí.

Anh em chủ đầu tư hoặc nhà thầu cần kết nối hợp tác vui lòng nhắn tin trực tiếp hoặc liên hệ Zalo: 0987.654.321 nhé! Chúc cả nhà ngày mới làm việc hiệu quả!`,
  spintax: `{Xin chào mọi người|Chào cả nhà|Chào quý anh chị}! {✨|🌟|}

Bên mình chuyên tư vấn, thiết kế và thi công hệ thống M&E, điện nước và cơ điện lạnh cho công trình, biệt thự, nhà phố và xưởng sản xuất.
- Đội ngũ kỹ sư trên 8 năm kinh nghiệm thực chiến.
- Thi công đúng kỹ thuật, cam kết tiến độ và bảo hành dài hạn.
- Chi phí tối ưu, báo giá minh bạch và khảo sát tận nơi miễn phí.

Anh em chủ đầu tư hoặc nhà thầu cần kết nối hợp tác {vui lòng nhắn tin trực tiếp|hãy nhắn tin trực tiếp|liên hệ trực tiếp} hoặc qua Zalo: 0987.654.321 nhé! {🤝|💼|}

{Chúc cả nhà ngày mới làm việc hiệu quả!|Chúc anh em một ngày làm việc nhiều thuận lợi!|Cảm ơn mọi người đã theo dõi bài viết!}`
};

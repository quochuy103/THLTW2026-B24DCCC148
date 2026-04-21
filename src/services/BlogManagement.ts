export interface PostRecord {
  postId: string;
  title: string;
  slug: string;
  thumbnail: string;
  summary: string;
  content: string;
  author: string;
  createdAt: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED';
  viewCount: number;
}

export interface TagRecord {
  tagId: string;
  tagName: string;
  usageCount: number;
}

const POSTS_KEY = 'BLOG_POSTS';
const TAGS_KEY = 'BLOG_TAGS';

export const getPosts = (): PostRecord[] => {
  const data = localStorage.getItem(POSTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const savePosts = (posts: PostRecord[]): void => {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
};

export const getTags = (): TagRecord[] => {
  const data = localStorage.getItem(TAGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTags = (tags: TagRecord[]): void => {
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
};

export const recalcTagUsage = (posts: PostRecord[], tags: TagRecord[]): TagRecord[] => {
  return tags.map((tag) => ({
    ...tag,
    usageCount: posts.filter((p) => p.tags.includes(tag.tagId)).length,
  }));
};

export const incrementViewCount = (slug: string): void => {
  const posts = getPosts();
  const updated = posts.map((p) => (p.slug === slug ? { ...p, viewCount: p.viewCount + 1 } : p));
  savePosts(updated);
};

export const initBlogData = (): void => {
  if (localStorage.getItem(POSTS_KEY)) return;

  const mockTags: TagRecord[] = [
    { tagId: 'TAG001', tagName: 'ReactJS', usageCount: 0 },
    { tagId: 'TAG002', tagName: 'TypeScript', usageCount: 0 },
    { tagId: 'TAG003', tagName: 'UmiJS', usageCount: 0 },
    { tagId: 'TAG004', tagName: 'Ant Design', usageCount: 0 },
    { tagId: 'TAG005', tagName: 'JavaScript', usageCount: 0 },
    { tagId: 'TAG006', tagName: 'CSS', usageCount: 0 },
  ];

  const mockPosts: PostRecord[] = [
    {
      postId: 'POST001',
      title: 'Bắt đầu với ReactJS — Hướng dẫn từ A đến Z',
      slug: 'bat-dau-voi-reactjs',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
      summary:
        'ReactJS là thư viện JavaScript phổ biến nhất hiện nay. Bài viết này sẽ giúp bạn hiểu các khái niệm cơ bản và bắt đầu xây dựng ứng dụng React đầu tiên của mình.',
      content:
        '# Bắt đầu với ReactJS\n\n## Component là gì?\n\nComponent là đơn vị xây dựng cơ bản của một ứng dụng React. Mỗi component là một hàm trả về JSX.\n\n```jsx\nconst HelloWorld = () => {\n  return <h1>Hello, World!</h1>;\n};\n```\n\n## Props và State\n\n- **Props** là dữ liệu được truyền từ component cha xuống component con.\n- **State** là dữ liệu nội bộ của component, có thể thay đổi theo thời gian.\n\n## Hooks\n\nHooks là các hàm đặc biệt cho phép bạn sử dụng state và các tính năng React khác trong function component.\n\n### useState\n\n```jsx\nconst [count, setCount] = useState(0);\n```\n\n### useEffect\n\n```jsx\nuseEffect(() => {\n  document.title = `Bạn đã click ${count} lần`;\n}, [count]);\n```\n\n## Kết luận\n\nReactJS là một công cụ mạnh mẽ. Hãy bắt đầu thực hành ngay hôm nay!',
      author: 'Phạm Quốc Huy',
      createdAt: '2026-01-05T08:00:00.000Z',
      tags: ['TAG001', 'TAG005'],
      status: 'PUBLISHED',
      viewCount: 245,
    },
    {
      postId: 'POST002',
      title: 'TypeScript cho Người mới bắt đầu',
      slug: 'typescript-cho-nguoi-moi',
      thumbnail: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=600&q=80',
      summary:
        'TypeScript thêm kiểu tĩnh vào JavaScript, giúp code an toàn hơn và dễ bảo trì hơn. Cùng tìm hiểu tại sao TypeScript ngày càng trở nên phổ biến trong cộng đồng lập trình viên.',
      content:
        '# TypeScript cho Người mới bắt đầu\n\n## TypeScript là gì?\n\nTypeScript là một superset của JavaScript có thêm kiểu tĩnh (static typing). Mọi code JavaScript đều là TypeScript hợp lệ.\n\n## Lợi ích của TypeScript\n\n1. **Phát hiện lỗi sớm** — Trình biên dịch sẽ báo lỗi trước khi chạy.\n2. **Tự động hoàn thành** — IDE hỗ trợ tốt hơn nhờ type information.\n3. **Dễ tái cấu trúc** — Refactoring an toàn hơn.\n\n## Ví dụ cơ bản\n\n```typescript\ninterface User {\n  name: string;\n  age: number;\n  email?: string;\n}\n\nconst greet = (user: User): string => {\n  return `Xin chào, ${user.name}!`;\n};\n```\n\n## Các kiểu dữ liệu cơ bản\n\n- `string` — Chuỗi ký tự\n- `number` — Số\n- `boolean` — Giá trị true/false\n- `any` — Bất kỳ kiểu nào (tránh dùng)\n- `void` — Không có giá trị trả về',
      author: 'Phạm Quốc Huy',
      createdAt: '2026-01-12T09:30:00.000Z',
      tags: ['TAG002', 'TAG005'],
      status: 'PUBLISHED',
      viewCount: 187,
    },
    {
      postId: 'POST003',
      title: 'Xây dựng ứng dụng với UmiJS Framework',
      slug: 'xay-dung-app-voi-umijs',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
      summary:
        'UmiJS là một framework React mạnh mẽ từ Alibaba. Bài viết này khám phá cách UmiJS giúp bạn xây dựng ứng dụng enterprise-grade nhanh chóng và hiệu quả.',
      content:
        '# Xây dựng ứng dụng với UmiJS\n\n## UmiJS là gì?\n\nUmiJS là một framework React pluggable được phát triển bởi Alibaba. Nó cung cấp routing, build, và nhiều tính năng khác out-of-the-box.\n\n## Tính năng nổi bật\n\n- **File-based routing** — Routes tự động từ cấu trúc thư mục\n- **Plugin system** — Mở rộng dễ dàng\n- **Ant Design Pro** — Tích hợp sẵn\n- **TypeScript support** — Hỗ trợ đầy đủ\n\n## Cấu trúc thư mục\n\n```\nsrc/\n  pages/\n    index.tsx     -> /\n    about.tsx     -> /about\n    users/\n      index.tsx   -> /users\n      [id].tsx    -> /users/:id\n  layouts/\n    index.tsx\n```\n\n## Routing\n\nUmiJS sử dụng file `config/routes.ts` để định nghĩa routes một cách rõ ràng.',
      author: 'Thái Văn Thành',
      createdAt: '2026-01-18T10:00:00.000Z',
      tags: ['TAG001', 'TAG003'],
      status: 'PUBLISHED',
      viewCount: 134,
    },
    {
      postId: 'POST004',
      title: 'Ant Design — Thư viện UI Component cho React',
      slug: 'ant-design-ui-component',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
      summary:
        'Ant Design cung cấp hơn 60 UI components chất lượng cao cho React. Tìm hiểu cách sử dụng Table, Form, Modal và các component phổ biến nhất trong dự án thực tế.',
      content:
        '# Ant Design — UI Component Library\n\n## Giới thiệu\n\nAnt Design là hệ thống thiết kế (design system) và thư viện component React phổ biến từ Alibaba. Với hơn 60 component sẵn có, Ant Design là lựa chọn hàng đầu cho các ứng dụng enterprise.\n\n## Cài đặt\n\n```bash\nnpm install antd\n```\n\n## Các Component thường dùng\n\n### Table\n\nHiển thị dữ liệu dạng bảng với phân trang, sắp xếp và lọc tích hợp sẵn.\n\n### Form\n\nQuản lý form state và validation một cách dễ dàng.\n\n### Modal\n\nHiển thị nội dung hoặc form trong hộp thoại.\n\n## Customization\n\nAnt Design cho phép tùy chỉnh theme thông qua Less variables hoặc CSS-in-JS.',
      author: 'Lê Văn Tiến',
      createdAt: '2026-01-25T14:00:00.000Z',
      tags: ['TAG001', 'TAG004'],
      status: 'PUBLISHED',
      viewCount: 221,
    },
    {
      postId: 'POST005',
      title: 'Quản lý State với React Hooks',
      slug: 'quan-ly-state-voi-hooks',
      thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&q=80',
      summary:
        'useState, useReducer, useContext — ba hook cốt lõi để quản lý state trong React. Bài viết so sánh khi nào nên dùng cái nào và các best practices.',
      content:
        '# Quản lý State với React Hooks\n\n## useState — State đơn giản\n\nDùng khi state là một giá trị đơn giản hoặc object nhỏ.\n\n```jsx\nconst [count, setCount] = useState(0);\nconst [user, setUser] = useState({ name: "", age: 0 });\n```\n\n## useReducer — State phức tạp\n\nDùng khi state có nhiều sub-values hoặc logic phức tạp.\n\n```jsx\nconst reducer = (state, action) => {\n  switch (action.type) {\n    case "increment": return { count: state.count + 1 };\n    case "decrement": return { count: state.count - 1 };\n    default: return state;\n  }\n};\nconst [state, dispatch] = useReducer(reducer, { count: 0 });\n```\n\n## useContext — Chia sẻ state\n\nDùng khi cần chia sẻ state giữa nhiều component mà không muốn prop drilling.',
      author: 'Phạm Quốc Huy',
      createdAt: '2026-02-03T08:30:00.000Z',
      tags: ['TAG001', 'TAG005'],
      status: 'PUBLISHED',
      viewCount: 198,
    },
    {
      postId: 'POST006',
      title: 'CSS Grid và Flexbox — Khi nào dùng cái nào?',
      slug: 'css-grid-va-flexbox',
      thumbnail: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=600&q=80',
      summary:
        'CSS Grid và Flexbox đều là công cụ layout mạnh mẽ. Bài viết giải thích rõ sự khác biệt và hướng dẫn chọn đúng công cụ cho từng bài toán layout cụ thể.',
      content:
        '# CSS Grid và Flexbox\n\n## Flexbox — Layout 1 chiều\n\nFlexbox tốt nhất cho layout theo một chiều (hàng hoặc cột).\n\n```css\n.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n```\n\n## CSS Grid — Layout 2 chiều\n\nCSS Grid tốt nhất cho layout 2 chiều (hàng VÀ cột).\n\n```css\n.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}\n```\n\n## Khi nào dùng cái nào?\n\n| Tình huống | Công cụ |\n|---|---|\n| Navigation bar | Flexbox |\n| Card grid | CSS Grid |\n| Form layout | Flexbox |\n| Page layout | CSS Grid |\n| Button group | Flexbox |',
      author: 'Phạm Thị Dương Hà',
      createdAt: '2026-02-10T11:00:00.000Z',
      tags: ['TAG006'],
      status: 'PUBLISHED',
      viewCount: 156,
    },
    {
      postId: 'POST007',
      title: 'Tối ưu Performance React App',
      slug: 'toi-uu-performance-react',
      thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80',
      summary:
        'React.memo, useMemo, useCallback và lazy loading — những kỹ thuật quan trọng để tối ưu hiệu suất ứng dụng React và cải thiện trải nghiệm người dùng.',
      content:
        '# Tối ưu Performance React App\n\n## React.memo\n\nNgăn component re-render khi props không thay đổi.\n\n```jsx\nconst ExpensiveComponent = React.memo(({ data }) => {\n  return <div>{data}</div>;\n});\n```\n\n## useMemo\n\nCache kết quả tính toán tốn kém.\n\n```jsx\nconst sortedList = useMemo(() => {\n  return [...list].sort((a, b) => a.name.localeCompare(b.name));\n}, [list]);\n```\n\n## useCallback\n\nCache function reference để tránh re-render không cần thiết.\n\n## Code Splitting và Lazy Loading\n\n```jsx\nconst LazyPage = React.lazy(() => import("./HeavyPage"));\n```',
      author: 'Thái Văn Thành',
      createdAt: '2026-02-17T09:00:00.000Z',
      tags: ['TAG001', 'TAG005'],
      status: 'PUBLISHED',
      viewCount: 143,
    },
    {
      postId: 'POST008',
      title: 'Thiết kế API RESTful chuẩn',
      slug: 'thiet-ke-api-restful-chuan',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
      summary:
        'REST API design là kỹ năng quan trọng cho bất kỳ lập trình viên web nào. Hướng dẫn đầy đủ về naming conventions, HTTP methods, status codes và versioning.',
      content:
        '# Thiết kế API RESTful chuẩn\n\n## Nguyên tắc REST\n\n1. **Stateless** — Server không lưu trạng thái client\n2. **Client-Server** — Tách biệt client và server\n3. **Uniform Interface** — Giao diện thống nhất\n\n## HTTP Methods\n\n| Method | Mục đích |\n|---|---|\n| GET | Lấy dữ liệu |\n| POST | Tạo mới |\n| PUT | Cập nhật toàn bộ |\n| PATCH | Cập nhật một phần |\n| DELETE | Xóa |\n\n## Naming Conventions\n\n- Dùng danh từ số nhiều: `/users`, `/posts`\n- Tránh động từ trong URL\n- Dùng kebab-case: `/blog-posts`\n\n## HTTP Status Codes\n\n- `200 OK` — Thành công\n- `201 Created` — Tạo mới thành công\n- `400 Bad Request` — Lỗi client\n- `401 Unauthorized` — Chưa xác thực\n- `404 Not Found` — Không tìm thấy\n- `500 Internal Server Error` — Lỗi server',
      author: 'Lê Văn Tiến',
      createdAt: '2026-02-24T10:30:00.000Z',
      tags: ['TAG005'],
      status: 'PUBLISHED',
      viewCount: 112,
    },
    {
      postId: 'POST009',
      title: 'Deploy ứng dụng React lên Vercel',
      slug: 'deploy-react-len-vercel',
      thumbnail: 'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=600&q=80',
      summary:
        'Vercel là nền tảng deploy lý tưởng cho các ứng dụng React. Hướng dẫn từng bước deploy ứng dụng React của bạn lên Vercel miễn phí trong vòng 5 phút.',
      content:
        '# Deploy ứng dụng React lên Vercel\n\n## Vercel là gì?\n\nVercel là nền tảng cloud cho frontend deployment, tối ưu cho React, Next.js và các framework hiện đại.\n\n## Các bước Deploy\n\n### 1. Chuẩn bị project\n\n```bash\nnpm run build\n```\n\nĐảm bảo build thành công và không có lỗi.\n\n### 2. Push lên GitHub\n\n```bash\ngit add .\ngit commit -m "feat: ready for deployment"\ngit push origin main\n```\n\n### 3. Import vào Vercel\n\n1. Đăng nhập [vercel.com](https://vercel.com)\n2. Click "New Project"\n3. Import GitHub repository\n4. Vercel tự động detect React app\n5. Click "Deploy"\n\n### 4. Cấu hình Environment Variables\n\nThêm env vars trong Settings > Environment Variables.\n\n## Custom Domain\n\nSau khi deploy, bạn có thể thêm custom domain trong project settings.',
      author: 'Phạm Quốc Huy',
      createdAt: '2026-03-03T08:00:00.000Z',
      tags: ['TAG001', 'TAG005'],
      status: 'PUBLISHED',
      viewCount: 89,
    },
    {
      postId: 'POST010',
      title: 'Git Flow — Quy trình làm việc với Git',
      slug: 'git-flow-quy-trinh',
      thumbnail: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=600&q=80',
      summary:
        'Git Flow là một mô hình branching strategy giúp team làm việc hiệu quả hơn. Tìm hiểu về main, develop, feature, release và hotfix branches.',
      content:
        '# Git Flow — Quy trình làm việc với Git\n\n## Git Flow là gì?\n\nGit Flow là một mô hình branching được đề xuất bởi Vincent Driessen, giúp quản lý code trong dự án lớn có nhiều người tham gia.\n\n## Các Branch chính\n\n### main / master\nChứa code production, luôn ổn định.\n\n### develop\nBranch phát triển chính, chứa các tính năng đã hoàn thành.\n\n### feature/*\nMỗi tính năng mới tạo một branch riêng:\n```bash\ngit checkout -b feature/login-page develop\n```\n\n### release/*\nChuẩn bị release, chỉ fix bugs:\n```bash\ngit checkout -b release/1.0.0 develop\n```\n\n### hotfix/*\nFix lỗi khẩn cấp trên production:\n```bash\ngit checkout -b hotfix/critical-bug main\n```\n\n## Ưu điểm\n\n- Code luôn ổn định trên main\n- Dễ quản lý versioning\n- Team có thể làm việc song song',
      author: 'Thái Văn Thành',
      createdAt: '2026-03-10T09:00:00.000Z',
      tags: ['TAG005'],
      status: 'PUBLISHED',
      viewCount: 167,
    },
    {
      postId: 'POST011',
      title: 'Giới thiệu TypeScript Generics',
      slug: 'typescript-generics',
      thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&q=80',
      summary:
        'Generics là một trong những tính năng mạnh mẽ nhất của TypeScript. Bài viết này giải thích Generics qua các ví dụ thực tế từ đơn giản đến phức tạp.',
      content:
        '# TypeScript Generics\n\n## Generics là gì?\n\nGenerics cho phép bạn viết code tái sử dụng với kiểu dữ liệu linh hoạt, đồng thời vẫn đảm bảo type safety.\n\n## Ví dụ cơ bản\n\n```typescript\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\nconst str = identity<string>("hello"); // string\nconst num = identity<number>(42);     // number\n```\n\n## Generic Interface\n\n```typescript\ninterface ApiResponse<T> {\n  data: T;\n  status: number;\n  message: string;\n}\n\ntype UserResponse = ApiResponse<User>;\ntype PostListResponse = ApiResponse<Post[]>;\n```\n\n## Generic Constraints\n\n```typescript\nfunction getLength<T extends { length: number }>(arg: T): number {\n  return arg.length;\n}\n```\n\n## Khi nào nên dùng Generics?\n\n- Khi function/component hoạt động với nhiều kiểu dữ liệu\n- Khi muốn preserve type information qua transformations\n- Khi xây dựng utility types hoặc helper functions',
      author: 'Phạm Quốc Huy',
      createdAt: '2026-03-18T10:00:00.000Z',
      tags: ['TAG002', 'TAG005'],
      status: 'PUBLISHED',
      viewCount: 78,
    },
    {
      postId: 'POST012',
      title: 'Dark Mode trong React App',
      slug: 'dark-mode-react-app',
      thumbnail: 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=600&q=80',
      summary:
        'Triển khai Dark Mode trong ứng dụng React sử dụng CSS Variables và Context API. Bài viết hướng dẫn cách lưu preference của người dùng và toggle theme mượt mà.',
      content:
        '# Dark Mode trong React App\n\n## CSS Variables — Nền tảng của Theme\n\n```css\n:root {\n  --bg-color: #ffffff;\n  --text-color: #000000;\n}\n\n[data-theme="dark"] {\n  --bg-color: #1a1a2e;\n  --text-color: #ffffff;\n}\n```\n\n## Context API cho Theme\n\n```jsx\nconst ThemeContext = createContext();\n\nexport const ThemeProvider = ({ children }) => {\n  const [theme, setTheme] = useState("light");\n  \n  const toggleTheme = () => {\n    const newTheme = theme === "light" ? "dark" : "light";\n    setTheme(newTheme);\n    document.documentElement.setAttribute("data-theme", newTheme);\n    localStorage.setItem("theme", newTheme);\n  };\n  \n  return (\n    <ThemeContext.Provider value={{ theme, toggleTheme }}>\n      {children}\n    </ThemeContext.Provider>\n  );\n};\n```\n\n## Lưu preference\n\nSử dụng `localStorage` để lưu theme preference và áp dụng khi app khởi động.',
      author: 'Phạm Thị Dương Hà',
      createdAt: '2026-03-25T09:00:00.000Z',
      tags: ['TAG001', 'TAG006'],
      status: 'DRAFT',
      viewCount: 0,
    },
  ];

  saveTags(recalcTagUsage(mockPosts, mockTags));
  savePosts(mockPosts);
};

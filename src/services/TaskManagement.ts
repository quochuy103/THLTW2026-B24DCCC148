// ─── Types ────────────────────────────────────────────────────────────────────

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface TaskRecord {
  taskId: string;
  title: string;
  description: string;
  deadline: string; // ISO date string YYYY-MM-DD
  priority: TaskPriority;
  tags: string[];
  status: TaskStatus;
  createdAt: string; // ISO date string
}

// ─── localStorage Key ─────────────────────────────────────────────────────────

const TASK_KEY = 'tm_tasks';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();

const dd = (day: number, monthOffset = 0) =>
  new Date(y, m + monthOffset, day).toISOString().split('T')[0];

const MOCK_TASKS: TaskRecord[] = [
  {
    taskId: 'T001',
    title: 'Thiết kế giao diện trang chủ',
    description: 'Tạo wireframe và mockup cho trang chủ website bán hàng',
    deadline: dd(10, 0),
    priority: 'HIGH',
    tags: ['UI/UX', 'Design'],
    status: 'DONE',
    createdAt: dd(1, -1),
  },
  {
    taskId: 'T002',
    title: 'Viết tài liệu API',
    description: 'Tài liệu hóa toàn bộ các endpoint REST API của dự án',
    deadline: dd(15, 0),
    priority: 'MEDIUM',
    tags: ['Documentation', 'Backend'],
    status: 'IN_PROGRESS',
    createdAt: dd(3, -1),
  },
  {
    taskId: 'T003',
    title: 'Kiểm thử module đăng nhập',
    description: 'Viết unit test và integration test cho chức năng xác thực người dùng',
    deadline: dd(8, 0),
    priority: 'HIGH',
    tags: ['Testing', 'Auth'],
    status: 'TODO',
    createdAt: dd(5, -1),
  },
  {
    taskId: 'T004',
    title: 'Tối ưu hóa hiệu năng database',
    description: 'Phân tích và thêm index cho các query chậm trong hệ thống',
    deadline: dd(20, 0),
    priority: 'MEDIUM',
    tags: ['Database', 'Performance'],
    status: 'TODO',
    createdAt: dd(7, -1),
  },
  {
    taskId: 'T005',
    title: 'Triển khai CI/CD pipeline',
    description: 'Cấu hình GitHub Actions để tự động build và deploy ứng dụng',
    deadline: dd(1, -1),
    priority: 'HIGH',
    tags: ['DevOps', 'Automation'],
    status: 'IN_PROGRESS',
    createdAt: dd(10, -1),
  },
  {
    taskId: 'T006',
    title: 'Code review Pull Request',
    description: 'Review và merge các PR của thành viên trong team',
    deadline: dd(5, 0),
    priority: 'LOW',
    tags: ['Review', 'Teamwork'],
    status: 'DONE',
    createdAt: dd(12, -1),
  },
  {
    taskId: 'T007',
    title: 'Cập nhật thư viện dependencies',
    description: 'Nâng cấp các package lên phiên bản mới nhất và kiểm tra tính tương thích',
    deadline: dd(25, 0),
    priority: 'LOW',
    tags: ['Maintenance'],
    status: 'TODO',
    createdAt: dd(14, -1),
  },
  {
    taskId: 'T008',
    title: 'Xây dựng tính năng thông báo real-time',
    description: 'Tích hợp WebSocket để gửi thông báo tức thời cho người dùng',
    deadline: dd(3, -1),
    priority: 'HIGH',
    tags: ['Feature', 'WebSocket'],
    status: 'DONE',
    createdAt: dd(16, -1),
  },
];

// ─── CRUD Helpers ─────────────────────────────────────────────────────────────

export const getTasks = (): TaskRecord[] => {
  const data = localStorage.getItem(TASK_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTasks = (tasks: TaskRecord[]): void => {
  localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
};

export const initTaskData = (): void => {
  if (!localStorage.getItem(TASK_KEY)) {
    saveTasks(MOCK_TASKS);
  }
};

// ─── Utility Functions ────────────────────────────────────────────────────────

export const isOverdue = (task: TaskRecord): boolean => {
  if (task.status === 'DONE') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(task.deadline);
  deadline.setHours(0, 0, 0, 0);
  return deadline < today;
};

export const getTaskStats = (
  tasks: TaskRecord[],
): { total: number; completed: number; overdue: number } => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'DONE').length;
  const overdue = tasks.filter((t) => isOverdue(t)).length;
  return { total, completed, overdue };
};

export const generateTaskId = (): string => `T${Date.now()}`;

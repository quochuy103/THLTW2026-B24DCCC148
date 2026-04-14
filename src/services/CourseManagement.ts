export interface InstructorRecord {
  instructorId: string;
  instructorName: string;
}

export interface CourseRecord {
  courseId: string;
  courseName: string;
  instructor: string;
  studentCount: number;
  description: string;
  status: 'OPEN' | 'CLOSED' | 'PAUSED';
}

const INSTRUCTORS_KEY = 'mock_instructors_data';
const COURSES_KEY = 'mock_courses_data';

export const getInstructors = (): InstructorRecord[] => {
  return [
    { instructorId: 'I001', instructorName: 'Phạm Quốc Huy' },
    { instructorId: 'I002', instructorName: 'Thái Văn Thành' },
    { instructorId: 'I003', instructorName: 'Lê Văn Tiến' },
    { instructorId: 'I004', instructorName: 'Phạm Thị Dương Hà' },
  ];
};

export const getCourses = (): CourseRecord[] => {
  const data = localStorage.getItem(COURSES_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return [];
};

export const saveCourses = (courses: CourseRecord[]): void => {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
};

export const initCourseData = (): void => {
  const coursesData = localStorage.getItem(COURSES_KEY);

  if (!coursesData || coursesData.includes('"C001"')) {
    const mockCourses: CourseRecord[] = [
      {
        courseId: 'C01',
        courseName: 'Lập trình Web Cơ bản',
        instructor: 'I001',
        studentCount: 120,
        description: '<p>Khóa học nhập môn HTML, CSS, JS</p>',
        status: 'OPEN'
      },
      {
        courseId: 'C02',
        courseName: 'Cấu trúc Dữ liệu và Giải thuật',
        instructor: 'I003',
        studentCount: 85,
        description: '<p>Cấu trúc dữ liệu và giải thuật trong C++</p>',
        status: 'OPEN'
      },
      {
        courseId: 'C03',
        courseName: 'ReactJS Nâng cao',
        instructor: 'I002',
        studentCount: 0,
        description: '<p>React, Redux, Next.js</p>',
        status: 'PAUSED'
      }
    ];
    saveCourses(mockCourses);
  }
};

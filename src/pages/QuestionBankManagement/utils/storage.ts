export const getParsedStorage = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    return defaultValue;
  }
};

export const setStorage = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export interface KnowledgeCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Subject {
  subjectCode: string;
  subjectName: string;
  credits: number;
}

export type DifficultyLevel = 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';

export interface Question {
  questionId: string;
  subjectCode: string;
  questionContent: string;
  difficultyLevel: DifficultyLevel;
  categoryId: string;
}

export interface ExamTemplate {
  id: string;
  name: string;
  subjectCode: string;
  requirements: {
    categoryId: string | 'any';
    difficultyLevel: DifficultyLevel;
    count: number;
  }[];
}

export interface GeneratedExam {
  id: string;
  templateId: string;
  name: string;
  subjectCode: string;
  questions: Question[];
  createdAt: string;
}

const KEYS = {
  CATEGORIES: 'qbm_categories',
  SUBJECTS: 'qbm_subjects',
  QUESTIONS: 'qbm_questions',
  TEMPLATES: 'qbm_templates',
  EXAMS: 'qbm_exams',
};

export const getCategories = () => getParsedStorage<KnowledgeCategory[]>(KEYS.CATEGORIES, []);
export const saveCategories = (data: KnowledgeCategory[]) => setStorage(KEYS.CATEGORIES, data);

export const getSubjects = () => getParsedStorage<Subject[]>(KEYS.SUBJECTS, []);
export const saveSubjects = (data: Subject[]) => setStorage(KEYS.SUBJECTS, data);

export const getQuestions = () => getParsedStorage<Question[]>(KEYS.QUESTIONS, []);
export const saveQuestions = (data: Question[]) => setStorage(KEYS.QUESTIONS, data);

export const getTemplates = () => getParsedStorage<ExamTemplate[]>(KEYS.TEMPLATES, []);
export const saveTemplates = (data: ExamTemplate[]) => setStorage(KEYS.TEMPLATES, data);

export const getExams = () => getParsedStorage<GeneratedExam[]>(KEYS.EXAMS, []);
export const saveExams = (data: GeneratedExam[]) => setStorage(KEYS.EXAMS, data);

export const generateId = () => Math.random().toString(36).substring(2, 9);

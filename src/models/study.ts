import { useState, useEffect } from 'react';
import { getStorageData, setStorageData, StorageKeys } from '@/utils/storage';

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  date: string; // ISO string YYYY-MM-DD
  durationMinutes: number;
  content: string;
  notes?: string;
}

export interface MonthlyGoal {
  subjectId: string;
  month: string; // Format YYYY-MM
  targetMinutes: number;
}

export interface StudyTrackerData {
  subjects: Subject[];
  sessions: StudySession[];
  goals: MonthlyGoal[];
}

const DEFAULT_DATA: StudyTrackerData = {
  subjects: [
    { id: '1', name: 'Toán Cao Cấp', color: '#1890ff' },
    { id: '2', name: 'Lập Trình Web', color: '#52c41a' },
    { id: '3', name: 'Tiếng Anh', color: '#722ed1' },
  ],
  sessions: [],
  goals: [],
};

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function useStudyModel() {
  const [data, setData] = useState<StudyTrackerData>(() =>
    getStorageData(StorageKeys.STUDY_TRACKER, DEFAULT_DATA)
  );

  useEffect(() => {
    setStorageData(StorageKeys.STUDY_TRACKER, data);
  }, [data]);

  // Subject Actions
  const addSubject = (subject: Omit<Subject, 'id'>) => {
    setData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { ...subject, id: generateId() }],
    }));
  };

  const updateSubject = (id: string, updatedInfo: Partial<Subject>) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...updatedInfo } : s)),
    }));
  };

  const deleteSubject = (id: string) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
      // Also clean up related sessions and goals
      sessions: prev.sessions.filter((s) => s.subjectId !== id),
      goals: prev.goals.filter((g) => g.subjectId !== id),
    }));
  };

  // Session Actions
  const addSession = (session: Omit<StudySession, 'id'>) => {
    setData((prev) => ({
      ...prev,
      sessions: [{ ...session, id: generateId() }, ...prev.sessions],
    }));
  };

  const deleteSession = (id: string) => {
    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== id),
    }));
  };

  // Goal Actions
  const setGoal = (goal: MonthlyGoal) => {
    setData((prev) => {
      const existingKey = prev.goals.findIndex(
        (g) => g.subjectId === goal.subjectId && g.month === goal.month
      );
      if (existingKey >= 0) {
        const newGoals = [...prev.goals];
        newGoals[existingKey] = goal;
        return { ...prev, goals: newGoals };
      }
      return { ...prev, goals: [...prev.goals, goal] };
    });
  };

  return {
    ...data,
    addSubject,
    updateSubject,
    deleteSubject,
    addSession,
    deleteSession,
    setGoal,
  };
}

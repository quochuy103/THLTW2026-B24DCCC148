// ─── Types ────────────────────────────────────────────────────────────────────

export type ExerciseType = 'Cardio' | 'Strength' | 'Yoga' | 'HIIT' | 'Other';
export type WorkoutStatus = 'COMPLETED' | 'MISSED';

export type GoalType = 'Weight Loss' | 'Muscle Gain' | 'Endurance' | 'Other';
export type GoalStatus = 'IN_PROGRESS' | 'ACHIEVED' | 'CANCELED';

export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface WorkoutRecord {
  workoutId: string;
  workoutDate: string; // ISO date string
  exerciseType: ExerciseType;
  durationMinutes: number;
  caloriesBurned: number;
  note: string;
  status: WorkoutStatus;
}

export interface HealthMetricRecord {
  metricId: string;
  date: string; // ISO date string
  weightKg: number;
  heightCm: number;
  bmi: number;
  restingHeartRate: number;
  sleepHours: number;
}

export interface GoalRecord {
  goalId: string;
  goalName: string;
  goalType: GoalType;
  targetValue: number;
  currentValue: number;
  deadline: string; // ISO date string
  status: GoalStatus;
}

export interface ExerciseRecord {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  difficulty: Difficulty;
  shortDescription: string;
  instruction: string;
  caloriesPerHour: number;
}

// ─── localStorage Keys ────────────────────────────────────────────────────────

const WORKOUT_KEY = 'ft_workouts';
const HEALTH_KEY = 'ft_health_metrics';
const GOAL_KEY = 'ft_goals';
const EXERCISE_KEY = 'ft_exercises';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();

const d = (day: number, monthOffset = 0) =>
  new Date(y, m + monthOffset, day).toISOString().split('T')[0];

const MOCK_WORKOUTS: WorkoutRecord[] = [
  { workoutId: 'W001', workoutDate: d(2),  exerciseType: 'Cardio',   durationMinutes: 30, caloriesBurned: 280, note: 'Chạy bộ buổi sáng',        status: 'COMPLETED' },
  { workoutId: 'W002', workoutDate: d(3),  exerciseType: 'Strength', durationMinutes: 45, caloriesBurned: 320, note: 'Ngực và tay',               status: 'COMPLETED' },
  { workoutId: 'W003', workoutDate: d(5),  exerciseType: 'Yoga',     durationMinutes: 60, caloriesBurned: 180, note: 'Yoga buổi tối',             status: 'COMPLETED' },
  { workoutId: 'W004', workoutDate: d(7),  exerciseType: 'HIIT',     durationMinutes: 25, caloriesBurned: 350, note: 'HIIT cardio mạnh',          status: 'COMPLETED' },
  { workoutId: 'W005', workoutDate: d(9),  exerciseType: 'Cardio',   durationMinutes: 40, caloriesBurned: 300, note: 'Đạp xe',                    status: 'COMPLETED' },
  { workoutId: 'W006', workoutDate: d(10), exerciseType: 'Strength', durationMinutes: 50, caloriesBurned: 380, note: 'Lưng và vai',               status: 'COMPLETED' },
  { workoutId: 'W007', workoutDate: d(12), exerciseType: 'Other',    durationMinutes: 35, caloriesBurned: 200, note: 'Bơi lội',                   status: 'MISSED'    },
  { workoutId: 'W008', workoutDate: d(14), exerciseType: 'HIIT',     durationMinutes: 20, caloriesBurned: 300, note: 'Tabata',                    status: 'COMPLETED' },
  { workoutId: 'W009', workoutDate: d(16), exerciseType: 'Cardio',   durationMinutes: 45, caloriesBurned: 350, note: 'Chạy đường dài',            status: 'COMPLETED' },
  { workoutId: 'W010', workoutDate: d(18), exerciseType: 'Strength', durationMinutes: 55, caloriesBurned: 400, note: 'Chân và mông',              status: 'COMPLETED' },
  { workoutId: 'W011', workoutDate: d(20), exerciseType: 'Yoga',     durationMinutes: 50, caloriesBurned: 160, note: 'Yoga phục hồi',             status: 'COMPLETED' },
  { workoutId: 'W012', workoutDate: d(22), exerciseType: 'Cardio',   durationMinutes: 30, caloriesBurned: 260, note: 'Chạy buổi chiều',           status: 'COMPLETED' },
];

const MOCK_HEALTH_METRICS: HealthMetricRecord[] = [
  { metricId: 'HM001', date: d(1, -5), weightKg: 72.5, heightCm: 170, bmi: 25.09, restingHeartRate: 72, sleepHours: 7.0 },
  { metricId: 'HM002', date: d(1, -4), weightKg: 72.0, heightCm: 170, bmi: 24.91, restingHeartRate: 70, sleepHours: 7.5 },
  { metricId: 'HM003', date: d(1, -3), weightKg: 71.2, heightCm: 170, bmi: 24.64, restingHeartRate: 68, sleepHours: 8.0 },
  { metricId: 'HM004', date: d(1, -2), weightKg: 70.8, heightCm: 170, bmi: 24.51, restingHeartRate: 67, sleepHours: 7.5 },
  { metricId: 'HM005', date: d(1, -1), weightKg: 70.5, heightCm: 170, bmi: 24.39, restingHeartRate: 66, sleepHours: 7.0 },
  { metricId: 'HM006', date: d(1,  0), weightKg: 69.8, heightCm: 170, bmi: 24.15, restingHeartRate: 65, sleepHours: 8.0 },
];

const MOCK_GOALS: GoalRecord[] = [
  { goalId: 'G001', goalName: 'Giảm cân xuống 65kg',       goalType: 'Weight Loss', targetValue: 65,  currentValue: 69.8, deadline: d(1, 3),  status: 'IN_PROGRESS' },
  { goalId: 'G002', goalName: 'Chạy bộ 5km không nghỉ',    goalType: 'Endurance',   targetValue: 5,   currentValue: 3.2,  deadline: d(15, 1), status: 'IN_PROGRESS' },
  { goalId: 'G003', goalName: 'Tập gym 20 buổi/tháng',     goalType: 'Muscle Gain', targetValue: 20,  currentValue: 12,   deadline: d(30, 0), status: 'IN_PROGRESS' },
  { goalId: 'G004', goalName: 'Plank 3 phút liên tục',     goalType: 'Endurance',   targetValue: 3,   currentValue: 3,    deadline: d(1, -1), status: 'ACHIEVED'    },
];

const MOCK_EXERCISES: ExerciseRecord[] = [
  { exerciseId: 'E001', exerciseName: 'Push-up',          muscleGroup: 'Chest',     difficulty: 'Easy',   shortDescription: 'Bài tập cơ ngực, tay và vai cơ bản',          instruction: '1. Nằm sấp, tay rộng bằng vai\n2. Hạ người xuống cho đến khi ngực gần chạm sàn\n3. Đẩy người trở lên\n4. Lặp lại 3 set x 15 lần',                                   caloriesPerHour: 300 },
  { exerciseId: 'E002', exerciseName: 'Squat',            muscleGroup: 'Legs',      difficulty: 'Easy',   shortDescription: 'Bài tập cơ đùi, mông và bắp chân',            instruction: '1. Đứng thẳng, chân rộng bằng vai\n2. Hạ người xuống như ngồi ghế\n3. Đùi song song với sàn\n4. Đứng thẳng trở lại\n5. Lặp lại 3 set x 20 lần',                        caloriesPerHour: 350 },
  { exerciseId: 'E003', exerciseName: 'Deadlift',         muscleGroup: 'Back',      difficulty: 'Hard',   shortDescription: 'Bài tập tổng hợp cơ lưng, chân và core',      instruction: '1. Đứng trước tạ, chân rộng hông\n2. Gập hông và đầu gối, nắm tạ\n3. Giữ lưng thẳng, kéo tạ lên theo cơ thể\n4. Đứng thẳng hoàn toàn\n5. Hạ tạ từ từ',          caloriesPerHour: 420 },
  { exerciseId: 'E004', exerciseName: 'Pull-up',          muscleGroup: 'Back',      difficulty: 'Hard',   shortDescription: 'Bài tập cơ lưng rộng và tay sau',             instruction: '1. Nắm xà ngang, tay rộng hơn vai\n2. Kéo người lên đến cằm qua xà\n3. Hạ người từ từ xuống\n4. Lặp lại 3 set x 8 lần',                                            caloriesPerHour: 380 },
  { exerciseId: 'E005', exerciseName: 'Plank',            muscleGroup: 'Core',      difficulty: 'Easy',   shortDescription: 'Bài tập giữ thăng bằng cơ lõi',               instruction: '1. Chống tay và mũi chân xuống sàn\n2. Thân người thẳng từ đầu đến gót\n3. Giữ tư thế 30–60 giây\n4. Thở đều, không nín thở\n5. Lặp lại 3 lần',               caloriesPerHour: 200 },
  { exerciseId: 'E006', exerciseName: 'Dumbbell Curl',    muscleGroup: 'Arms',      difficulty: 'Easy',   shortDescription: 'Bài tập cơ tay trước với tạ đôi',             instruction: '1. Đứng thẳng, tay cầm tạ đôi\n2. Giữ khuỷu tay cố định bên hông\n3. Gập tay đưa tạ lên vai\n4. Hạ tạ từ từ\n5. Lặp lại 3 set x 12 lần mỗi tay',             caloriesPerHour: 280 },
  { exerciseId: 'E007', exerciseName: 'Shoulder Press',   muscleGroup: 'Shoulders', difficulty: 'Medium', shortDescription: 'Bài tập cơ vai với tạ hoặc máy',              instruction: '1. Ngồi hoặc đứng thẳng, tay cầm tạ ngang vai\n2. Đẩy tạ thẳng lên trên đầu\n3. Duỗi tay hoàn toàn nhưng không khóa khớp\n4. Hạ tạ từ từ\n5. 3 set x 12 lần', caloriesPerHour: 320 },
  { exerciseId: 'E008', exerciseName: 'Burpee',           muscleGroup: 'Full Body', difficulty: 'Hard',   shortDescription: 'Bài tập toàn thân cường độ cao',              instruction: '1. Đứng thẳng\n2. Ngồi xổm và đặt tay xuống sàn\n3. Bật chân ra sau tư thế plank\n4. Hạ xuống push-up\n5. Bật chân vào và nhảy lên\n6. 3 set x 10 lần',        caloriesPerHour: 600 },
  { exerciseId: 'E009', exerciseName: 'Leg Press',        muscleGroup: 'Legs',      difficulty: 'Medium', shortDescription: 'Bài tập cơ đùi và mông bằng máy',            instruction: '1. Ngồi vào máy leg press\n2. Đặt chân rộng bằng vai lên tấm đẩy\n3. Đẩy tấm ra hết biên độ\n4. Hạ tấm từ từ về góc 90 độ\n5. 4 set x 15 lần',           caloriesPerHour: 340 },
  { exerciseId: 'E010', exerciseName: 'Russian Twist',    muscleGroup: 'Core',      difficulty: 'Medium', shortDescription: 'Bài tập xoay core với tạ hoặc không tạ',      instruction: '1. Ngồi trên sàn, lưng nghiêng 45 độ\n2. Nâng chân lên khỏi mặt đất\n3. Xoay thân người sang trái và phải\n4. Mỗi bên là 1 lần lặp\n5. 3 set x 20 lần',       caloriesPerHour: 270 },
];


export const getWorkouts = (): WorkoutRecord[] => {
  const data = localStorage.getItem(WORKOUT_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveWorkouts = (items: WorkoutRecord[]): void => {
  localStorage.setItem(WORKOUT_KEY, JSON.stringify(items));
};


export const getHealthMetrics = (): HealthMetricRecord[] => {
  const data = localStorage.getItem(HEALTH_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveHealthMetrics = (items: HealthMetricRecord[]): void => {
  localStorage.setItem(HEALTH_KEY, JSON.stringify(items));
};


export const getGoals = (): GoalRecord[] => {
  const data = localStorage.getItem(GOAL_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveGoals = (items: GoalRecord[]): void => {
  localStorage.setItem(GOAL_KEY, JSON.stringify(items));
};


export const getExercises = (): ExerciseRecord[] => {
  const data = localStorage.getItem(EXERCISE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveExercises = (items: ExerciseRecord[]): void => {
  localStorage.setItem(EXERCISE_KEY, JSON.stringify(items));
};


export const initFitnessData = (): void => {
  if (!localStorage.getItem(WORKOUT_KEY)) saveWorkouts(MOCK_WORKOUTS);
  if (!localStorage.getItem(HEALTH_KEY)) saveHealthMetrics(MOCK_HEALTH_METRICS);
  if (!localStorage.getItem(GOAL_KEY)) saveGoals(MOCK_GOALS);
  if (!localStorage.getItem(EXERCISE_KEY)) saveExercises(MOCK_EXERCISES);
};


export const calcBMI = (weightKg: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
};

export const getBMICategory = (bmi: number): { label: string; color: string } => {
  if (bmi < 18.5) return { label: 'Gầy', color: 'blue' };
  if (bmi < 25)   return { label: 'Bình thường', color: 'green' };
  if (bmi < 30)   return { label: 'Thừa cân', color: 'orange' };
  return             { label: 'Béo phì', color: 'red' };
};


export const calcWorkoutStreak = (workouts: WorkoutRecord[]): number => {
  const completedDates = new Set(
    workouts
      .filter((w) => w.status === 'COMPLETED')
      .map((w) => w.workoutDate.slice(0, 10)),
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const check = new Date(today);
    check.setDate(today.getDate() - i);
    const key = check.toISOString().slice(0, 10);
    if (completedDates.has(key)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};


export const calcMonthlyStats = (
  workouts: WorkoutRecord[],
  goals: GoalRecord[],
): { totalThisMonth: number; totalCalories: number; goalCompletionPct: number } => {
  const n = new Date();
  const thisMonth = workouts.filter((w) => {
    const d2 = new Date(w.workoutDate);
    return d2.getFullYear() === n.getFullYear() && d2.getMonth() === n.getMonth();
  });

  const totalThisMonth = thisMonth.filter((w) => w.status === 'COMPLETED').length;
  const totalCalories = thisMonth
    .filter((w) => w.status === 'COMPLETED')
    .reduce((sum, w) => sum + w.caloriesBurned, 0);

  const inProgress = goals.filter((g) => g.status === 'IN_PROGRESS');
  const avgCompletion =
    inProgress.length === 0
      ? 0
      : inProgress.reduce((sum, g) => {
          const pct = g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0;
          return sum + Math.min(pct, 100);
        }, 0) / inProgress.length;

  return { totalThisMonth, totalCalories, goalCompletionPct: Math.round(avgCompletion) };
};


export const getWeeklyChartData = (
  workouts: WorkoutRecord[],
): { xAxis: string[]; yAxis: number[][] } => {
  const n = new Date();
  const year = n.getFullYear();
  const month = n.getMonth();

  const weeks: { label: string; start: Date; end: Date }[] = [];
  let weekStart = new Date(year, month, 1);
  let weekNum = 1;

  while (weekStart.getMonth() === month) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    if (weekEnd.getMonth() !== month) {
      weekEnd.setMonth(month + 1, 0); // last day of month
    }
    weeks.push({
      label: `Tuần ${weekNum}`,
      start: new Date(weekStart),
      end: new Date(weekEnd),
    });
    weekStart.setDate(weekStart.getDate() + 7);
    weekNum++;
  }

  const data = weeks.map(({ start, end }) =>
    workouts.filter((w) => {
      if (w.status !== 'COMPLETED') return false;
      const wd = new Date(w.workoutDate);
      return wd >= start && wd <= end;
    }).length,
  );

  return {
    xAxis: weeks.map((w) => w.label),
    yAxis: [data],
  };
};



export const getWeightTrend = (
  metrics: HealthMetricRecord[],
): { xAxis: string[]; yAxis: number[][] } => {
  const sorted = [...metrics].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const xAxis = sorted.map((m) => {
    const dt = new Date(m.date);
    return `${dt.getDate()}/${dt.getMonth() + 1}`;
  });

  const yAxis = [sorted.map((m) => m.weightKg)];
  return { xAxis, yAxis };
};


export const calcGoalProgress = (goal: GoalRecord): number => {
  if (goal.targetValue <= 0) return 0;
  return Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
};

import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Card,
  Col,
  Row,
  Statistic,
  Timeline,
  Tag,
  Empty,
} from 'antd';
import {
  FireOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import ColumnChart from '@/components/Chart/ColumnChart';
import LineChart from '@/components/Chart/LineChart';
import {
  initFitnessData,
  getWorkouts,
  getHealthMetrics,
  getGoals,
  calcWorkoutStreak,
  calcMonthlyStats,
  getWeeklyChartData,
  getWeightTrend,
  WorkoutRecord,
} from '@/services/FitnessTracking';
import '@/pages/FitnessTracking/fitness.less';

const EXERCISE_TYPE_COLOR: Record<string, string> = {
  Cardio:   'blue',
  Strength: 'purple',
  Yoga:     'cyan',
  HIIT:     'red',
  Other:    'default',
};

const FitnessDashboard: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    initFitnessData();
    setWorkouts(getWorkouts());
    setHealthMetrics(getHealthMetrics());
    setGoals(getGoals());
  }, []);

  const streak = calcWorkoutStreak(workouts);
  const { totalThisMonth, totalCalories, goalCompletionPct } = calcMonthlyStats(workouts, goals);

  const weeklyData = getWeeklyChartData(workouts);
  const weightTrend = getWeightTrend(healthMetrics);

  const recentWorkouts = [...workouts]
    .sort((a, b) => new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime())
    .slice(0, 5);

  return (
    <PageContainer title="Tổng quan Sức khỏe">

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="ft-stat-card">
            <Statistic
              title="Buổi tập tháng này"
              value={totalThisMonth}
              prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="ft-stat-card">
            <Statistic
              title="Calo đốt tháng này"
              value={totalCalories}
              suffix="kcal"
              prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="ft-stat-card">
            <Statistic
              title="Chuỗi ngày tập liên tục"
              value={streak}
              suffix="ngày"
              prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="ft-stat-card">
            <Statistic
              title="Hoàn thành mục tiêu"
              value={goalCompletionPct}
              suffix="%"
              prefix={<TrophyOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 28 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={12}>
          <Card title="🏋️ Số buổi tập theo tuần (tháng này)">
            {weeklyData.xAxis.length > 0 ? (
              <ColumnChart
                xAxis={weeklyData.xAxis}
                yAxis={weeklyData.yAxis}
                yLabel={['Buổi tập']}
                colors={['#52c41a']}
                height={280}
                formatY={(v) => `${v} buổi`}
              />
            ) : (
              <Empty description="Chưa có dữ liệu tập luyện" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="⚖️ Xu hướng cân nặng (kg)">
            {weightTrend.xAxis.length > 0 ? (
              <LineChart
                xAxis={weightTrend.xAxis}
                yAxis={weightTrend.yAxis}
                yLabel={['Cân nặng (kg)']}
                colors={['#1890ff']}
                height={280}
                formatY={(v) => `${v} kg`}
              />
            ) : (
              <Empty description="Chưa có dữ liệu chỉ số sức khỏe" />
            )}
          </Card>
        </Col>
      </Row>


      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24}>
          <Card title="🕐 Hoạt động gần đây">
            {recentWorkouts.length === 0 ? (
              <Empty description="Chưa có hoạt động nào" />
            ) : (
              <Timeline mode="left">
                {recentWorkouts.map((w) => {
                  const dt = new Date(w.workoutDate);
                  const dateStr = dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  return (
                    <Timeline.Item
                      key={w.workoutId}
                      label={dateStr}
                      dot={
                        w.status === 'COMPLETED'
                          ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                          : <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
                      }
                    >
                      <Tag color={EXERCISE_TYPE_COLOR[w.exerciseType] || 'default'}>
                        {w.exerciseType}
                      </Tag>
                      <span style={{ marginLeft: 8 }}>
                        {w.durationMinutes} phút · {w.caloriesBurned} kcal
                      </span>
                      {w.note && (
                        <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>
                          — {w.note}
                        </span>
                      )}
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            )}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default FitnessDashboard;

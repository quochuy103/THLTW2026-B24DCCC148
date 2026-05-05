import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Col, Row, Statistic, Typography, List, Tag, Empty } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useHistory } from 'umi';
import {
  initTaskData,
  getTasks,
  getTaskStats,
  isOverdue,
  TaskRecord,
} from '@/services/TaskManagement';
import '@/pages/TaskManagement/task.less';

const { Text } = Typography;

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: 'red',
  MEDIUM: 'orange',
  LOW: 'green',
};

const STATUS_LABEL: Record<string, string> = {
  TODO: 'Cần làm',
  IN_PROGRESS: 'Đang làm',
  DONE: 'Hoàn thành',
};

const STATUS_COLOR: Record<string, string> = {
  TODO: 'blue',
  IN_PROGRESS: 'orange',
  DONE: 'green',
};

const TaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const history = useHistory();

  useEffect(() => {
    initTaskData();
    setTasks(getTasks());
  }, []);

  const stats = getTaskStats(tasks);

  const overdueTasks = tasks.filter((t) => isOverdue(t)).slice(0, 5);
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <PageContainer title="Tổng quan Task">

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="tm-stat-card" style={{ borderTop: '4px solid #1677ff' }}>
            <Statistic
              title="Tổng số task"
              value={stats.total}
              prefix={<UnorderedListOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff', fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="tm-stat-card" style={{ borderTop: '4px solid #52c41a' }}>
            <Statistic
              title="Đã hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 32 }}
              suffix={
                <Text type="secondary" style={{ fontSize: 14 }}>
                  / {stats.total}
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="tm-stat-card tm-overdue-badge" style={{ borderTop: '4px solid #ff4d4f' }}>
            <Statistic
              title="Task quá hạn"
              value={stats.overdue}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f', fontSize: 32 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                Task quá hạn
              </span>
            }
            extra={
              <a onClick={() => history.push('/task-management/list')}>Xem tất cả</a>
            }
          >
            {overdueTasks.length === 0 ? (
              <Empty description="Không có task quá hạn 🎉" />
            ) : (
              <List
                dataSource={overdueTasks}
                renderItem={(task) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong style={{ fontSize: 13 }}>{task.title}</Text>
                        <Tag color={PRIORITY_COLOR[task.priority]}>{task.priority}</Tag>
                      </div>
                      <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ClockCircleOutlined style={{ color: '#ff4d4f', fontSize: 11 }} />
                        <Text style={{ color: '#ff4d4f', fontSize: 11 }}>
                          Hạn: {new Date(task.deadline).toLocaleDateString('vi-VN')}
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <ClockCircleOutlined style={{ color: '#1677ff', marginRight: 8 }} />
                Task mới nhất
              </span>
            }
            extra={
              <a onClick={() => history.push('/task-management/list')}>Xem tất cả</a>
            }
          >
            {recentTasks.length === 0 ? (
              <Empty description="Chưa có task nào" />
            ) : (
              <List
                dataSource={recentTasks}
                renderItem={(task) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong style={{ fontSize: 13 }}>{task.title}</Text>
                        <Tag color={STATUS_COLOR[task.status]}>{STATUS_LABEL[task.status]}</Tag>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        {task.tags.map((tag) => (
                          <Tag key={tag} style={{ fontSize: 10 }}>{tag}</Tag>
                        ))}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default TaskDashboard;

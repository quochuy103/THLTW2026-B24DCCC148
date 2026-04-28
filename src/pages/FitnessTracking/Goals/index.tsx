import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Button, Drawer, Form, Input, InputNumber, Select,
  Popconfirm, message, Tag, Row, Col, Card, Progress,
  Typography, Space, Segmented, Empty, Tooltip, DatePicker,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, TrophyOutlined } from '@ant-design/icons';
import moment from 'moment';
import {
  initFitnessData, getGoals, saveGoals, calcGoalProgress,
  GoalRecord, GoalType, GoalStatus,
} from '@/services/FitnessTracking';
import '@/pages/FitnessTracking/fitness.less';

const { Option } = Select;
const { Text } = Typography;

const GOAL_TYPES: GoalType[] = ['Weight Loss', 'Muscle Gain', 'Endurance', 'Other'];
const GOAL_TYPE_COLOR: Record<GoalType, string> = {
  'Weight Loss': 'red',
  'Muscle Gain': 'purple',
  'Endurance': 'blue',
  'Other': 'default',
};

const STATUS_LABEL: Record<GoalStatus, string> = {
  IN_PROGRESS: 'Đang thực hiện',
  ACHIEVED: 'Đã đạt',
  CANCELED: 'Đã hủy',
};
const STATUS_COLOR: Record<GoalStatus, string> = {
  IN_PROGRESS: 'processing',
  ACHIEVED: 'success',
  CANCELED: 'error',
};

const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [inlineValues, setInlineValues] = useState<Record<string, number>>({});
  const [form] = Form.useForm();

  useEffect(() => {
    initFitnessData();
    const loaded = getGoals();
    setGoals(loaded);
    const initInline: Record<string, number> = {};
    loaded.forEach((g) => { initInline[g.goalId] = g.currentValue; });
    setInlineValues(initInline);
  }, []);

  const handleCreate = () => {
    setEditingGoal(null);
    form.resetFields();
    form.setFieldsValue({ status: 'IN_PROGRESS', currentValue: 0 });
    setDrawerVisible(true);
  };

  const handleEdit = (goal: GoalRecord) => {
    setEditingGoal(goal);
    form.setFieldsValue({ ...goal, deadline: goal.deadline ? moment(goal.deadline) : undefined });
    setDrawerVisible(true);
  };

  const handleDelete = (id: string) => {
    const updated = goals.filter((g) => g.goalId !== id);
    setGoals(updated);
    saveGoals(updated);
    message.success('Đã xóa mục tiêu');
  };

  const handleDrawerOk = () => {
    form.validateFields().then((values) => {
      const rec: GoalRecord = {
        ...values,
        deadline: values.deadline ? (values.deadline as moment.Moment).format('YYYY-MM-DD') : '',
        goalId: editingGoal ? editingGoal.goalId : `G${Date.now()}`,
      };
      const updated = editingGoal
        ? goals.map((g) => (g.goalId === editingGoal.goalId ? rec : g))
        : [...goals, rec];
      setGoals(updated);
      saveGoals(updated);
      setInlineValues((prev) => ({ ...prev, [rec.goalId]: rec.currentValue }));
      message.success(editingGoal ? 'Cập nhật mục tiêu thành công' : 'Thêm mục tiêu thành công');
      setDrawerVisible(false);
    });
  };

  const handleInlineUpdate = (goalId: string) => {
    const newVal = inlineValues[goalId] ?? 0;
    const updated = goals.map((g) => {
      if (g.goalId !== goalId) return g;
      const progress = g.targetValue > 0 ? (newVal / g.targetValue) * 100 : 0;
      const newStatus: GoalStatus = progress >= 100 && g.status === 'IN_PROGRESS' ? 'ACHIEVED' : g.status;
      return { ...g, currentValue: newVal, status: newStatus };
    });
    setGoals(updated);
    saveGoals(updated);
    message.success('Đã cập nhật giá trị hiện tại');
  };

  const filteredGoals = statusFilter === 'ALL'
    ? goals
    : goals.filter((g) => g.status === statusFilter);

  return (
    <PageContainer title="Quản lý Mục tiêu">

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <Segmented
          value={statusFilter}
          onChange={(v) => setStatusFilter(String(v))}
          options={[
            { label: 'Tất cả', value: 'ALL' },
            { label: 'Đang thực hiện', value: 'IN_PROGRESS' },
            { label: 'Đã đạt', value: 'ACHIEVED' },
            { label: 'Đã hủy', value: 'CANCELED' },
          ]}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} className="ft-custom-btn ft-btn-primary">
          Thêm mục tiêu
        </Button>
      </div>

      {filteredGoals.length === 0 ? (
        <Card><Empty description="Không có mục tiêu nào" /></Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredGoals.map((goal) => {
            const pct = calcGoalProgress(goal);
            const strokeColor = goal.status === 'ACHIEVED' ? '#52c41a' : goal.status === 'CANCELED' ? '#d9d9d9' : '#1890ff';
            const daysLeft = goal.deadline
              ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000)
              : null;

            return (
              <Col xs={24} sm={12} lg={8} key={goal.goalId}>
                <Card
                  className="ft-goal-card"
                  title={
                    <Space>
                      <TrophyOutlined style={{ color: strokeColor }} />
                      <span style={{ fontWeight: 600 }}>{goal.goalName}</span>
                    </Space>
                  }
                  extra={
                    <Space size={4}>
                      <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined />} size="small" className="ft-btn-icon" onClick={() => handleEdit(goal)} />
                      </Tooltip>
                      <Popconfirm title="Xóa mục tiêu này?" onConfirm={() => handleDelete(goal.goalId)} okText="Xóa" cancelText="Hủy">
                        <Tooltip title="Xóa">
                          <Button type="text" danger icon={<DeleteOutlined />} size="small" className="ft-btn-icon" />
                        </Tooltip>
                      </Popconfirm>
                    </Space>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }} size={10}>
                    <Space>
                      <Tag color={GOAL_TYPE_COLOR[goal.goalType]}>{goal.goalType}</Tag>
                      <Tag color={STATUS_COLOR[goal.status]}>{STATUS_LABEL[goal.status]}</Tag>
                    </Space>

                    <Progress percent={pct} strokeColor={strokeColor} format={(p) => `${p}%`} />

                    <Row gutter={8}>
                      <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Mục tiêu</Text>
                        <div style={{ fontWeight: 600 }}>{goal.targetValue}</div>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Hạn chót</Text>
                        <div style={{ fontWeight: 600, color: daysLeft !== null && daysLeft < 0 ? '#ff4d4f' : undefined }}>
                          {goal.deadline ? new Date(goal.deadline).toLocaleDateString('vi-VN') : '—'}
                          {daysLeft !== null && (
                            <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
                              ({daysLeft >= 0 ? `còn ${daysLeft} ngày` : `quá hạn ${Math.abs(daysLeft)} ngày`})
                            </Text>
                          )}
                        </div>
                      </Col>
                    </Row>

                    {/* Inline update */}
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                        Giá trị hiện tại
                      </Text>
                      <Space>
                        <InputNumber
                          min={0}
                          step={0.1}
                          value={inlineValues[goal.goalId] ?? goal.currentValue}
                          onChange={(v) => setInlineValues((prev) => ({ ...prev, [goal.goalId]: v ?? 0 }))}
                          style={{ width: 100 }}
                          size="small"
                        />
                        <Button size="small" type="primary" ghost onClick={() => handleInlineUpdate(goal.goalId)}>
                          Lưu
                        </Button>
                      </Space>
                    </div>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Drawer
        title={editingGoal ? 'Chỉnh sửa mục tiêu' : 'Thêm mục tiêu mới'}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={480}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setDrawerVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" onClick={handleDrawerOk} className="ft-custom-btn ft-btn-primary">
              {editingGoal ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="goalName" label="Tên mục tiêu" rules={[{ required: true, message: 'Vui lòng nhập tên mục tiêu!' }]}>
            <Input placeholder="VD: Giảm cân xuống 65kg" />
          </Form.Item>
          <Form.Item name="goalType" label="Loại mục tiêu" rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}>
            <Select placeholder="Chọn loại mục tiêu">
              {GOAL_TYPES.map((t) => <Option key={t} value={t}>{t}</Option>)}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="targetValue" label="Giá trị mục tiêu" rules={[{ required: true, message: 'Bắt buộc!' }, { type: 'number', min: 0.01, message: 'Phải > 0' }]}>
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currentValue" label="Giá trị hiện tại">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="deadline" label="Hạn chót" rules={[{ required: true, message: 'Vui lòng chọn hạn chót!' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value="IN_PROGRESS">Đang thực hiện</Option>
              <Option value="ACHIEVED">Đã đạt</Option>
              <Option value="CANCELED">Đã hủy</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default GoalsPage;

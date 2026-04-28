import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Card, Table, Button, Modal, Form, Input, InputNumber,
  Space, Popconfirm, message, Tag, Tooltip, DatePicker, Row, Col, Select,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import {
  initFitnessData, getWorkouts, saveWorkouts,
  WorkoutRecord, ExerciseType, WorkoutStatus,
} from '@/services/FitnessTracking';
import '@/pages/FitnessTracking/fitness.less';

const { Option } = Select;
const { RangePicker } = DatePicker;

const EXERCISE_TYPES: ExerciseType[] = ['Cardio', 'Strength', 'Yoga', 'HIIT', 'Other'];
const TYPE_COLOR: Record<ExerciseType, string> = {
  Cardio: 'blue', Strength: 'purple', Yoga: 'cyan', HIIT: 'red', Other: 'default',
};

const WorkoutLogPage: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WorkoutRecord | null>(null);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState<[moment.Moment | null, moment.Moment | null] | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    initFitnessData();
    setWorkouts(getWorkouts());
  }, []);

  const handleCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ status: 'COMPLETED', workoutDate: moment() });
    setIsModalVisible(true);
  };

  const handleEdit = (record: WorkoutRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({ ...record, workoutDate: moment(record.workoutDate) });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const updated = workouts.filter((w) => w.workoutId !== id);
    setWorkouts(updated);
    saveWorkouts(updated);
    message.success('Đã xóa buổi tập');
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const rec: WorkoutRecord = {
        ...values,
        workoutDate: values.workoutDate.format('YYYY-MM-DD'),
        workoutId: editingRecord ? editingRecord.workoutId : `W${Date.now()}`,
        note: values.note || '',
      };
      const updated = editingRecord
        ? workouts.map((w) => (w.workoutId === editingRecord.workoutId ? rec : w))
        : [...workouts, rec];
      setWorkouts(updated);
      saveWorkouts(updated);
      message.success(editingRecord ? 'Cập nhật thành công' : 'Thêm buổi tập thành công');
      setIsModalVisible(false);
    });
  };

  const filtered = workouts.filter((w) => {
    const matchSearch =
      searchText === '' ||
      w.exerciseType.toLowerCase().includes(searchText.toLowerCase()) ||
      (w.note || '').toLowerCase().includes(searchText.toLowerCase());
    const matchType = typeFilter === '' || w.exerciseType === typeFilter;
    const matchDate = !dateRange?.[0] || !dateRange?.[1] ? true :
      moment(w.workoutDate).isSameOrAfter(dateRange[0], 'day') &&
      moment(w.workoutDate).isSameOrBefore(dateRange[1], 'day');
    return matchSearch && matchType && matchDate;
  });

  const columns = [
    {
      title: 'Ngày tập', dataIndex: 'workoutDate', key: 'workoutDate', width: 120,
      sorter: (a: WorkoutRecord, b: WorkoutRecord) =>
        new Date(a.workoutDate).getTime() - new Date(b.workoutDate).getTime(),
      render: (d: string) => new Date(d).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Loại bài tập', dataIndex: 'exerciseType', key: 'exerciseType', width: 130,
      render: (t: ExerciseType) => <Tag color={TYPE_COLOR[t]}>{t}</Tag>,
    },
    {
      title: 'Thời lượng', dataIndex: 'durationMinutes', key: 'durationMinutes', width: 110,
      sorter: (a: WorkoutRecord, b: WorkoutRecord) => a.durationMinutes - b.durationMinutes,
      render: (v: number) => `${v} phút`,
    },
    {
      title: 'Calo đốt', dataIndex: 'caloriesBurned', key: 'caloriesBurned', width: 110,
      sorter: (a: WorkoutRecord, b: WorkoutRecord) => a.caloriesBurned - b.caloriesBurned,
      render: (v: number) => `${v} kcal`,
    },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note', ellipsis: true },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130,
      render: (s: WorkoutStatus) => <Tag color={s === 'COMPLETED' ? 'green' : 'red'}>
        {s === 'COMPLETED' ? 'Hoàn thành' : 'Bỏ lỡ'}
      </Tag>,
    },
    {
      title: 'Thao tác', key: 'action', width: 90,
      render: (_: any, record: WorkoutRecord) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined />} size="small" className="ft-btn-icon" onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm title="Xóa buổi tập này?" onConfirm={() => handleDelete(record.workoutId)} okText="Xóa" cancelText="Hủy">
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} size="small" className="ft-btn-icon" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Nhật ký Tập luyện">
      <Card>
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }} align="middle">
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} className="ft-custom-btn ft-btn-primary">
              Thêm buổi tập
            </Button>
          </Col>
          <Col flex="auto">
            <Row gutter={[8, 8]} justify="end">
              <Col xs={24} sm={8} md={6}>
                <Select allowClear placeholder="Lọc loại bài tập" style={{ width: '100%' }} value={typeFilter || undefined} onChange={(v) => setTypeFilter(v || '')}>
                  {EXERCISE_TYPES.map((t) => <Option key={t} value={t}>{t}</Option>)}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <RangePicker style={{ width: '100%' }} placeholder={['Từ ngày', 'Đến ngày']} onChange={(d) => setDateRange(d as any)} />
              </Col>
              <Col xs={24} sm={10} md={7}>
                <Input.Search placeholder="Tìm theo loại / ghi chú..." allowClear onChange={(e) => setSearchText(e.target.value)} />
              </Col>
            </Row>
          </Col>
        </Row>

        <Table<WorkoutRecord> columns={columns} dataSource={filtered} rowKey="workoutId" pagination={{ pageSize: 10 }} scroll={{ x: true }} />
      </Card>

      <Modal
        title={editingRecord ? 'Chỉnh sửa buổi tập' : 'Thêm buổi tập mới'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={640}
        okText={editingRecord ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        destroyOnClose
        okButtonProps={{ className: 'ft-custom-btn ft-btn-primary' }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="workoutDate" label="Ngày tập" rules={[{ required: true, message: 'Vui lòng chọn ngày tập!' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="exerciseType" label="Loại bài tập" rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}>
                <Select placeholder="Chọn loại bài tập">
                  {EXERCISE_TYPES.map((t) => <Option key={t} value={t}>{t}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="durationMinutes" label="Thời lượng (phút)" rules={[{ required: true, message: 'Bắt buộc!' }, { type: 'number', min: 1, message: 'Phải > 0' }]}>
                <InputNumber min={1} style={{ width: '100%' }} placeholder="30" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="caloriesBurned" label="Calo đốt (kcal)" rules={[{ required: true, message: 'Bắt buộc!' }, { type: 'number', min: 0, message: 'Không âm!' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="250" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                <Select>
                  <Option value="COMPLETED">Hoàn thành</Option>
                  <Option value="MISSED">Bỏ lỡ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={1} placeholder="Ghi chú..." />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default WorkoutLogPage;

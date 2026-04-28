import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Button, Modal, Form, Input, InputNumber, Select,
  Popconfirm, message, Tag, Row, Col, Card, Space,
  Tooltip, Typography, Empty, Divider,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import {
  initFitnessData, getExercises, saveExercises,
  ExerciseRecord, MuscleGroup, Difficulty,
} from '@/services/FitnessTracking';
import '@/pages/FitnessTracking/fitness.less';

const { Option } = Select;
const { Text, Paragraph } = Typography;

const MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const MUSCLE_COLOR: Record<MuscleGroup, string> = {
  Chest: 'red', Back: 'blue', Legs: 'green',
  Shoulders: 'orange', Arms: 'purple', Core: 'cyan', 'Full Body': 'gold',
};
const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  Easy: 'success', Medium: 'warning', Hard: 'error',
};

const ExerciseLibraryPage: React.FC = () => {
  const [exercises, setExercises] = useState<ExerciseRecord[]>([]);
  const [searchText, setSearchText] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [detailExercise, setDetailExercise] = useState<ExerciseRecord | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseRecord | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    initFitnessData();
    setExercises(getExercises());
  }, []);

  const handleCreate = () => {
    setEditingExercise(null);
    form.resetFields();
    form.setFieldsValue({ difficulty: 'Medium', caloriesPerHour: 300 });
    setFormVisible(true);
  };

  const handleEdit = (ex: ExerciseRecord) => {
    setEditingExercise(ex);
    form.setFieldsValue(ex);
    setFormVisible(true);
  };

  const handleDelete = (id: string) => {
    const updated = exercises.filter((e) => e.exerciseId !== id);
    setExercises(updated);
    saveExercises(updated);
    message.success('Đã xóa bài tập');
  };

  const handleFormOk = () => {
    form.validateFields().then((values) => {
      const rec: ExerciseRecord = {
        ...values,
        exerciseId: editingExercise ? editingExercise.exerciseId : `E${Date.now()}`,
        shortDescription: values.shortDescription || '',
        instruction: values.instruction || '',
        caloriesPerHour: values.caloriesPerHour || 0,
      };
      const updated = editingExercise
        ? exercises.map((e) => (e.exerciseId === editingExercise.exerciseId ? rec : e))
        : [...exercises, rec];
      setExercises(updated);
      saveExercises(updated);
      message.success(editingExercise ? 'Cập nhật thành công' : 'Thêm bài tập thành công');
      setFormVisible(false);
    });
  };

  const openDetail = (ex: ExerciseRecord) => {
    setDetailExercise(ex);
    setDetailVisible(true);
  };

  const filtered = exercises.filter((e) => {
    const matchSearch = searchText === '' || e.exerciseName.toLowerCase().includes(searchText.toLowerCase());
    const matchMuscle = muscleFilter === '' || e.muscleGroup === muscleFilter;
    const matchDiff = diffFilter === '' || e.difficulty === diffFilter;
    return matchSearch && matchMuscle && matchDiff;
  });

  return (
    <PageContainer title="Thư viện Bài tập">
      {/* Toolbar */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} className="ft-custom-btn ft-btn-primary">
              Thêm bài tập
            </Button>
          </Col>
          <Col flex="auto">
            <Row gutter={[8, 8]} justify="end">
              <Col xs={24} sm={8} md={6}>
                <Select allowClear placeholder="Nhóm cơ" style={{ width: '100%' }} value={muscleFilter || undefined} onChange={(v) => setMuscleFilter(v || '')}>
                  {MUSCLE_GROUPS.map((g) => <Option key={g} value={g}>{g}</Option>)}
                </Select>
              </Col>
              <Col xs={24} sm={6} md={5}>
                <Select allowClear placeholder="Độ khó" style={{ width: '100%' }} value={diffFilter || undefined} onChange={(v) => setDiffFilter(v || '')}>
                  {DIFFICULTIES.map((d) => <Option key={d} value={d}>{d}</Option>)}
                </Select>
              </Col>
              <Col xs={24} sm={10} md={7}>
                <Input.Search placeholder="Tìm bài tập..." allowClear onChange={(e) => setSearchText(e.target.value)} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Exercise Cards Grid */}
      {filtered.length === 0 ? (
        <Card><Empty description="Không tìm thấy bài tập nào" /></Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((ex) => (
            <Col xs={24} sm={12} lg={8} key={ex.exerciseId}>
              <Card
                className="ft-exercise-card"
                onClick={() => openDetail(ex)}
                actions={[
                  <Tooltip title="Chi tiết" key="detail">
                    <InfoCircleOutlined onClick={(e) => { e.stopPropagation(); openDetail(ex); }} />
                  </Tooltip>,
                  <Tooltip title="Chỉnh sửa" key="edit">
                    <EditOutlined onClick={(e) => { e.stopPropagation(); handleEdit(ex); }} />
                  </Tooltip>,
                  <Tooltip title="Xóa" key="delete">
                    <Popconfirm
                      title="Xóa bài tập này?"
                      onConfirm={(e) => { e?.stopPropagation(); handleDelete(ex.exerciseId); }}
                      onCancel={(e) => e?.stopPropagation()}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <DeleteOutlined style={{ color: '#ff4d4f' }} onClick={(e) => e.stopPropagation()} />
                    </Popconfirm>
                  </Tooltip>,
                ]}
              >
                <div style={{ marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 15 }}>{ex.exerciseName}</Text>
                </div>
                <Space wrap style={{ marginBottom: 8 }}>
                  <Tag color={MUSCLE_COLOR[ex.muscleGroup]}>{ex.muscleGroup}</Tag>
                  <Tag color={DIFFICULTY_COLOR[ex.difficulty]}>{ex.difficulty}</Tag>
                </Space>
                <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>
                  {ex.shortDescription}
                </Paragraph>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  🔥 {ex.caloriesPerHour} kcal/giờ
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{detailExercise?.exerciseName}</span>
            {detailExercise && <Tag color={MUSCLE_COLOR[detailExercise.muscleGroup]}>{detailExercise.muscleGroup}</Tag>}
            {detailExercise && <Tag color={DIFFICULTY_COLOR[detailExercise.difficulty]}>{detailExercise.difficulty}</Tag>}
          </Space>
        }
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={<Button onClick={() => setDetailVisible(false)}>Đóng</Button>}
        width={600}
        destroyOnClose
      >
        {detailExercise && (
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            <div>
              <Text type="secondary">Mô tả</Text>
              <Paragraph style={{ marginTop: 4 }}>{detailExercise.shortDescription}</Paragraph>
            </div>
            <Divider style={{ margin: '0 0 4px' }} />
            <div>
              <Text type="secondary">Hướng dẫn thực hiện</Text>
              <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: '1.7', color: '#333' }}>
                {detailExercise.instruction}
              </pre>
            </div>
            <Divider style={{ margin: '0 0 4px' }} />
            <Text>🔥 Tiêu thụ: <strong>{detailExercise.caloriesPerHour} kcal/giờ</strong></Text>
          </Space>
        )}
      </Modal>

      {/* Add/Edit Form Modal */}
      <Modal
        title={editingExercise ? 'Chỉnh sửa bài tập' : 'Thêm bài tập mới'}
        visible={formVisible}
        onOk={handleFormOk}
        onCancel={() => setFormVisible(false)}
        width={680}
        okText={editingExercise ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        destroyOnClose
        okButtonProps={{ className: 'ft-custom-btn ft-btn-primary' }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="exerciseName" label="Tên bài tập" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                <Input placeholder="VD: Push-up" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="caloriesPerHour" label="Calo/giờ">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="300" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="muscleGroup" label="Nhóm cơ" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                <Select placeholder="Chọn nhóm cơ">
                  {MUSCLE_GROUPS.map((g) => <Option key={g} value={g}>{g}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="difficulty" label="Độ khó" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                <Select>
                  {DIFFICULTIES.map((d) => <Option key={d} value={d}>{d}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="shortDescription" label="Mô tả ngắn">
                <Input.TextArea rows={2} placeholder="Mô tả ngắn về bài tập..." />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="instruction" label="Hướng dẫn thực hiện">
                <Input.TextArea rows={5} placeholder="Bước 1: ...&#10;Bước 2: ...&#10;..." />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ExerciseLibraryPage;

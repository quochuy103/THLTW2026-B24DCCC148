import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Row,
  Col,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getQuestions,
  saveQuestions,
  getSubjects,
  getCategories,
  Question,
  Subject,
  KnowledgeCategory,
  DifficultyLevel,
} from '../utils/storage';

const { Option } = Select;

const DifficultyColors: Record<DifficultyLevel, string> = {
  'Dễ': 'success',
  'Trung bình': 'processing',
  'Khó': 'warning',
  'Rất khó': 'error',
};

const QuestionsTab: React.FC = () => {
  const [data, setData] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Question | null>(null);
  const [form] = Form.useForm();

  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [filterDiff, setFilterDiff] = useState<DifficultyLevel | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setData(getQuestions());
    setSubjects(getSubjects());
    setCategories(getCategories());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadData]);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    
    const newId = `Q${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    form.setFieldsValue({ questionId: newId });
    
    setIsModalVisible(true);
  };

  const handleEdit = (record: Question) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const newData = data.filter((item) => item.questionId !== id);
    setData(newData);
    saveQuestions(newData);
    message.success('Xóa câu hỏi thành công');
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (!editingItem && data.find((d) => d.questionId === values.questionId)) {
        form.setFields([{ name: 'questionId', errors: ['Mã câu hỏi đã tồn tại!'] }]);
        return;
      }

      let newData;
      if (editingItem) {
        newData = data.map((item) =>
          item.questionId === editingItem.questionId ? { ...item, ...values } : item
        );
        message.success('Cập nhật câu hỏi thành công');
      } else {
        newData = [{ ...values }, ...data];
        message.success('Thêm câu hỏi mới thành công');
      }
      setData(newData);
      saveQuestions(newData);
      setIsModalVisible(false);
    });
  };

  const filteredData = data.filter((item) => {
    if (filterSubject && item.subjectCode !== filterSubject) return false;
    if (filterDiff && item.difficultyLevel !== filterDiff) return false;
    if (filterCategory && item.categoryId !== filterCategory) return false;
    return true;
  });

  const columns = [
    {
      title: 'Mã CH',
      dataIndex: 'questionId',
      key: 'questionId',
      width: 100,
    },
    {
      title: 'Nội dung',
      dataIndex: 'questionContent',
      key: 'questionContent',
      width: '40%',
      render: (text: string) => (
        <div style={{ wordWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
          {text}
        </div>
      ),
    },
    {
      title: 'Môn học',
      dataIndex: 'subjectCode',
      key: 'subjectCode',
      render: (code: string) => subjects.find((s) => s.subjectCode === code)?.subjectName || code,
    },
    {
      title: 'Khối kiến thức',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (id: string) => categories.find((c) => c.id === id)?.name || id,
    },
    {
      title: 'Độ khó',
      dataIndex: 'difficultyLevel',
      key: 'difficultyLevel',
      render: (level: DifficultyLevel) => (
        <Tag color={DifficultyColors[level]}>{level}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_: any, record: Question) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.questionId)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8} md={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Lọc theo môn học"
            allowClear
            value={filterSubject}
            onChange={setFilterSubject}
          >
            {subjects.map((s) => (
              <Option key={s.subjectCode} value={s.subjectCode}>
                {s.subjectName}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Lọc theo khối kiến thức"
            allowClear
            value={filterCategory}
            onChange={setFilterCategory}
          >
            {categories.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Lọc theo độ khó"
            allowClear
            value={filterDiff}
            onChange={setFilterDiff}
          >
            <Option value="Dễ">Dễ</Option>
            <Option value="Trung bình">Trung bình</Option>
            <Option value="Khó">Khó</Option>
            <Option value="Rất khó">Rất khó</Option>
          </Select>
        </Col>
        <Col xs={24} sm={24} md={6} style={{ textAlign: 'right' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm câu hỏi
          </Button>
        </Col>
      </Row>

      <Table columns={columns} dataSource={filteredData} rowKey="questionId" />

      <Modal
        title={editingItem ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="questionId"
                label="Mã câu hỏi"
                rules={[{ required: true, message: 'Vui lòng nhập mã câu hỏi!' }]}
              >
                <Input disabled={!!editingItem} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="subjectCode"
                label="Môn học"
                rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
              >
                <Select placeholder="Chọn môn học">
                  {subjects.map((s) => (
                    <Option key={s.subjectCode} value={s.subjectCode}>
                      {s.subjectName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="Khối kiến thức"
                rules={[{ required: true, message: 'Vui lòng chọn khối kiến thức!' }]}
              >
                <Select placeholder="Chọn khối kiến thức">
                  {categories.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="difficultyLevel"
                label="Độ khó"
                rules={[{ required: true, message: 'Vui lòng chọn độ khó!' }]}
              >
                <Select placeholder="Chọn độ khó">
                  <Option value="Dễ">Dễ</Option>
                  <Option value="Trung bình">Trung bình</Option>
                  <Option value="Khó">Khó</Option>
                  <Option value="Rất khó">Rất khó</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="questionContent"
            label="Nội dung câu hỏi"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
          >
            <Input.TextArea rows={6} placeholder="Nhập nội dung đề bài tự luận..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default QuestionsTab;

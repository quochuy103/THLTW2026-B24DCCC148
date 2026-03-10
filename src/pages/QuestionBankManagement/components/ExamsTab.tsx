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
  Tabs,
  InputNumber,
  Row,
  Col,
  List,
  Typography,
  Tag,
} from 'antd';
import { PlusOutlined, DeleteOutlined, FileTextOutlined, ProfileOutlined } from '@ant-design/icons';
import {
  getQuestions,
  getSubjects,
  getCategories,
  getTemplates,
  saveTemplates,
  getExams,
  saveExams,
  Question,
  Subject,
  KnowledgeCategory,
  ExamTemplate,
  GeneratedExam,
  generateId,
} from '../utils/storage';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text, Title, Paragraph } = Typography;

const ExamsTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('templates');
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [templates, setTemplates] = useState<ExamTemplate[]>([]);
  const [exams, setExams] = useState<GeneratedExam[]>([]);

  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [isExamViewVisible, setIsExamViewVisible] = useState(false);
  const [viewingExam, setViewingExam] = useState<GeneratedExam | null>(null);

  const [form] = Form.useForm();

  const loadData = useCallback(() => {
    setSubjects(getSubjects());
    setCategories(getCategories());
    setTemplates(getTemplates());
    setExams(getExams());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadData]);

  const handleAddTemplate = () => {
    form.resetFields();
    form.setFieldsValue({ requirements: [{ categoryId: 'any', difficultyLevel: 'Trung bình', count: 1 }] });
    setIsTemplateModalVisible(true);
  };

  const handleDeleteTemplate = (id: string) => {
    const newData = templates.filter((t) => t.id !== id);
    setTemplates(newData);
    saveTemplates(newData);
    message.success('Đã xóa cấu trúc đề!');
  };

  const handleSaveTemplate = () => {
    form.validateFields().then((values) => {
      const newTemplate: ExamTemplate = {
        id: generateId(),
        ...values,
      };
      const newData = [newTemplate, ...templates];
      setTemplates(newData);
      saveTemplates(newData);
      setIsTemplateModalVisible(false);
      message.success('Lưu cấu trúc đề thành công!');
    });
  };

  const handleGenerateExam = (template: ExamTemplate) => {
    const allQuestions = getQuestions();
    const templateQuestions = allQuestions.filter((q) => q.subjectCode === template.subjectCode);
    
    let selectedQuestions: Question[] = [];
    let isValid = true;

    for (const req of template.requirements) {
      if (!req || typeof req.count !== 'number' || req.count <= 0) continue;

      let available = templateQuestions.filter(
        (q) => q.difficultyLevel === req.difficultyLevel && !selectedQuestions.includes(q)
      );

      if (req.categoryId && req.categoryId !== 'any') {
        available = available.filter((q) => q.categoryId === req.categoryId);
      }

      available.sort(() => 0.5 - Math.random());

      if (available.length < req.count) {
        message.error(`Không đủ câu hỏi! Yêu cầu môn: ${req.count} câu ${req.difficultyLevel} - Có sẵn: ${available.length}`);
        isValid = false;
        break;
      }

      selectedQuestions = [...selectedQuestions, ...available.slice(0, req.count)];
    }

    if (isValid) {
      const newExam: GeneratedExam = {
        id: generateId(),
        templateId: template.id,
        name: `Đề thi ${template.name} - ${dayjs().format('DD/MM/YYYY HH:mm')}`,
        subjectCode: template.subjectCode,
        questions: selectedQuestions,
        createdAt: dayjs().toISOString(),
      };

      const newExamsList = [newExam, ...exams];
      setExams(newExamsList);
      saveExams(newExamsList);
      message.success('Tạo đề thi thành công!');
      
      setActiveTab('exams');
      setViewingExam(newExam);
      setIsExamViewVisible(true);
    }
  };

  const handleViewExam = (exam: GeneratedExam) => {
    setViewingExam(exam);
    setIsExamViewVisible(true);
  };

  const handleDeleteExam = (id: string) => {
    const newData = exams.filter((e) => e.id !== id);
    setExams(newData);
    saveExams(newData);
    message.success('Đã xóa đề thi!');
  };


  const templateColumns = [
    {
      title: 'Tên Cấu trúc',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Môn học',
      dataIndex: 'subjectCode',
      key: 'subjectCode',
      render: (code: string) => subjects.find((s) => s.subjectCode === code)?.subjectName || code,
    },
    {
      title: 'Chi tiết yêu cầu',
      dataIndex: 'requirements',
      key: 'requirements',
      render: (reqs: any[]) => (
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {reqs.map((r, idx) => {
            const catName = categories.find((c) => c.id === r.categoryId)?.name || 'Bất kỳ';
            return (
              <li key={idx}>
                {r.count} câu - {r.difficultyLevel} ({catName})
              </li>
            );
          })}
        </ul>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      render: (_: any, record: ExamTemplate) => (
        <Space size="middle">
          <Button type="primary" size="small" onClick={() => handleGenerateExam(record)}>
            Sinh Đề
          </Button>
          <Popconfirm
            title="Xóa cấu trúc này?"
            onConfirm={() => handleDeleteTemplate(record.id)}
            okText="Đồng ý"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const examColumns = [
    {
      title: 'Tên Đề thi',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Môn học',
      dataIndex: 'subjectCode',
      key: 'subjectCode',
      render: (code: string) => subjects.find((s) => s.subjectCode === code)?.subjectName || code,
    },
    {
      title: 'Số câu',
      dataIndex: 'questions',
      key: 'questions',
      render: (qs: Question[]) => `${qs.length} câu`,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('HH:mm DD/MM/YYYY'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_: any, record: GeneratedExam) => (
        <Space size="middle">
          <Button type="default" size="small" icon={<FileTextOutlined />} onClick={() => handleViewExam(record)}>
            Xem
          </Button>
          <Popconfirm
            title="Xóa đề thi này?"
            onConfirm={() => handleDeleteExam(record.id)}
            okText="Đồng ý"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];


  return (
    <>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
      >
        <Tabs.TabPane
          tab={
            <span>
              <ProfileOutlined /> Cấu trúc Đề thi
            </span>
          }
          key="templates"
        >
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTemplate}>
              Tạo Cấu Trúc Mới
            </Button>
          </div>
          <Table columns={templateColumns} dataSource={templates} rowKey="id" />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            <span>
              <FileTextOutlined /> Danh sách Đề Sinh Tự Động
            </span>
          }
          key="exams"
        >
          <Table columns={examColumns} dataSource={exams} rowKey="id" />
        </Tabs.TabPane>
      </Tabs>

      <Modal
        title="Tạo Cấu Trúc Đề Mới"
        visible={isTemplateModalVisible}
        onOk={handleSaveTemplate}
        onCancel={() => setIsTemplateModalVisible(false)}
        width={750}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Tên cấu trúc" rules={[{ required: true }]}>
                <Input placeholder="Ví dụ: Đề giữa kỳ CSDL" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="subjectCode" label="Môn học" rules={[{ required: true }]}>
                <Select placeholder="Chọn môn học để ra đề">
                  {subjects.map((s) => (
                    <Option key={s.subjectCode} value={s.subjectCode}>
                      {s.subjectName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.List name="requirements">
            {(fields, { add, remove }) => (
              <>
                <Text strong>Các phần tự luận mong muốn:</Text>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8, marginTop: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'categoryId']}
                      rules={[{ required: true, message: 'Missing category' }]}
                      style={{ width: 250 }}
                    >
                      <Select placeholder="Khối kiến thức">
                        <Option value="any">Tất cả (Bất kỳ)</Option>
                        {categories.map((c) => (
                          <Option key={c.id} value={c.id}>
                            {c.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      {...restField}
                      name={[name, 'difficultyLevel']}
                      rules={[{ required: true, message: 'Missing difficulty' }]}
                      style={{ width: 150 }}
                    >
                      <Select placeholder="Độ khó">
                        <Option value="Dễ">Dễ</Option>
                        <Option value="Trung bình">Trung bình</Option>
                        <Option value="Khó">Khó</Option>
                        <Option value="Rất khó">Rất khó</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'count']}
                      rules={[{ required: true, message: 'Số lượng' }]}
                    >
                      <InputNumber min={1} max={20} placeholder="SL" />
                    </Form.Item>
                    
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm yêu cầu
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal
        title={viewingExam?.name || 'Chi tiết đề thi'}
        visible={isExamViewVisible}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsExamViewVisible(false)}>
            Đóng
          </Button>
        ]}
        onCancel={() => setIsExamViewVisible(false)}
        width={800}
      >
        {viewingExam && (
          <div style={{ padding: '20px 0' }}>
            <Title level={4} style={{ textAlign: 'center' }}>
              BÀI THI MÔN {subjects.find(s => s.subjectCode === viewingExam.subjectCode)?.subjectName?.toUpperCase() || viewingExam.subjectCode}
            </Title>
            <div style={{ marginTop: 30 }}>
              <List
                itemLayout="vertical"
                dataSource={viewingExam.questions}
                renderItem={(item, index) => (
                  <List.Item key={item.questionId}>
                    <div style={{ marginBottom: 10 }}>
                      <Text strong style={{ fontSize: '1.1rem' }}>Câu {index + 1}: </Text>
                      <Tag color="blue">{item.difficultyLevel}</Tag>
                      <Tag>{categories.find(c => c.id === item.categoryId)?.name || 'Khác'}</Tag>
                    </div>
                    <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: '1.05rem', paddingLeft: 20 }}>
                      {item.questionContent}
                    </Paragraph>
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ExamsTab;

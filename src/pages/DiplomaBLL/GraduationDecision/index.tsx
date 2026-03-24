import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Button, Table, Modal, Form, Input, DatePicker, Select, Space, Popconfirm, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { 
  getDecisions, addDecision, updateDecision, deleteDecision, GraduationDecision,
  getRegistries, DiplomaRegistry
} from '@/services/diploma';

const { Option } = Select;
const { TextArea } = Input;

const GraduationDecisionPage: React.FC = () => {
  const [decisions, setDecisions] = useState<GraduationDecision[]>([]);
  const [registries, setRegistries] = useState<DiplomaRegistry[]>([]);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDecision, setEditingDecision] = useState<GraduationDecision | null>(null);
  const [form] = Form.useForm();


  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);

  const loadData = () => {
    setDecisions(getDecisions());
    setRegistries(getRegistries());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDecisions = useMemo(() => {
    if (!filterYear) return decisions;
    return decisions.filter(d => d.registryYear === filterYear);
  }, [decisions, filterYear]);

  const handleAdd = () => {
    setEditingDecision(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: GraduationDecision) => {
    setEditingDecision(record);
    form.setFieldsValue({
      ...record,
      issueDate: dayjs(record.issueDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteDecision(id);
    message.success('Xóa quyết định thành công!');
    loadData();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const payload: GraduationDecision = {
        decisionId: editingDecision ? editingDecision.decisionId : Date.now().toString(),
        decisionNumber: values.decisionNumber,
        issueDate: values.issueDate.format('YYYY-MM-DD'),
        summary: values.summary,
        registryYear: values.registryYear,
      };

      if (editingDecision) {
        updateDecision(payload.decisionId, payload);
        message.success('Cập nhật quyết định thành công!');
      } else {
        addDecision(payload);
        message.success('Tạo quyết định mới thành công!');
      }
      setIsModalVisible(false);
      loadData();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const columns: ColumnsType<GraduationDecision> = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: 'Số QĐ',
      dataIndex: 'decisionNumber',
      key: 'decisionNumber',
    },
    {
      title: 'Ngày ban hành',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (val) => dayjs(val).format('DD/MM/YYYY'),
    },
    {
      title: 'Trích yếu',
      dataIndex: 'summary',
      key: 'summary',
    },
    {
      title: 'Sổ VB năm',
      dataIndex: 'registryYear',
      key: 'registryYear',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} type="link" />
          <Popconfirm
            title="Bạn có chắc muốn xóa QĐ này?"
            onConfirm={() => handleDelete(record.decisionId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} danger type="link" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Quyết định tốt nghiệp">
      <Card title="Bộ lọc & Tìm kiếm" style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Select 
                allowClear 
                placeholder="Lọc theo năm sổ VB" 
                style={{ width: '100%' }}
                onChange={setFilterYear}
            >
              {registries.map(r => <Option key={r.year} value={r.year}>{r.year}</Option>)}
            </Select>
          </Col>
          <Col span={18} style={{ textAlign: 'right' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  Thêm Quyết định
              </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredDecisions}
          rowKey="decisionId"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingDecision ? 'Chỉnh sửa Quyết định' : 'Tạo Quyết định mới'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="decisionNumber"
            label="Số Quyết định"
            rules={[{ required: true, message: 'Vui lòng nhập số quyết định' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="issueDate"
            label="Ngày ban hành"
            rules={[{ required: true, message: 'Vui lòng chọn ngày ban hành' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            name="summary"
            label="Trích yếu"
            rules={[{ required: true, message: 'Vui lòng nhập trích yếu' }]}
          >
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="registryYear"
            label="Thuộc sổ văn bằng (Năm)"
            rules={[{ required: true, message: 'Vui lòng chọn sổ' }]}
          >
            <Select placeholder="Chọn sổ văn bằng">
              {registries.map(r => (
                <Option key={r.year} value={r.year}>{r.year}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default GraduationDecisionPage;

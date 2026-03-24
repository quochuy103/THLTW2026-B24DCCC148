import React, { useState, useEffect } from 'react';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
  DatePicker,
  InputNumber,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  getGraduationDecisions,
  createGraduationDecision,
  updateGraduationDecision,
  deleteGraduationDecision,
  getDiplomaRegisters,
} from '@/services/diploma';
import type { GraduationDecision, DiplomaRegister } from '@/models/diploma';

const GraduationDecisionManagement: React.FC = () => {
  const [data, setData] = useState<GraduationDecision[]>([]);
  const [loading, setLoading] = useState(false);
  const [registers, setRegisters] = useState<DiplomaRegister[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [decisionResponse, registerResponse] = await Promise.all([
        getGraduationDecisions({
          page: current,
          pageSize: pageSize,
        }),
        getDiplomaRegisters(),
      ]);

      if (decisionResponse.success) {
        setData(decisionResponse.data || []);
      } else {
        message.error(decisionResponse.message || 'Lỗi khi tải dữ liệu');
      }

      if (registerResponse.success) {
        setRegisters(registerResponse.data || []);
      }
    } catch (error) {
      message.error('Lỗi: ' + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [current, pageSize]);

  // Mở modal thêm mới
  const handleAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Mở modal chỉnh sửa
  const handleEdit = (record: GraduationDecision) => {
    setIsEditMode(true);
    setEditingId(record.id);
    form.setFieldsValue({
      decisionNumber: record.decisionNumber,
      decisionDate: dayjs(record.decisionDate),
      summary: record.summary,
      registerId: record.registerId,
      totalStudents: record.totalStudents,
      status: record.status,
    });
    setIsModalVisible(true);
  };

  // Xóa quyết định
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteGraduationDecision(id);
      if (response.success) {
        message.success('Xóa quyết định thành công');
        fetchData();
      } else {
        message.error(response.message || 'Lỗi khi xóa');
      }
    } catch (error) {
      message.error('Lỗi: ' + (error as any).message);
    }
  };

  // Lưu dữ liệu
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      const payload = {
        ...values,
        decisionDate: values.decisionDate?.format('YYYY-MM-DD'),
        status: values.status || 'active',
        lookupCount: 0,
      };

      if (isEditMode && editingId) {
        const response = await updateGraduationDecision(editingId, payload);
        if (response.success) {
          message.success('Cập nhật quyết định thành công');
          setIsModalVisible(false);
          fetchData();
        } else {
          message.error(response.message || 'Lỗi khi cập nhật');
        }
      } else {
        const response = await createGraduationDecision(payload);
        if (response.success) {
          message.success('Tạo quyết định thành công');
          setIsModalVisible(false);
          fetchData();
        } else {
          message.error(response.message || 'Lỗi khi tạo');
        }
      }
    } catch (error) {
      message.error('Lỗi: ' + (error as any).message);
    }
  };

  const columns: ColumnsType<GraduationDecision> = [
    {
      title: 'Số QĐ',
      dataIndex: 'decisionNumber',
      key: 'decisionNumber',
    },
    {
      title: 'Ngày Ban Hành',
      dataIndex: 'decisionDate',
      key: 'decisionDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Trích Yếu',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
    },
    {
      title: 'Tổng Sinh Viên',
      dataIndex: 'totalStudents',
      key: 'totalStudents',
      width: 150,
    },
    {
      title: 'Lượt Tra Cứu',
      dataIndex: 'lookupCount',
      key: 'lookupCount',
      width: 120,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ color: status === 'active' ? '#52c41a' : '#f5222d' }}>
          {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record)}>
            <EditOutlined />
          </a>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa quyết định này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <a style={{ color: '#f5222d' }}>
              <DeleteOutlined />
            </a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="Quản Lý Quyết Định Tốt Nghiệp" 
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm Mới</Button>}
    >
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize,
          current,
          total: data.length,
          onChange: setCurrent,
          onShowSizeChange: (_, size) => setPageSize(size),
        }}
      />

      <Modal
        title={isEditMode ? 'Chỉnh Sửa Quyết Định' : 'Thêm Mới Quyết Định'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Số QĐ"
            name="decisionNumber"
            rules={[{ required: true, message: 'Vui lòng nhập số QĐ' }]}
          >
            <Input placeholder="Ví dụ: QĐ-2026-001" />
          </Form.Item>

          <Form.Item
            label="Ngày Ban Hành"
            name="decisionDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày ban hành' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Sổ Văn Bằng"
            name="registerId"
            rules={[{ required: true, message: 'Vui lòng chọn sổ văn bằng' }]}
          >
            <Select placeholder="Chọn sổ văn bằng">
              {registers.map(reg => (
                <Select.Option key={reg.id} value={reg.id}>
                  {reg.year} - {reg.registerNumber}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Trích Yếu"
            name="summary"
            rules={[{ required: true, message: 'Vui lòng nhập trích yếu' }]}
          >
            <Input.TextArea placeholder="Trích yếu quyết định" rows={3} />
          </Form.Item>

          <Form.Item
            label="Tổng Số Sinh Viên"
            name="totalStudents"
            rules={[{ required: true, message: 'Vui lòng nhập tổng số sinh viên' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Trạng Thái"
            name="status"
            initialValue="active"
          >
            <Select>
              <Select.Option value="active">Hoạt động</Select.Option>
              <Select.Option value="inactive">Không hoạt động</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default GraduationDecisionManagement;

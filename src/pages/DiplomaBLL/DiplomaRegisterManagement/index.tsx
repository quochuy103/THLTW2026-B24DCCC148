import React, { useState, useEffect } from 'react';
import { PlusOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  message,
  Popconfirm,
  DatePicker,
  CollapsePanel,
  Collapse,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  getDiplomaRegisters,
  createDiplomaRegister,
  updateDiplomaRegister,
  deleteDiplomaRegister,
} from '@/services/diploma';
import type { DiplomaRegister } from '@/models/diploma';

const DiplomaRegisterManagement: React.FC = () => {
  const [data, setData] = useState<DiplomaRegister[]>([]);
  const [loading, setLoading] = useState(false);
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
      const response = await getDiplomaRegisters({
        page: current,
        pageSize: pageSize,
      });
      if (response.success) {
        setData(response.data || []);
      } else {
        message.error(response.message || 'Lỗi khi tải dữ liệu');
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
  const handleEdit = (record: DiplomaRegister) => {
    setIsEditMode(true);
    setEditingId(record.id);
    form.setFieldsValue({
      year: record.year,
      registerNumber: record.registerNumber,
      description: record.description,
      status: record.status,
    });
    setIsModalVisible(true);
  };

  // Xóa sổ văn bằng
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteDiplomaRegister(id);
      if (response.success) {
        message.success('Xóa sổ văn bằng thành công');
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
      
      if (isEditMode && editingId) {
        const response = await updateDiplomaRegister(editingId, {
          ...values,
          status: values.status || 'active',
        });
        if (response.success) {
          message.success('Cập nhật sổ văn bằng thành công');
          setIsModalVisible(false);
          fetchData();
        } else {
          message.error(response.message || 'Lỗi khi cập nhật');
        }
      } else {
        const response = await createDiplomaRegister({
          ...values,
          currentSequence: 0,
          status: 'active',
        });
        if (response.success) {
          message.success('Tạo sổ văn bằng thành công');
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

  const columns: ColumnsType<DiplomaRegister> = [
    {
      title: 'Năm',
      dataIndex: 'year',
      key: 'year',
      width: 100,
    },
    {
      title: 'Số Hiệu Sổ',
      dataIndex: 'registerNumber',
      key: 'registerNumber',
    },
    {
      title: 'Số Thứ Tự Hiện Tại',
      dataIndex: 'currentSequence',
      key: 'currentSequence',
      width: 150,
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
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
            description="Bạn có chắc chắn muốn xóa sổ văn bằng này không?"
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
    <Card title="Quản Lý Sổ Văn Bằng" extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm Mới</Button>}>
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
        title={isEditMode ? 'Chỉnh Sửa Sổ Văn Bằng' : 'Thêm Mới Sổ Văn Bằng'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Năm"
            name="year"
            rules={[{ required: true, message: 'Vui lòng nhập năm' }]}
          >
            <InputNumber min={2000} max={2100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Số Hiệu Sổ"
            name="registerNumber"
            rules={[{ required: true, message: 'Vui lòng nhập số hiệu sổ' }]}
          >
            <Input placeholder="Ví dụ: SOS-2026-001" />
          </Form.Item>

          <Form.Item
            label="Mô Tả"
            name="description"
          >
            <Input.TextArea placeholder="Mô tả sổ văn bằng" />
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

export default DiplomaRegisterManagement;

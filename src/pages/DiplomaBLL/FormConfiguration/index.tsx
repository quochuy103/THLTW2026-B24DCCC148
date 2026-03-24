import React, { useState, useEffect } from 'react';
import { PlusOutlined, DeleteOutlined, EditOutlined, DragOutlined } from '@ant-design/icons';
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
  Switch,
  Tooltip,
  Divider,
  Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  getFormFields,
  createFormField,
  updateFormField,
  deleteFormField,
} from '@/services/diploma';
import type { FormField } from '@/models/diploma';

const FormConfiguration: React.FC = () => {
  const [data, setData] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getFormFields();
      if (response.success) {
        // Sắp xếp theo displayOrder
        const sortedData = (response.data || []).sort((a, b) => a.displayOrder - b.displayOrder);
        setData(sortedData);
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
  }, []);

  // Mở modal thêm mới
  const handleAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    form.resetFields();
    const nextOrder = data.length > 0 ? Math.max(...data.map(d => d.displayOrder)) + 1 : 1;
    form.setFieldValue('displayOrder', nextOrder);
    setIsModalVisible(true);
  };

  // Mở modal chỉnh sửa
  const handleEdit = (record: FormField) => {
    setIsEditMode(true);
    setEditingId(record.id);
    form.setFieldsValue({
      fieldName: record.fieldName,
      fieldType: record.fieldType,
      description: record.description,
      isRequired: record.isRequired,
      displayOrder: record.displayOrder,
      status: record.status,
    });
    setIsModalVisible(true);
  };

  // Xóa trường
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteFormField(id);
      if (response.success) {
        message.success('Xóa trường thông tin thành công');
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
        status: values.status || 'active',
      };

      if (isEditMode && editingId) {
        const response = await updateFormField(editingId, payload);
        if (response.success) {
          message.success('Cập nhật trường thông tin thành công');
          setIsModalVisible(false);
          fetchData();
        } else {
          message.error(response.message || 'Lỗi khi cập nhật');
        }
      } else {
        const response = await createFormField(payload);
        if (response.success) {
          message.success('Tạo trường thông tin thành công');
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

  const columns: ColumnsType<FormField> = [
    {
      title: 'Thứ Tự',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 80,
    },
    {
      title: 'Tên Trường',
      dataIndex: 'fieldName',
      key: 'fieldName',
    },
    {
      title: 'Kiểu Dữ Liệu',
      dataIndex: 'fieldType',
      key: 'fieldType',
      render: (type: string) => {
        const typeMap: { [key: string]: string } = {
          'String': 'Văn bản',
          'Number': 'Số',
          'Date': 'Ngày tháng',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: 'Bắt Buộc',
      dataIndex: 'isRequired',
      key: 'isRequired',
      render: (isRequired: boolean) => (
        <span style={{ color: isRequired ? '#52c41a' : '#f5222d' }}>
          {isRequired ? 'Có' : 'Không'}
        </span>
      ),
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
            description="Bạn có chắc chắn muốn xóa trường này không?"
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
      title="Cấu Hình Biểu Mẫu Phụ Lục Văn Bằng" 
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm Trường</Button>}
    >
      <Alert
        message="Thông tin các trường được cấu hình ở đây sẽ được sử dụng khi nhập thông tin văn bằng của sinh viên"
        type="info"
        showIcon
        style={{ marginBottom: '20px' }}
      />

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title={isEditMode ? 'Chỉnh Sửa Trường Thông Tin' : 'Thêm Mới Trường Thông Tin'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên Trường"
            name="fieldName"
            rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}
          >
            <Input placeholder="Ví dụ: Dân tộc, Nơi sinh, Điểm trung bình" />
          </Form.Item>

          <Form.Item
            label="Kiểu Dữ Liệu"
            name="fieldType"
            rules={[{ required: true, message: 'Vui lòng chọn kiểu dữ liệu' }]}
          >
            <Select placeholder="Chọn kiểu dữ liệu">
              <Select.Option value="String">Văn bản</Select.Option>
              <Select.Option value="Number">Số</Select.Option>
              <Select.Option value="Date">Ngày tháng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Mô Tả"
            name="description"
          >
            <Input.TextArea placeholder="Mô tả trường thông tin" rows={2} />
          </Form.Item>

          <Form.Item
            label="Thứ Tự Hiển Thị"
            name="displayOrder"
            rules={[{ required: true, message: 'Vui lòng nhập thứ tự' }]}
          >
            <Input type="number" min={1} />
          </Form.Item>

          <Form.Item
            label="Bắt Buộc"
            name="isRequired"
            valuePropName="checked"
          >
            <Switch />
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

export default FormConfiguration;

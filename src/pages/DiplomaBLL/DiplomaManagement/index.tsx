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
  Divider,
  Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  getDiplomaInfos,
  createDiplomaInfo,
  updateDiplomaInfo,
  deleteDiplomaInfo,
  getDiplomaRegisters,
  getGraduationDecisions,
  getFormFields,
} from '@/services/diploma';
import type { DiplomaInfo, DiplomaRegister, GraduationDecision, FormField } from '@/models/diploma';

const DiplomaManagement: React.FC = () => {
  const [data, setData] = useState<DiplomaInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [registers, setRegisters] = useState<DiplomaRegister[]>([]);
  const [decisions, setDecisions] = useState<GraduationDecision[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRegisterId, setSelectedRegisterId] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [infoResponse, registerResponse, decisionResponse, fieldResponse] = await Promise.all([
        getDiplomaInfos({
          page: current,
          pageSize: pageSize,
        }),
        getDiplomaRegisters(),
        getGraduationDecisions(),
        getFormFields(),
      ]);

      if (infoResponse.success) {
        setData(infoResponse.data || []);
      } else {
        message.error(infoResponse.message || 'Lỗi khi tải dữ liệu');
      }

      if (registerResponse.success) {
        setRegisters(registerResponse.data || []);
      }

      if (decisionResponse.success) {
        setDecisions(decisionResponse.data || []);
      }

      if (fieldResponse.success) {
        const sorted = (fieldResponse.data || []).sort((a, b) => a.displayOrder - b.displayOrder);
        setFormFields(sorted);
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
  const handleEdit = (record: DiplomaInfo) => {
    setIsEditMode(true);
    setEditingId(record.id);
    
    const values: any = {
      registerId: record.registerId,
      decisionId: record.decisionId,
      diplomaNumber: record.diplomaNumber,
      studentCode: record.studentCode,
      studentName: record.studentName,
      dateOfBirth: dayjs(record.dateOfBirth),
      status: record.status,
    };

    // Thêm custom fields
    if (record.customFields) {
      formFields.forEach(field => {
        if (record.customFields[field.fieldName]) {
          values[field.fieldName] = 
            field.fieldType === 'Date' 
              ? dayjs(record.customFields[field.fieldName])
              : record.customFields[field.fieldName];
        }
      });
    }

    form.setFieldsValue(values);
    setIsModalVisible(true);
  };

  // Xóa thông tin văn bằng
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteDiplomaInfo(id);
      if (response.success) {
        message.success('Xóa thông tin văn bằng thành công');
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

      const customFields: { [key: string]: any } = {};
      formFields.forEach(field => {
        if (values[field.fieldName] !== undefined) {
          customFields[field.fieldName] = 
            field.fieldType === 'Date' 
              ? values[field.fieldName]?.format('YYYY-MM-DD')
              : values[field.fieldName];
        }
      });

      const payload = {
        registerId: values.registerId,
        decisionId: values.decisionId,
        diplomaNumber: values.diplomaNumber,
        studentCode: values.studentCode,
        studentName: values.studentName,
        dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
        customFields,
        status: values.status || 'active',
      };

      if (isEditMode && editingId) {
        const response = await updateDiplomaInfo(editingId, payload);
        if (response.success) {
          message.success('Cập nhật thông tin văn bằng thành công');
          setIsModalVisible(false);
          fetchData();
        } else {
          message.error(response.message || 'Lỗi khi cập nhật');
        }
      } else {
        const response = await createDiplomaInfo(payload);
        if (response.success) {
          message.success('Tạo thông tin văn bằng thành công');
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

  const columns: ColumnsType<DiplomaInfo> = [
    {
      title: 'Số Vào Sổ',
      dataIndex: 'sequenceNumber',
      key: 'sequenceNumber',
      width: 100,
    },
    {
      title: 'Số Hiệu Văn Bằng',
      dataIndex: 'diplomaNumber',
      key: 'diplomaNumber',
    },
    {
      title: 'MSV',
      dataIndex: 'studentCode',
      key: 'studentCode',
      width: 120,
    },
    {
      title: 'Họ Tên',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Ngày Sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
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
            description="Bạn có chắc chắn muốn xóa thông tin này không?"
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
      title="Quản Lý Thông Tin Văn Bằng" 
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm Mới</Button>}
    >
      <Alert
        message="Số vào sổ sẽ tự động tăng theo sổ văn bằng đã chọn"
        type="info"
        showIcon
        style={{ marginBottom: '20px' }}
      />

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
        title={isEditMode ? 'Chỉnh Sửa Thông Tin Văn Bằng' : 'Thêm Mới Thông Tin Văn Bằng'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        style={{ maxHeight: '80vh', overflow: 'auto' }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Sổ Văn Bằng"
            name="registerId"
            rules={[{ required: true, message: 'Vui lòng chọn sổ văn bằng' }]}
          >
            <Select placeholder="Chọn sổ văn bằng" onChange={setSelectedRegisterId}>
              {registers.map(reg => (
                <Select.Option key={reg.id} value={reg.id}>
                  {reg.year} - {reg.registerNumber}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Quyết Định Tốt Nghiệp"
            name="decisionId"
            rules={[{ required: true, message: 'Vui lòng chọn quyết định tốt nghiệp' }]}
          >
            <Select placeholder="Chọn quyết định">
              {decisions.map(dec => (
                <Select.Option key={dec.id} value={dec.id}>
                  {dec.decisionNumber} - {dec.summary}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Divider>Thông Tin Sinh Viên</Divider>

          <Form.Item
            label="Số Hiệu Văn Bằng"
            name="diplomaNumber"
            rules={[{ required: true, message: 'Vui lòng nhập số hiệu văn bằng' }]}
          >
            <Input placeholder="Ví dụ: C03-2026-001" />
          </Form.Item>

          <Form.Item
            label="Mã Sinh Viên (MSV)"
            name="studentCode"
            rules={[{ required: true, message: 'Vui lòng nhập MSV' }]}
          >
            <Input placeholder="Ví dụ: 20IT001" />
          </Form.Item>

          <Form.Item
            label="Họ Tên"
            name="studentName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ tên sinh viên" />
          </Form.Item>

          <Form.Item
            label="Ngày Sinh"
            name="dateOfBirth"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          {formFields.length > 0 && (
            <>
              <Divider>Thông Tin Bổ Sung</Divider>
              {formFields.map(field => (
                <Form.Item
                  key={field.id}
                  label={field.fieldName}
                  name={field.fieldName}
                  rules={field.isRequired ? [{ required: true, message: `Vui lòng nhập ${field.fieldName}` }] : []}
                >
                  {field.fieldType === 'Date' ? (
                    <DatePicker style={{ width: '100%' }} />
                  ) : field.fieldType === 'Number' ? (
                    <Input type="number" placeholder={field.fieldName} />
                  ) : (
                    <Input placeholder={field.fieldName} />
                  )}
                </Form.Item>
              ))}
            </>
          )}

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

export default DiplomaManagement;

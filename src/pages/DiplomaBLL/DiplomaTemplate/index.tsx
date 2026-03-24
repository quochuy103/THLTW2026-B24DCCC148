import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Button, Table, Modal, Form, Input, Select, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  getTemplateFields, addTemplateField, updateTemplateField, deleteTemplateField, DiplomaTemplateField 
} from '@/services/diploma';

const { Option } = Select;

const DiplomaTemplatePage: React.FC = () => {
  const [fields, setFields] = useState<DiplomaTemplateField[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<DiplomaTemplateField | null>(null);
  const [form] = Form.useForm();

  const loadData = () => {
    setFields(getTemplateFields());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setEditingField(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: DiplomaTemplateField) => {
    setEditingField(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteTemplateField(id);
    message.success('Xóa trường dữ liệu thành công!');
    loadData();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const payload: DiplomaTemplateField = {
        id: editingField ? editingField.id : Date.now().toString(),
        fieldName: values.fieldName,
        dataType: values.dataType,
      };

      if (editingField) {
        updateTemplateField(payload.id, payload);
        message.success('Cập nhật trường dữ liệu thành công!');
      } else {
        addTemplateField(payload);
        message.success('Thêm trường dữ liệu thành công!');
      }
      setIsModalVisible(false);
      loadData();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const columns: ColumnsType<DiplomaTemplateField> = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: 'Tên trường (Field Name)',
      dataIndex: 'fieldName',
      key: 'fieldName',
    },
    {
      title: 'Kiểu dữ liệu',
      dataIndex: 'dataType',
      key: 'dataType',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} type="link" />
          <Popconfirm
            title="Bạn có chắc muốn xóa trường này?"
            onConfirm={() => handleDelete(record.id)}
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
    <PageContainer title="Cấu hình biểu mẫu văn bằng">
      <Card
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm trường dữ liệu
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={fields}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingField ? 'Chỉnh sửa trường dữ liệu' : 'Thêm trường dữ liệu mới'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fieldName"
            label="Tên trường (Ví dụ: Dân tộc, Nơi sinh, ...)"
            rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="dataType"
            label="Kiểu dữ liệu"
            rules={[{ required: true, message: 'Vui lòng chọn kiểu dữ liệu' }]}
          >
            <Select>
              <Option value="String">Văn bản (String)</Option>
              <Option value="Number">Số (Number)</Option>
              <Option value="Date">Ngày tháng (Date)</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DiplomaTemplatePage;

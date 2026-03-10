import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCategories, saveCategories, KnowledgeCategory, generateId } from '../utils/storage';

const CategoriesTab: React.FC = () => {
  const [data, setData] = useState<KnowledgeCategory[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeCategory | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setData(getCategories());
  }, []);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: KnowledgeCategory) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const newData = data.filter((item) => item.id !== id);
    setData(newData);
    saveCategories(newData);
    message.success('Xóa danh mục thành công');
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      let newData;
      if (editingItem) {
        newData = data.map((item) => (item.id === editingItem.id ? { ...item, ...values } : item));
        message.success('Cập nhật danh mục thành công');
      } else {
        newData = [{ ...values, id: generateId() }, ...data];
        message.success('Thêm danh mục mới thành công');
      }
      setData(newData);
      saveCategories(newData);
      setIsModalVisible(false);
    });
  };

  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_: any, record: KnowledgeCategory) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
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
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm Khối kiến thức
        </Button>
      </div>
<Table
  columns={columns}
  dataSource={data}
  rowKey="id"
  pagination={{ pageSize: 5 }}
/>
      <Modal
        title={editingItem ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input placeholder="Ví dụ: Tổng quan" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CategoriesTab;

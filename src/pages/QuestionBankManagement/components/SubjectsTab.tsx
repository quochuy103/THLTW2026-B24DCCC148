import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getSubjects, saveSubjects, Subject } from '../utils/storage';

const SubjectsTab: React.FC = () => {
  const [data, setData] = useState<Subject[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Subject | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setData(getSubjects());
  }, []);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Subject) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (subjectCode: string) => {
    const newData = data.filter((item) => item.subjectCode !== subjectCode);
    setData(newData);
    saveSubjects(newData);
    message.success('Xóa môn học thành công');
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (!editingItem && data.find((d) => d.subjectCode === values.subjectCode)) {
        form.setFields([{ name: 'subjectCode', errors: ['Mã môn học đã tồn tại!'] }]);
        return;
      }

      let newData;
      if (editingItem) {
        newData = data.map((item) =>
          item.subjectCode === editingItem.subjectCode ? { ...item, ...values } : item
        );
        message.success('Cập nhật môn học thành công');
      } else {
        newData = [{ ...values }, ...data];
        message.success('Thêm môn học mới thành công');
      }
      setData(newData);
      saveSubjects(newData);
      setIsModalVisible(false);
    });
  };

  const columns = [
    {
      title: 'Mã môn học',
      dataIndex: 'subjectCode',
      key: 'subjectCode',
      width: 150,
    },
    {
      title: 'Tên môn học',
      dataIndex: 'subjectName',
      key: 'subjectName',
    },
    {
      title: 'Số tín chỉ',
      dataIndex: 'credits',
      key: 'credits',
      width: 120,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_: any, record: Subject) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.subjectCode)}
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
          Thêm Môn học
        </Button>
      </div>

      <Table columns={columns} dataSource={data} rowKey="subjectCode" />

      <Modal
        title={editingItem ? 'Sửa môn học' : 'Thêm môn học mới'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="subjectCode"
            label="Mã môn học"
            rules={[{ required: true, message: 'Vui lòng nhập mã môn học!' }]}
          >
            <Input disabled={!!editingItem} placeholder="Ví dụ: INT1000" />
          </Form.Item>
          <Form.Item
            name="subjectName"
            label="Tên môn học"
            rules={[{ required: true, message: 'Vui lòng nhập tên môn học!' }]}
          >
            <Input placeholder="Ví dụ: Cơ sở dữ liệu" />
          </Form.Item>
          <Form.Item
            name="credits"
            label="Số tín chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ!' }]}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SubjectsTab;

import { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';

const presetColors = [
  '#1677ff',
  '#52c41a',
  '#faad14',
  '#ff4d4f',
  '#722ed1',
  '#eb2f96',
];

const SubjectsTab = () => {
  const { subjects, addSubject, updateSubject, deleteSubject } =
    useModel('study');

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleOpen = (record?: any) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue(record);
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({ color: '#1677ff' });
    }
    setOpen(true);
  };

  const handleFinish = (values: any) => {
    if (editingId) {
      updateSubject(editingId, values);
    } else {
      addSubject(values);
    }
    setOpen(false);
  };

  const columns = [
    {
      title: 'Tên Môn Học',
      dataIndex: 'name',
      render: (text: string, record: any) => (
        <Space>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: record.color,
            }}
          />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Thao Tác',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpen(record)}
          />
          <Popconfirm
            title="Xóa môn học?"
            onConfirm={() => deleteSubject(record.id)}
          >
            <Button danger type="link" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpen()}
        >
          Thêm Môn Học
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={subjects}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title={editingId ? 'Sửa Môn Học' : 'Thêm Môn Học'}
        visible={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item
            name="name"
            label="Tên môn học"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="color"
            label="Màu sắc"
            rules={[{ required: true }]}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              {presetColors.map(color => (
                <div
                  key={color}
                  onClick={() => form.setFieldsValue({ color })}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: color,
                    cursor: 'pointer',
                    border: form.getFieldValue('color') === color ? '2px solid #000' : 'none',
                    boxSizing: 'border-box'
                  }}
                />
              ))}
              <Input type="hidden" />
            </div>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SubjectsTab;
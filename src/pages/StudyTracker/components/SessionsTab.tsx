import { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Popconfirm,
  Tag,
  Tooltip,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const SessionsTab = () => {
  const { subjects, sessions, addSession, deleteSession } = useModel('study');
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const handleOpen = () => {
    form.resetFields();
    form.setFieldsValue({
      date: dayjs(),
      durationMinutes: 60,
    });
    setOpen(true);
  };

  const handleFinish = (values: any) => {
    addSession({
      subjectId: values.subjectId,
      date: values.date.format('YYYY-MM-DD'),
      durationMinutes: values.durationMinutes,
      content: values.content,
      notes: values.notes,
    });
    setOpen(false);
  };

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}g ${m}p` : `${m} phút`;
  };

  const columns = [
    {
      title: 'Ngày Học',
      dataIndex: 'date',
      sorter: (a: any, b: any) =>
        dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
      defaultSortOrder: 'descend' as const,
      render: (text: string) => dayjs(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Môn Học',
      dataIndex: 'subjectId',
      render: (id: string) => {
        const subject = subjects.find(s => s.id === id);
        if (!subject) return <Tag>Không rõ</Tag>;
        return <Tag color={subject.color}>{subject.name}</Tag>;
      },
    },
    {
      title: 'Nội Dung',
      dataIndex: 'content',
    },
    {
      title: 'Thời Gian',
      dataIndex: 'durationMinutes',
      render: formatTime,
    },
    {
      title: 'Thao Tác',
      render: (_: any, record: any) => (
        <Popconfirm
          title="Xóa nhật ký này?"
          onConfirm={() => deleteSession(record.id)}
        >
          <Button danger type="text" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title={subjects.length === 0 ? 'Thêm môn học trước' : ''}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpen}
            disabled={subjects.length === 0}
          >
            Thêm Nhật Ký
          </Button>
        </Tooltip>
      </div>

      <Table columns={columns} dataSource={sessions} rowKey="id" pagination={{ pageSize: 5 }} />

      <Modal
        title="Thêm Nhật Ký"
        visible={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item
            name="subjectId"
            label="Môn học"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn môn">
              {subjects.map(s => (
                <Option key={s.id} value={s.id}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày học"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="durationMinutes"
            label="Thời gian (phút)"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={1440} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={2} />
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

export default SessionsTab;
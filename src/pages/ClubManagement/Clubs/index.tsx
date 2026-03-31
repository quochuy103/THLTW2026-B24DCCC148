import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Table, Button, Modal, Form, Input, Switch, DatePicker, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import { getClubs, saveClubs, ClubRecord } from '@/services/ClubManagement';
import { history } from 'umi';
import dayjs from 'dayjs';
import TinyEditor from '@/components/TinyEditor';

const ClubsPage: React.FC = () => {
  const [clubs, setClubs] = useState<ClubRecord[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClub, setEditingClub] = useState<ClubRecord | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setClubs(getClubs());
  }, []);

  const handleCreate = () => {
    setEditingClub(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setIsModalVisible(true);
  };

  const handleEdit = (record: ClubRecord) => {
    setEditingClub(record);
    form.setFieldsValue({
      ...record,
      foundedDate: record.foundedDate ? dayjs(record.foundedDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (clubId: string) => {
    const updated = clubs.filter(c => c.clubId !== clubId);
    setClubs(updated);
    saveClubs(updated);
    message.success('Đã xóa câu lạc bộ');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const formattedValues = {
        ...values,
        foundedDate: values.foundedDate ? values.foundedDate.format('YYYY-MM-DD') : '',
      };

      if (editingClub) {
        const updated = clubs.map(c => 
          c.clubId === editingClub.clubId ? { ...c, ...formattedValues } as ClubRecord : c
        );
        setClubs(updated);
        saveClubs(updated);
        message.success('Cập nhật thành công');
      } else {
        const newClub: ClubRecord = {
          ...formattedValues,
          clubId: `C${Date.now()}`,
        };
        const updated = [...clubs, newClub];
        setClubs(updated);
        saveClubs(updated);
        message.success('Thêm mới thành công');
      }
      setIsModalVisible(false);
    });
  };

  const handleViewMembers = (clubId: string) => {
    history.push(`/club-management/members?clubId=${clubId}`);
  };

  const columns = [
    {
      title: 'Mã CLB',
      dataIndex: 'clubId',
      key: 'clubId',
      sorter: (a: ClubRecord, b: ClubRecord) => a.clubId.localeCompare(b.clubId),
    },
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (text: string) => text ? <img src={text} alt="avatar" style={{width: 40, height: 40, borderRadius: '50%'}} /> : '-',
    },
    {
      title: 'Tên CLB',
      dataIndex: 'clubName',
      key: 'clubName',
      sorter: (a: ClubRecord, b: ClubRecord) => a.clubName.localeCompare(b.clubName),
    },
    {
      title: 'Ngày thành lập',
      dataIndex: 'foundedDate',
      key: 'foundedDate',
      sorter: (a: ClubRecord, b: ClubRecord) => a.foundedDate.localeCompare(b.foundedDate),
    },
    {
      title: 'Chủ tịch',
      dataIndex: 'president',
      key: 'president',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => isActive ? <span style={{color: '#52c41a'}}>Hoạt động</span> : <span style={{color: '#f5222d'}}>Ngừng hoạt động</span>,
      filters: [
        { text: 'Hoạt động', value: true },
        { text: 'Ngừng hoạt động', value: false },
      ],
      onFilter: (value: boolean | React.Key, record: ClubRecord) => record.isActive === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ClubRecord) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.clubId)}>
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
          <Button onClick={() => handleViewMembers(record.clubId)} icon={<TeamOutlined />}>Thành viên</Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Quản lý Câu lạc bộ">
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Thêm CLB
          </Button>
        </div>
        <Table<ClubRecord>
          columns={columns}
          dataSource={clubs}
          rowKey="clubId"
        />
      </Card>

      <Modal
        title={editingClub ? "Sửa Câu lạc bộ" : "Thêm Câu lạc bộ"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="clubName" label="Tên CLB" rules={[{ required: true, message: 'Vui lòng nhập tên CLB!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="avatar" label="URL Avatar">
            <Input />
          </Form.Item>
          <Form.Item name="foundedDate" label="Ngày thành lập" rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="president" label="Chủ tịch" rules={[{ required: true, message: 'Vui lòng nhập tên chủ tịch!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Trạng thái hoạt động" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TinyEditor height={300} tinyToolbar={true} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ClubsPage;

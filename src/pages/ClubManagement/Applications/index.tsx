import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Table, Button, Modal, Form, Input, Select, message, Space, Tag, Timeline } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import { getApplications, saveApplications, ApplicationRecord, getClubs, ClubRecord, HistoryLog } from '@/services/ClubManagement';

const { Option } = Select;

const ApplicationsPage: React.FC = () => {
  const [apps, setApps] = useState<ApplicationRecord[]>([]);
  const [clubs, setClubs] = useState<ClubRecord[]>([]);
  
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectForm] = Form.useForm();
  const [rejectingAppIds, setRejectingAppIds] = useState<string[]>([]);

  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewingApp, setViewingApp] = useState<ApplicationRecord | null>(null);

  useEffect(() => {
    setApps(getApplications());
    setClubs(getClubs());
  }, []);

  const getClubName = (id: string) => clubs.find(c => c.clubId === id)?.clubName || id;

  const handleApprove = (appIds: string[]) => {
    Modal.confirm({
      title: 'Xác nhận phê duyệt',
      content: `Bạn có chắc muốn phê duyệt ${appIds.length} đơn đăng ký này?`,
      onOk: () => {
        const timestamp = new Date().toISOString();
        const updated = apps.map(app => {
          if (appIds.includes(app.applicationId)) {
            return {
              ...app,
              status: 'Approved' as const,
              historyLogs: [
                ...app.historyLogs,
                { timestamp, action: 'Đã phê duyệt bởi Admin' }
              ]
            };
          }
          return app;
        });
        setApps(updated);
        saveApplications(updated);
        setSelectedRowKeys([]);
        message.success(`Đã phê duyệt ${appIds.length} đơn`);
      }
    });
  };

  const showRejectModal = (appIds: string[]) => {
    setRejectingAppIds(appIds);
    rejectForm.resetFields();
    setIsRejectModalVisible(true);
  };

  const handleRejectOk = () => {
    rejectForm.validateFields().then(values => {
      const timestamp = new Date().toISOString();
      const reason = values.reason;
      
      const updated = apps.map(app => {
        if (rejectingAppIds.includes(app.applicationId)) {
          return {
            ...app,
            status: 'Rejected' as const,
            rejectNote: reason,
            historyLogs: [
              ...app.historyLogs,
              { timestamp, action: `Bị từ chối bởi Admin`, note: `Lý do: ${reason}` }
            ]
          };
        }
        return app;
      });
      setApps(updated);
      saveApplications(updated);
      setSelectedRowKeys([]);
      setIsRejectModalVisible(false);
      message.success(`Đã từ chối ${rejectingAppIds.length} đơn`);
    });
  };

  const showViewModal = (record: ApplicationRecord) => {
    setViewingApp(record);
    setIsViewModalVisible(true);
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'applicationId',
      key: 'applicationId',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a: ApplicationRecord, b: ApplicationRecord) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'CLB đăng ký',
      dataIndex: 'clubId',
      key: 'clubId',
      render: (val: string) => getClubName(val),
      filters: clubs.map(c => ({ text: c.clubName, value: c.clubId })),
      onFilter: (value: boolean | React.Key, record: ApplicationRecord) => record.clubId === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'gold';
        if (status === 'Approved') color = 'green';
        if (status === 'Rejected') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
      filters: [
        { text: 'Pending', value: 'Pending' },
        { text: 'Approved', value: 'Approved' },
        { text: 'Rejected', value: 'Rejected' },
      ],
      onFilter: (value: boolean | React.Key, record: ApplicationRecord) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ApplicationRecord) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} onClick={() => showViewModal(record)}>Chi tiết</Button>
          {record.status === 'Pending' && (
            <>
              <Button type="primary" icon={<CheckOutlined />} onClick={() => handleApprove([record.applicationId])} />
              <Button type="primary" danger icon={<CloseOutlined />} onClick={() => showRejectModal([record.applicationId])} />
            </>
          )}
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
    getCheckboxProps: (record: ApplicationRecord) => ({
      disabled: record.status !== 'Pending',
    }),
  };

  return (
    <PageContainer title="Đơn đăng ký">
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button
              type="primary"
              disabled={selectedRowKeys.length === 0}
              onClick={() => handleApprove(selectedRowKeys as string[])}
              icon={<CheckOutlined />}
            >
              Phê duyệt mục đã chọn
            </Button>
            <Button
              type="primary"
              danger
              disabled={selectedRowKeys.length === 0}
              onClick={() => showRejectModal(selectedRowKeys as string[])}
              icon={<CloseOutlined />}
            >
              Từ chối mục đã chọn
            </Button>
          </Space>
        </div>
        
        <Table<ApplicationRecord>
          columns={columns}
          dataSource={apps}
          rowKey="applicationId"
          rowSelection={rowSelection}
        />
      </Card>

      <Modal
        title="Từ chối đơn đăng ký"
        visible={isRejectModalVisible}
        onOk={handleRejectOk}
        onCancel={() => setIsRejectModalVisible(false)}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết đơn đăng ký"
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>Đóng</Button>
        ]}
        width={700}
      >
        {viewingApp && (
          <Form layout="vertical">
            <Space style={{ display: 'flex' }}>
              <Form.Item label="Họ và tên"><Input value={viewingApp.fullName} readOnly /></Form.Item>
              <Form.Item label="Mã đơn"><Input value={viewingApp.applicationId} readOnly /></Form.Item>
            </Space>
            <Space style={{ display: 'flex' }}>
              <Form.Item label="Email"><Input value={viewingApp.email} readOnly /></Form.Item>
              <Form.Item label="Số điện thoại"><Input value={viewingApp.phone} readOnly /></Form.Item>
            </Space>
            <Form.Item label="Kỹ năng chính"><Input value={viewingApp.skills} readOnly /></Form.Item>
            <Form.Item label="Lý do tham gia"><Input.TextArea value={viewingApp.reason} readOnly rows={3} /></Form.Item>
            
            <Form.Item label="Lịch sử thay đổi trạng thái">
              <Timeline>
                {viewingApp.historyLogs.map((log: HistoryLog, i: number) => (
                  <Timeline.Item key={i} color={log.action.includes('Từ chối') ? 'red' : log.action.includes('Approved') || log.action.includes('phê duyệt') ? 'green' : 'blue'}>
                    <p>{new Date(log.timestamp).toLocaleString()}</p>
                    <p><strong>{log.action}</strong></p>
                    {log.note && <p>{log.note}</p>}
                  </Timeline.Item>
                ))}
              </Timeline>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ApplicationsPage;

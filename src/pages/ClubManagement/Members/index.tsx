import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Table, Button, Modal, Form, Select, message, Space } from 'antd';
import { SwapOutlined, TeamOutlined } from '@ant-design/icons';
import { getApplications, saveApplications, ApplicationRecord, getClubs, ClubRecord } from '@/services/ClubManagement';
import { useLocation } from 'umi';

const { Option } = Select;

const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<ApplicationRecord[]>([]);
  const [clubs, setClubs] = useState<ClubRecord[]>([]);
  
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isChangeClubModalVisible, setIsChangeClubModalVisible] = useState(false);
  const [changeClubForm] = Form.useForm();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialClubId = queryParams.get('clubId') || null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const apps = getApplications();
    const approvedOnly = apps.filter(a => a.status === 'Approved');
    setMembers(approvedOnly);
    setClubs(getClubs());
  };

  const getClubName = (id: string) => clubs.find(c => c.clubId === id)?.clubName || id;

  const showChangeClubModal = () => {
    changeClubForm.resetFields();
    setIsChangeClubModalVisible(true);
  };

  const handleChangeClubOk = () => {
    changeClubForm.validateFields().then(values => {
      const { newClubId } = values;
      const apps = getApplications(); 
      const timestamp = new Date().toISOString();
      const clubName = getClubName(newClubId);

      const updatedApps = apps.map(app => {
        if (selectedRowKeys.includes(app.applicationId)) {
          return {
            ...app,
            clubId: newClubId,
            historyLogs: [
              ...app.historyLogs,
              { timestamp, action: `Chuyển sang CLB ${clubName} bởi Admin` }
            ]
          };
        }
        return app;
      });

      saveApplications(updatedApps);
      fetchData(); // refresh
      setSelectedRowKeys([]);
      setIsChangeClubModalVisible(false);
      message.success(`Đã chuyển ${selectedRowKeys.length} thành viên sang CLB ${clubName}`);
    });
  };

  const columns = [
    {
      title: 'Mã thành viên',
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
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (val: string) => {
        if (val === 'Male') return 'Nam';
        if (val === 'Female') return 'Nữ';
        return 'Khác';
      }
    },
    {
      title: 'CLB hiện tại',
      dataIndex: 'clubId',
      key: 'clubId',
      render: (val: string) => getClubName(val),
      defaultFilteredValue: initialClubId ? [initialClubId] : null,
      filters: clubs.map(c => ({ text: c.clubName, value: c.clubId })),
      onFilter: (value: boolean | React.Key, record: ApplicationRecord) => record.clubId === value,
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <PageContainer title="Danh sách Thành viên">
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button
              type="primary"
              disabled={selectedRowKeys.length === 0}
              onClick={showChangeClubModal}
              icon={<SwapOutlined />}
            >
              Chuyển CLB ({selectedRowKeys.length} mục)
            </Button>
          </Space>
        </div>
        
        <Table<ApplicationRecord>
          columns={columns}
          dataSource={members}
          rowKey="applicationId"
          rowSelection={rowSelection}
        />
      </Card>

      <Modal
        title="Chuyển Câu lạc bộ"
        visible={isChangeClubModalVisible}
        onOk={handleChangeClubOk}
        onCancel={() => setIsChangeClubModalVisible(false)}
      >
        <p>Bạn đang chọn chuyển <strong>{selectedRowKeys.length}</strong> thành viên sang câu lạc bộ khác.</p>
        <Form form={changeClubForm} layout="vertical">
          <Form.Item
            name="newClubId"
            label="Chọn câu lạc bộ mới"
            rules={[{ required: true, message: 'Vui lòng chọn câu lạc bộ đích!' }]}
          >
            <Select placeholder="Chọn câu lạc bộ..." showSearch filterOption={(input, option) =>
                (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
              }>
              {clubs.filter(c => c.isActive).map(c => (
                <Option key={c.clubId} value={c.clubId}>
                  {c.clubName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default MembersPage;

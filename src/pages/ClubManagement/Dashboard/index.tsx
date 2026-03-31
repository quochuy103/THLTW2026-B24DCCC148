import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Col, Row, Statistic } from 'antd';
import { TeamOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import ColumnChart from '@/components/Chart/ColumnChart';
import { getClubs, getApplications, initMockData, ClubRecord, ApplicationRecord } from '@/services/ClubManagement';

const Dashboard: React.FC = () => {
  const [clubs, setClubs] = useState<ClubRecord[]>([]);
  const [apps, setApps] = useState<ApplicationRecord[]>([]);

  useEffect(() => {
    initMockData();
    setClubs(getClubs());
    setApps(getApplications());
  }, []);

  const totalClubs = clubs.length;
  const pendingApps = apps.filter(a => a.status === 'Pending').length;
  const approvedApps = apps.filter(a => a.status === 'Approved').length;
  const rejectedApps = apps.filter(a => a.status === 'Rejected').length;

  const clubNames = clubs.map(c => c.clubName);
  
  const pendingData = clubs.map(c => apps.filter(a => a.clubId === c.clubId && a.status === 'Pending').length);
  const approvedData = clubs.map(c => apps.filter(a => a.clubId === c.clubId && a.status === 'Approved').length);
  const rejectedData = clubs.map(c => apps.filter(a => a.clubId === c.clubId && a.status === 'Rejected').length);

  return (
    <PageContainer title="Báo cáo & Thống kê">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số CLB"
              value={totalClubs}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn chờ duyệt"
              value={pendingApps}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn đã duyệt"
              value={approvedApps}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn từ chối"
              value={rejectedApps}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Thống kê đơn đăng ký theo từng CLB" style={{ marginTop: 24 }}>
        <ColumnChart
          xAxis={clubNames}
          yAxis={[pendingData, approvedData, rejectedData]}
          yLabel={['Chờ duyệt', 'Đã duyệt', 'Từ chối']}
          colors={['#faad14', '#52c41a', '#f5222d']}
          height={400}
        />
      </Card>
    </PageContainer>
  );
};

export default Dashboard;

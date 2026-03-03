import { Tabs, Card, Row, Col, Statistic } from 'antd';
import { BookOutlined, CalendarOutlined, PushpinOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { useModel } from 'umi';
import dayjs from 'dayjs';

import SubjectsTab from './components/SubjectsTab';
import SessionsTab from './components/SessionsTab';
import ProgressTab from './components/ProgressTab';

const StudyTracker = () => {
  const { subjects, sessions } = useModel('study');

  const today = dayjs().format('YYYY-MM-DD');
  const thisMonth = dayjs().format('YYYY-MM');

  const todayMinutes = sessions
    .filter(s => s.date === today)
    .reduce((acc, cur) => acc + cur.durationMinutes, 0);

  const monthMinutes = sessions
    .filter(s => s.date.startsWith(thisMonth))
    .reduce((acc, cur) => acc + cur.durationMinutes, 0);

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}g ${m}p` : `${m}p`;
  };

  return (
    <PageContainer title="Ứng dụng Theo dõi Học tập">
      <div style={{ padding: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Hôm nay"
                value={formatTime(todayMinutes)}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Tháng này"
                value={formatTime(monthMinutes)}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#096dd9' }}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Số môn học"
                value={subjects.length}
                prefix={<PushpinOutlined />}
                valueStyle={{ color: '#389e0d' }}
              />
            </Card>
          </Col>
        </Row>

        <Card style={{ marginTop: 24 }} bordered={false}>
          <Tabs defaultActiveKey="2" size="large">
            <Tabs.TabPane
              tab={<span><BookOutlined /> Quản lý Môn học</span>}
              key="1"
            >
              <SubjectsTab />
            </Tabs.TabPane>

            <Tabs.TabPane
              tab={<span><CalendarOutlined /> Nhật ký Học tập</span>}
              key="2"
            >
              <SessionsTab />
            </Tabs.TabPane>

            <Tabs.TabPane
              tab={<span><PushpinOutlined /> Mục tiêu & Tiến độ</span>}
              key="3"
            >
              <ProgressTab />
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </div>
    </PageContainer>
  );
};

export default StudyTracker;
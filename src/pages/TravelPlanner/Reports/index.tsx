import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Typography,
  Space,
  Rate,
  Tag,
  Avatar,
  Divider,
} from 'antd';
import {
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import ColumnChart from '@/components/Chart/ColumnChart';
import DonutChart from '@/components/Chart/DonutChart';
import {
  getDestinations,
  getItineraries,
  getBudgets,
  initTravelMockData,
  DestinationRecord,
  ItineraryRecord,
  formatVND,
  DestinationType,
} from '@/services/TravelPlanner';

const { Title, Text } = Typography;

const TYPE_COLOR: Record<DestinationType, string> = {
  biển: 'blue',
  núi: 'green',
  'thành phố': 'purple',
};

const ReportsPage: React.FC = () => {
  const [destinations, setDestinations] = useState<DestinationRecord[]>([]);
  const [itineraries, setItineraries] = useState<ItineraryRecord[]>([]);

  useEffect(() => {
    initTravelMockData();
    setDestinations(getDestinations());
    setItineraries(getItineraries());
  }, []);

  const getDestById = (id: string) => destinations.find((d) => d.id === id);

  // ── Itineraries per month ──
  const { monthLabels, monthCounts } = useMemo(() => {
    const map: Record<string, number> = {};
    itineraries.forEach((it) => {
      const month = it.createdAt.slice(0, 7); // 'YYYY-MM'
      map[month] = (map[month] ?? 0) + 1;
    });
    const sorted = Object.keys(map).sort();
    return { monthLabels: sorted, monthCounts: sorted.map((m) => map[m]) };
  }, [itineraries]);

  // ── Most popular destinations ──
  const popularDests = useMemo(() => {
    const countMap: Record<string, number> = {};
    itineraries.forEach((it) => {
      it.days.forEach((day) => {
        day.destinationIds.forEach((id) => {
          countMap[id] = (countMap[id] ?? 0) + 1;
        });
      });
    });
    return Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ dest: getDestById(id), count }))
      .filter((item) => item.dest !== undefined) as { dest: DestinationRecord; count: number }[];
  }, [itineraries, destinations]);

  // ── Budget aggregation ──
  const { totalFood, totalTransport, totalAccommodation, totalRevenue } = useMemo(() => {
    let food = 0, transport = 0, accommodation = 0, revenue = 0;
    itineraries.forEach((it) => {
      it.days.forEach((day) => {
        day.destinationIds.forEach((id) => {
          const d = getDestById(id);
          if (d) {
            food += d.costFood;
            transport += d.costTransport;
            accommodation += d.costAccommodation;
            revenue += d.priceEstimate;
          }
        });
      });
    });
    // add saved "other" from budgets
    const budgets = getBudgets();
    budgets.forEach((b) => {
      revenue += b.other;
    });
    return { totalFood: food, totalTransport: transport, totalAccommodation: accommodation, totalRevenue: revenue };
  }, [itineraries, destinations]);

  const totalDests = destinations.length;
  const totalItins = itineraries.length;

  return (
    <PageContainer title="Báo cáo & Thống kê">
      {/* ── Summary Cards ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng điểm đến"
              value={totalDests}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng lịch trình"
              value={totalItins}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng chi phí ước tính (tất cả)"
              value={totalRevenue}
              formatter={(v) => formatVND(Number(v))}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Điểm đến phổ biến nhất"
              value={popularDests[0]?.dest.name ?? '—'}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14', fontSize: 16 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        {/* ── Column Chart: Itineraries per month ── */}
        <Col xs={24} lg={12}>
          <Card title="Số lịch trình tạo mỗi tháng">
            {monthLabels.length > 0 ? (
              <ColumnChart
                xAxis={monthLabels}
                yAxis={[monthCounts]}
                yLabel={['Số lịch trình']}
                colors={['#1890ff']}
                height={300}
                formatY={(v) => String(v)}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 60, color: '#bfbfbf' }}>
                Chưa có dữ liệu
              </div>
            )}
          </Card>
        </Col>

        {/* ── Donut Chart: Budget distribution ── */}
        <Col xs={24} lg={12}>
          <Card title="Phân bổ ngân sách theo danh mục">
            <DonutChart
              xAxis={['🍜 Ăn uống', '🚌 Di chuyển', '🏨 Lưu trú']}
              yAxis={[[totalFood, totalTransport, totalAccommodation]]}
              colors={['#fa8c16', '#1890ff', '#722ed1']}
              height={300}
              formatY={(v) => formatVND(v)}
              showTotal
            />
          </Card>
        </Col>

        {/* ── Top destinations list ── */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <TrophyOutlined style={{ color: '#faad14' }} />
                Top điểm đến được thêm nhiều nhất
              </Space>
            }
          >
            {popularDests.length > 0 ? (
              <List
                dataSource={popularDests}
                renderItem={({ dest, count }, index) => (
                  <List.Item key={dest.id}>
                    <List.Item.Meta
                      avatar={
                        <Space>
                          <Text
                            strong
                            style={{
                              fontSize: 18,
                              color: index < 3 ? '#faad14' : '#8c8c8c',
                              width: 24,
                              textAlign: 'center',
                            }}
                          >
                            #{index + 1}
                          </Text>
                          <Avatar
                            src={dest.image}
                            shape="square"
                            size={48}
                            style={{ borderRadius: 6 }}
                          />
                        </Space>
                      }
                      title={
                        <Space>
                          <Text strong>{dest.name}</Text>
                          <Tag color={TYPE_COLOR[dest.type]}>{dest.type}</Tag>
                        </Space>
                      }
                      description={
                        <Space>
                          <Rate allowHalf disabled value={dest.rating} style={{ fontSize: 12 }} />
                          <Text type="secondary">{formatVND(dest.priceEstimate)}</Text>
                        </Space>
                      }
                    />
                    <div>
                      <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                        {count}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        lần thêm
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#bfbfbf' }}>
                Chưa có lịch trình nào
              </div>
            )}
          </Card>
        </Col>

        {/* ── All destinations quick view ── */}
        <Col xs={24} md={12}>
          <Card title="Danh sách điểm đến theo loại">
            {(['biển', 'núi', 'thành phố'] as DestinationType[]).map((type) => {
              const typeDests = destinations.filter((d) => d.type === type);
              return (
                <div key={type} style={{ marginBottom: 16 }}>
                  <Space style={{ marginBottom: 8 }}>
                    <Tag color={TYPE_COLOR[type]}>
                      {type === 'biển' ? '🏖️' : type === 'núi' ? '⛰️' : '🏙️'} {type.toUpperCase()}
                    </Tag>
                    <Text type="secondary">{typeDests.length} điểm đến</Text>
                  </Space>
                  <Row gutter={[8, 8]}>
                    {typeDests.map((d) => (
                      <Col key={d.id}>
                        <Tag>{d.name}</Tag>
                      </Col>
                    ))}
                  </Row>
                  <Divider style={{ margin: '10px 0' }} />
                </div>
              );
            })}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default ReportsPage;

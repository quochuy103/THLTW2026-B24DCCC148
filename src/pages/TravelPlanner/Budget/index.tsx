import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Card,
  Row,
  Col,
  Select,
  InputNumber,
  Alert,
  Typography,
  Progress,
  Statistic,
  Empty,
  Button,
  message,
} from 'antd';
import {
  DollarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import DonutChart from '@/components/Chart/DonutChart';
import ColumnChart from '@/components/Chart/ColumnChart';
import {
  getDestinations,
  getItineraries,
  getBudgetByItinerary,
  upsertBudget,
  initTravelMockData,
  DestinationRecord,
  ItineraryRecord,
  BudgetRecord,
  formatVND,
} from '@/services/TravelPlanner';

const { Text } = Typography;
const { Option } = Select;

const BudgetPage: React.FC = () => {
  const [destinations, setDestinations] = useState<DestinationRecord[]>([]);
  const [itineraries, setItineraries] = useState<ItineraryRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [budgetLimit, setBudgetLimit] = useState<number>(0);
  const [other, setOther] = useState<number>(0);

  useEffect(() => {
    initTravelMockData();
    const dests = getDestinations();
    const itins = getItineraries();
    setDestinations(dests);
    setItineraries(itins);
    if (itins.length > 0) {
      const id = itins[0].itineraryId;
      setActiveId(id);
      loadBudget(id);
    }
  }, []);

  const loadBudget = (id: string) => {
    const b = getBudgetByItinerary(id);
    setBudgetLimit(b.budgetLimit);
    setOther(b.other);
  };

  const handleSelectItinerary = (id: string) => {
    setActiveId(id);
    loadBudget(id);
  };

  const handleSave = () => {
    if (!activeId) return;
    const rec: BudgetRecord = { itineraryId: activeId, budgetLimit, other };
    upsertBudget(rec);
    message.success('Đã lưu ngân sách');
  };

  const activeItinerary = itineraries.find((i) => i.itineraryId === activeId) ?? null;
  const getDestById = (id: string) => destinations.find((d) => d.id === id);

  // ── Aggregate costs ──
  const { totalFood, totalTransport, totalAccommodation, totalFromDests } = useMemo(() => {
    if (!activeItinerary) return { totalFood: 0, totalTransport: 0, totalAccommodation: 0, totalFromDests: 0 };
    let food = 0, transport = 0, accommodation = 0, fromDests = 0;
    activeItinerary.days.forEach((day) => {
      day.destinationIds.forEach((id) => {
        const d = getDestById(id);
        if (d) {
          food += d.costFood;
          transport += d.costTransport;
          accommodation += d.costAccommodation;
          fromDests += d.priceEstimate;
        }
      });
    });
    return { totalFood: food, totalTransport: transport, totalAccommodation: accommodation, totalFromDests: fromDests };
  }, [activeItinerary, destinations]);

  const totalOther = other;
  const grandTotal = totalFromDests + totalOther;
  const remaining = budgetLimit - grandTotal;
  const isOverBudget = budgetLimit > 0 && grandTotal > budgetLimit;
  const percent = budgetLimit > 0 ? Math.min(Math.round((grandTotal / budgetLimit) * 100), 100) : 0;

  // ── Per-day budget breakdown ──
  const dayLabels = activeItinerary?.days.map((d, i) => `Ngày ${i + 1}`) ?? [];
  const dayValues = activeItinerary?.days.map((day) =>
    day.destinationIds.reduce((s, id) => s + (getDestById(id)?.priceEstimate ?? 0), 0),
  ) ?? [];

  return (
    <PageContainer title="Quản lý ngân sách">
      {/* Itinerary selector + limit input */}
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Text strong>Chọn lịch trình: </Text>
            <Select
              value={activeId}
              onChange={handleSelectItinerary}
              style={{ width: '100%', marginTop: 4 }}
              placeholder="Chọn lịch trình..."
            >
              {itineraries.map((it) => (
                <Option key={it.itineraryId} value={it.itineraryId}>
                  📅 {it.title}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Ngân sách giới hạn (VNĐ): </Text>
            <InputNumber
              style={{ width: '100%', marginTop: 4 }}
              min={0}
              step={500000}
              value={budgetLimit}
              onChange={(v) => setBudgetLimit(v ?? 0)}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => Number(v?.replace(/,/g, '') ?? 0)}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Text strong>Chi phí khác (VNĐ): </Text>
            <InputNumber
              style={{ width: '100%', marginTop: 4 }}
              min={0}
              step={100000}
              value={other}
              onChange={(v) => setOther(v ?? 0)}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => Number(v?.replace(/,/g, '') ?? 0)}
            />
          </Col>
          <Col xs={24} sm={12} md={4} style={{ display: 'flex', alignItems: 'flex-end', paddingTop: 22 }}>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} block>
              Lưu
            </Button>
          </Col>
        </Row>
      </Card>

      {activeItinerary ? (
        <>
          {/* ── Budget Status Alert ── */}
          {budgetLimit > 0 &&
            (isOverBudget ? (
              <Alert
                type="error"
                icon={<WarningOutlined />}
                showIcon
                message={`Vượt ngân sách! Bạn đã vượt ${formatVND(grandTotal - budgetLimit)} so với giới hạn.`}
                style={{ marginBottom: 20 }}
              />
            ) : (
              <Alert
                type="success"
                icon={<CheckCircleOutlined />}
                showIcon
                message={`Trong ngân sách! Còn lại ${formatVND(remaining)}.`}
                style={{ marginBottom: 20 }}
              />
            ))}

          <Row gutter={[20, 20]}>
            {/* ── Summary cards ── */}
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng chi phí ước tính"
                  value={grandTotal}
                  formatter={(v) => formatVND(Number(v))}
                  valueStyle={{ color: isOverBudget ? '#f5222d' : '#1890ff', fontSize: 18 }}
                  prefix={<DollarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Giới hạn ngân sách"
                  value={budgetLimit || '—'}
                  formatter={(v) => (v === '—' ? '—' : formatVND(Number(v)))}
                  valueStyle={{ fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Còn lại"
                  value={budgetLimit > 0 ? remaining : '—'}
                  formatter={(v) => (v === '—' ? '—' : formatVND(Number(v)))}
                  valueStyle={{ color: remaining >= 0 ? '#52c41a' : '#f5222d', fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Text strong>Tỷ lệ sử dụng ngân sách</Text>
                <Progress
                  percent={percent}
                  status={isOverBudget ? 'exception' : percent > 80 ? 'active' : 'normal'}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>

            {/* ── Category breakdown (DonutChart) ── */}
            <Col xs={24} md={12}>
              <Card title="Phân bổ chi phí theo danh mục">
                <DonutChart
                  xAxis={['🍜 Ăn uống', '🚌 Di chuyển', '🏨 Lưu trú', '✨ Khác']}
                  yAxis={[[totalFood, totalTransport, totalAccommodation, totalOther]]}
                  yLabel={['Chi phí']}
                  colors={['#fa8c16', '#1890ff', '#722ed1', '#52c41a']}
                  height={300}
                  formatY={(v) => formatVND(v)}
                  showTotal
                />
              </Card>
            </Col>

            {/* ── Per-day chart (ColumnChart) ── */}
            <Col xs={24} md={12}>
              <Card title="Chi phí theo từng ngày">
                {dayValues.length > 0 ? (
                  <ColumnChart
                    xAxis={dayLabels}
                    yAxis={[dayValues]}
                    yLabel={['Chi phí']}
                    colors={['#1890ff']}
                    height={300}
                    formatY={(v) => formatVND(v)}
                  />
                ) : (
                  <Empty description="Chưa có điểm đến trong lịch trình" />
                )}
              </Card>
            </Col>

            {/* ── Category detail table ── */}
            <Col xs={24}>
              <Card title="Chi tiết danh mục chi phí">
                <Row gutter={[16, 16]}>
                  {[
                    { label: '🍜 Ăn uống', value: totalFood, color: '#fa8c16' },
                    { label: '🚌 Di chuyển', value: totalTransport, color: '#1890ff' },
                    { label: '🏨 Lưu trú', value: totalAccommodation, color: '#722ed1' },
                    { label: '✨ Chi phí khác', value: totalOther, color: '#52c41a' },
                  ].map((cat) => (
                    <Col xs={24} sm={12} md={6} key={cat.label}>
                      <Card
                        size="small"
                        style={{ borderLeft: `4px solid ${cat.color}`, borderRadius: 8 }}
                      >
                        <Statistic
                          title={cat.label}
                          value={cat.value}
                          formatter={(v) => formatVND(Number(v))}
                          valueStyle={{ color: cat.color, fontSize: 16 }}
                        />
                        {grandTotal > 0 && (
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {Math.round((cat.value / grandTotal) * 100)}% tổng chi phí
                          </Text>
                        )}
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Card>
          <Empty description="Chọn một lịch trình để quản lý ngân sách" />
        </Card>
      )}
    </PageContainer>
  );
};

export default BudgetPage;

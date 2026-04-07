import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Typography,
  Divider,
  List,
  Tag,
  DatePicker,
  Empty,
  Statistic,
  Tooltip,
  Popconfirm,
  Timeline,
  Steps,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CalendarOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  EnvironmentOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  CarOutlined,
} from '@ant-design/icons';
import {
  getDestinations,
  getItineraries,
  saveItineraries,
  initTravelMockData,
  DestinationRecord,
  ItineraryRecord,
  formatVND,
} from '@/services/TravelPlanner';
import moment from 'moment';

const { Title, Text } = Typography;
const { Step } = Steps;

const ItineraryPage: React.FC = () => {
  const [destinations, setDestinations] = useState<DestinationRecord[]>([]);
  const [itineraries, setItineraries] = useState<ItineraryRecord[]>([]);
  const [activeItineraryId, setActiveItineraryId] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();

  const [addDestModalOpen, setAddDestModalOpen] = useState(false);
  const [addDestDayIndex, setAddDestDayIndex] = useState<number>(-1);
  const [destSearch, setDestSearch] = useState('');

  useEffect(() => {
    initTravelMockData();
    const dests = getDestinations();
    const itins = getItineraries();
    setDestinations(dests);
    setItineraries(itins);

  }, []);

  const activeItinerary = itineraries.find((i) => i.itineraryId === activeItineraryId) ?? null;

  const getDestById = (id: string) => destinations.find((d) => d.id === id);

  const totalBudget = activeItinerary
    ? activeItinerary.days.reduce((sum, day) => {
        return (
          sum +
          day.destinationIds.reduce((s, id) => s + (getDestById(id)?.priceEstimate ?? 0), 0)
        );
      }, 0)
    : 0;

  const estimatedHours = activeItinerary
    ? activeItinerary.days.reduce((sum, day) => {
        const destHours = day.destinationIds.reduce(
          (s, id) => s + (getDestById(id)?.visitDuration ?? 0),
          0,
        );
        return sum + destHours + (day.destinationIds.length > 1 ? 2 : 0);
      }, 0)
    : 0;

  const persist = (updated: ItineraryRecord[]) => {
    setItineraries(updated);
    saveItineraries(updated);
  };

  const handleCreateItinerary = () => {
    createForm.validateFields().then((values) => {
      const dates: moment.Moment[] = values.dateRange;
      const startDate = dates[0];
      const endDate = dates[1];
      const numDays = endDate.diff(startDate, 'days') + 1;

      const days = Array.from({ length: numDays }, (_, i) => ({
        date: startDate.clone().add(i, 'days').format('YYYY-MM-DD'),
        destinationIds: [],
      }));

      const newItin: ItineraryRecord = {
        itineraryId: `IT${Date.now()}`,
        title: values.title,
        createdAt: new Date().toISOString(),
        peopleCount: values.peopleCount || 2,
        days,
      };

      const updated = [...itineraries, newItin];
      persist(updated);
      setActiveItineraryId(newItin.itineraryId);
      setCreateModalOpen(false);
      createForm.resetFields();
      message.success('Đã tạo lịch trình mới!');
    });
  };

  const handleDeleteItinerary = (id: string) => {
    const updated = itineraries.filter((i) => i.itineraryId !== id);
    persist(updated);
    if (activeItineraryId === id) setActiveItineraryId(updated[0]?.itineraryId ?? null);
    message.success('Đã xóa lịch trình');
  };

  const handleAddDay = () => {
    if (!activeItinerary) return;
    const lastDay = activeItinerary.days[activeItinerary.days.length - 1];
    const nextDate = lastDay
      ? moment(lastDay.date).add(1, 'days').format('YYYY-MM-DD')
      : moment().format('YYYY-MM-DD');

    const newDay = { date: nextDate, destinationIds: [] };
    const updatedItin = { ...activeItinerary, days: [...activeItinerary.days, newDay] };
    persist(itineraries.map((it) => (it.itineraryId === activeItinerary.itineraryId ? updatedItin : it)));
    message.success('Đã thêm 1 ngày mới vào lịch trình!');
  };


  const openAddDest = (dayIndex: number) => {
    setAddDestDayIndex(dayIndex);
    setDestSearch('');
    setAddDestModalOpen(true);
  };

  const handleAddDest = (destId: string) => {
    if (!activeItinerary) return;
    const day = activeItinerary.days[addDestDayIndex];
    if (day.destinationIds.includes(destId)) {
      message.warning('Điểm đến đã có trong ngày này');
      return;
    }
    const updatedDays = activeItinerary.days.map((d, i) =>
      i === addDestDayIndex ? { ...d, destinationIds: [...d.destinationIds, destId] } : d,
    );
    const updatedItin = { ...activeItinerary, days: updatedDays };
    persist(itineraries.map((it) => (it.itineraryId === activeItinerary.itineraryId ? updatedItin : it)));
    message.success('Đã thêm điểm đến!');
    setAddDestModalOpen(false);
  };

  const handleRemoveDest = (dayIndex: number, destId: string) => {
    if (!activeItinerary) return;
    const updatedDays = activeItinerary.days.map((d, i) =>
      i === dayIndex ? { ...d, destinationIds: d.destinationIds.filter((id) => id !== destId) } : d,
    );
    const updatedItin = { ...activeItinerary, days: updatedDays };
    persist(itineraries.map((it) => (it.itineraryId === activeItinerary.itineraryId ? updatedItin : it)));
  };

  const moveDestination = (dayIndex: number, destIndex: number, direction: 'up' | 'down') => {
    if (!activeItinerary) return;
    const day = activeItinerary.days[dayIndex];
    const ids = [...day.destinationIds];
    const swapIdx = direction === 'up' ? destIndex - 1 : destIndex + 1;
    if (swapIdx < 0 || swapIdx >= ids.length) return;
    [ids[destIndex], ids[swapIdx]] = [ids[swapIdx], ids[destIndex]];
    const updatedDays = activeItinerary.days.map((d, i) =>
      i === dayIndex ? { ...d, destinationIds: ids } : d,
    );
    const updatedItin = { ...activeItinerary, days: updatedDays };
    persist(itineraries.map((it) => (it.itineraryId === activeItinerary.itineraryId ? updatedItin : it)));
  };

  const availableDestinations = destinations.filter((d) =>
    d.name.toLowerCase().includes(destSearch.toLowerCase()),
  );

  return (
    <PageContainer title="Quản lý lịch trình du lịch">
      {!activeItinerary ? (
        <Card
          title="Danh sách lịch trình của bạn"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              Tạo lịch trình mới
            </Button>
          }
        >
          {itineraries.length === 0 ? (
            <Empty description="Bạn chưa có lịch trình nào. Hãy tạo mới!" />
          ) : (
            <Row gutter={[16, 16]}>
              {itineraries.map((it) => {
                const days = it.days.length;
                const totalDest = it.days.reduce((s, d) => s + d.destinationIds.length, 0);
                const budget = it.days.reduce((sum, day) => {
                  return sum + day.destinationIds.reduce((s, id) => s + (getDestById(id)?.priceEstimate ?? 0), 0);
                }, 0);

                return (
                  <Col xs={24} sm={12} md={8} key={it.itineraryId}>
                    <Card
                      hoverable
                      onClick={() => setActiveItineraryId(it.itineraryId)}
                      style={{ borderRadius: 8 }}
                      bodyStyle={{ padding: 16 }}
                    >
                      <Title level={5} ellipsis={{ rows: 1 }} style={{ marginBottom: 4 }}>
                        {it.title}
                      </Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <CalendarOutlined /> Tự động: {new Date(it.createdAt).toLocaleDateString('vi-VN')}
                      </Text>
                      <Divider style={{ margin: '12px 0' }} />
                      <Space direction="vertical" size={2}>
                        <Text><CalendarOutlined /> {days} ngày</Text>
                        <Text><EnvironmentOutlined /> {totalDest} điểm đến</Text>
                        <Text strong style={{ color: '#52c41a' }}>
                          <DollarOutlined /> {formatVND(budget)}
                        </Text>
                      </Space>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Card>
      ) : (
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Row align="middle" justify="space-between" style={{ marginBottom: 24, background: '#fff', padding: '16px 24px', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Col xs={24} md={16}>
              <Space align="center" size={16}>
                <Button icon={<ArrowLeftOutlined />} shape="circle" onClick={() => setActiveItineraryId(null)} />
                <div>
                  <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
                    {activeItinerary.title}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {activeItinerary.days.length > 0 && `${activeItinerary.days[0].date} - ${activeItinerary.days[activeItinerary.days.length - 1].date}`} | {activeItinerary.peopleCount || 2} người | Ngân sách ước tính: {formatVND(totalBudget)}
                  </Text>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right', marginTop: window.innerWidth < 768 ? 16 : 0 }}>
              <Space>
                <Button icon={<ShareAltOutlined />} onClick={() => message.info('Tính năng đang phát triển')}>Chia sẻ</Button>
                <Button icon={<PrinterOutlined />} onClick={() => message.info('Tính năng đang phát triển')}>Xuất PDF</Button>
                <Popconfirm
                  title="Xóa lịch trình này?"
                  onConfirm={() => handleDeleteItinerary(activeItinerary.itineraryId)}
                >
                  <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                </Popconfirm>
              </Space>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            
            <Col xs={24} lg={5}>
              <Card title="Hành trình" size="small" style={{ position: 'sticky', top: 24 }}>
                <Steps direction="vertical" size="small" current={-1}>
                  {activeItinerary.days.map((day, i) => (
                    <Step
                      key={i}
                      title={`Ngày ${i + 1}`}
                      description={day.date}
                      status="wait"
                      icon={<CalendarOutlined style={{ fontSize: 14 }} />}
                    />
                  ))}
                </Steps>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Chi tiết lịch trình" bodyStyle={{ padding: '24px 16px' }}>
                <Timeline mode="left">
                  {activeItinerary.days.map((day, dayIndex) => {
                    const dayNodes = [];

                    dayNodes.push(
                      <Timeline.Item key={`day-${dayIndex}`} dot={<CalendarOutlined style={{ fontSize: '18px', color: '#1890ff' }} />}>
                        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                          <Col>
                            <Title level={5} style={{ margin: 0, color: '#1890ff' }}>Ngày {dayIndex + 1} ({day.date})</Title>
                          </Col>
                          <Col>
                            <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={() => openAddDest(dayIndex)}>
                              Thêm điểm đến
                            </Button>
                          </Col>
                        </Row>
                        {day.destinationIds.length === 0 && (
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Lịch trình ngày này đang trống" />
                        )}
                      </Timeline.Item>
                    );

                    day.destinationIds.forEach((destId, destIndex) => {
                      const dest = getDestById(destId);
                      if (!dest) return;

                      if (destIndex > 0) {
                        dayNodes.push(
                          <Timeline.Item key={`travel-${dayIndex}-${destIndex}`} dot={<CarOutlined style={{ fontSize: '14px', color: '#8c8c8c' }} />}>
                            <Text type="secondary" style={{ fontStyle: 'italic', fontSize: 12 }}>Di chuyển: ~30p (Theo đề xuất hệ thống)</Text>
                          </Timeline.Item>
                        );
                      }

                      dayNodes.push(
                        <Timeline.Item key={`dest-${dayIndex}-${destIndex}`} dot={<div style={{ width: 12, height: 12, borderRadius: '50%', background: dest.type === 'biển' ? '#1890ff' : dest.type === 'núi' ? '#52c41a' : '#722ed1', border: '2px solid #fff', boxShadow: '0 0 0 2px rgba(0,0,0,0.1)' }} />}>
                          <Card 
                            size="small" 
                            style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}
                            bodyStyle={{ padding: 0 }}
                          >
                            <Row wrap={false}>
                              <Col flex="120px">
                                <img src={dest.image} style={{ width: 120, height: '100%', objectFit: 'cover' }} alt={dest.name} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              </Col>
                              <Col flex="auto" style={{ padding: '12px 16px' }}>
                                <Row justify="space-between">
                                  <Col><Text strong style={{ fontSize: 16 }}>{dest.name}</Text></Col>
                                  <Col>
                                    <Space size={4}>
                                      <Tooltip title="Di chuyển lên"><Button size="small" type="text" icon={<ArrowUpOutlined />} disabled={destIndex === 0} onClick={() => moveDestination(dayIndex, destIndex, 'up')} /></Tooltip>
                                      <Tooltip title="Di chuyển xuống"><Button size="small" type="text" icon={<ArrowDownOutlined />} disabled={destIndex === day.destinationIds.length - 1} onClick={() => moveDestination(dayIndex, destIndex, 'down')} /></Tooltip>
                                      <Popconfirm title="Xóa?" onConfirm={() => handleRemoveDest(dayIndex, destId)}>
                                        <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                                      </Popconfirm>
                                    </Space>
                                  </Col>
                                </Row>
                                
                                <Space style={{ marginTop: 8, marginBottom: 8 }} size={[0, 8]} wrap>
                                  <Tag color={dest.type === 'biển' ? 'blue' : dest.type === 'núi' ? 'green' : 'purple'}>#{dest.type.toUpperCase()}</Tag>
                                  <Tag color="volcano">#Check-in</Tag>
                                  <Tag color="orange">#Khám phá</Tag>
                                </Space>

                                <Space size="large" style={{ display: 'flex', width: '100%' }}>
                                  <Text type="secondary" style={{ fontSize: 13 }}><ClockCircleOutlined /> Thời gian: {dest.visitDuration}h</Text>
                                  <Text strong style={{ fontSize: 13, color: '#ff4d4f' }}><DollarOutlined /> {formatVND(dest.priceEstimate)}</Text>
                                </Space>
                              </Col>
                            </Row>
                          </Card>
                        </Timeline.Item>
                      );
                    });

                    return dayNodes;
                  })}
                </Timeline>
                
                <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAddDay} style={{ marginTop: 16 }}>
                  Thêm ngày mới vào lịch trình
                </Button>
              </Card>
            </Col>

            <Col xs={24} lg={7}>
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <Card title="Khám phá khu vực" size="small" bodyStyle={{ padding: 0 }}>
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.802545904297!2d108.21995801485854!3d16.07573298887693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314218314ba6e271%3A0xe54e2fe59170e7e1!2sDragon%20Bridge!5e0!3m2!1sen!2s!4v1655184200000!5m2!1sen!2s" 
                    width="100%" 
                    height="250" 
                    style={{ border: 0, display: 'block' }} 
                    allowFullScreen={false} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </Card>

                <Card title={<Space><FileTextOutlined /> Tóm tắt tài chính</Space>} size="small">
                  <Statistic
                    title="Tổng ngân sách"
                    value={totalBudget}
                    formatter={(v) => formatVND(Number(v))}
                    valueStyle={{ color: '#52c41a', fontSize: 24, fontWeight: 600 }}
                  />
                  <Divider style={{ margin: '12px 0' }} />
                  <Statistic
                    title="Ước tính thời gian cần"
                    value={estimatedHours}
                    suffix="giờ"
                    valueStyle={{ fontSize: 18 }}
                  />
                  <Divider style={{ margin: '12px 0' }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Cơ cấu chi phí
                  </Text>
                  <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                    <Col span={12}><Card size="small" bodyStyle={{ padding: 8 }}><Text type="secondary" style={{fontSize: 11}}>Ăn uống</Text><br/><strong>~30%</strong></Card></Col>
                    <Col span={12}><Card size="small" bodyStyle={{ padding: 8 }}><Text type="secondary" style={{fontSize: 11}}>Di chuyển</Text><br/><strong>~20%</strong></Card></Col>
                    <Col span={12}><Card size="small" bodyStyle={{ padding: 8 }}><Text type="secondary" style={{fontSize: 11}}>Lưu trú</Text><br/><strong>~40%</strong></Card></Col>
                    <Col span={12}><Card size="small" bodyStyle={{ padding: 8 }}><Text type="secondary" style={{fontSize: 11}}>Dự phòng</Text><br/><strong>~10%</strong></Card></Col>
                  </Row>
                </Card>
              </Space>
            </Col>
          </Row>
        </div>
      )}

      <Modal
        title="Tạo lịch trình mới"
        visible={createModalOpen}
        onOk={handleCreateItinerary}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); }}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form form={createForm} layout="vertical" initialValues={{ peopleCount: 2 }}>
          <Form.Item
            name="title"
            label="Tên lịch trình"
            rules={[{ required: true, message: 'Vui lòng nhập tên lịch trình!' }]}
          >
            <Input placeholder="VD: Hành trình miền Trung 2026" />
          </Form.Item>
          <Form.Item
            name="peopleCount"
            label="Số người tham gia"
            rules={[{ required: true, message: 'Vui lòng nhập số người!' }]}
          >
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="Thời gian chuyến đi"
            rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
          >
            <DatePicker.RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Thêm điểm đến vào Ngày ${addDestDayIndex + 1}`}
        visible={addDestModalOpen}
        onCancel={() => setAddDestModalOpen(false)}
        footer={null}
        width={520}
      >
        <Input
          placeholder="Tìm điểm đến..."
          value={destSearch}
          onChange={(e) => setDestSearch(e.target.value)}
          style={{ marginBottom: 12 }}
          allowClear
        />
        <List
          dataSource={availableDestinations}
          style={{ maxHeight: 360, overflowY: 'auto' }}
          renderItem={(dest) => {
            const alreadyAdded =
              activeItinerary?.days[addDestDayIndex]?.destinationIds.includes(dest.id) ?? false;
            return (
              <List.Item
                key={dest.id}
                actions={[
                  <Button
                    type="primary"
                    size="small"
                    disabled={alreadyAdded}
                    onClick={() => handleAddDest(dest.id)}
                  >
                    {alreadyAdded ? 'Đã thêm' : 'Thêm'}
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <img
                      src={dest.image}
                      alt={dest.name}
                      style={{ width: 50, height: 40, objectFit: 'cover', borderRadius: 6 }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  }
                  title={dest.name}
                  description={
                    <Space>
                      <Tag color={dest.type === 'biển' ? 'blue' : dest.type === 'núi' ? 'green' : 'purple'}>
                        {dest.type}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatVND(dest.priceEstimate)}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Modal>
    </PageContainer>
  );
};

export default ItineraryPage;

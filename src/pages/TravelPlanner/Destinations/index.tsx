import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Card,
  Row,
  Col,
  Rate,
  Tag,
  Select,
  Slider,
  Button,
  Input,
  Drawer,
  Divider,
  Typography,
  Space,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import {
  getDestinations,
  initTravelMockData,
  DestinationRecord,
  DestinationType,
  formatVND,
} from '@/services/TravelPlanner';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const TYPE_COLOR: Record<DestinationType, string> = {
  biển: 'blue',
  núi: 'green',
  'thành phố': 'purple',
};

const TYPE_EMOJI: Record<DestinationType, string> = {
  biển: '🏖️',
  núi: '⛰️',
  'thành phố': '🏙️',
};

const DestinationsPage: React.FC = () => {
  const [destinations, setDestinations] = useState<DestinationRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<DestinationType | 'all'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('default');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selDest, setSelDest] = useState<DestinationRecord | null>(null);

  useEffect(() => {
    initTravelMockData();
    setDestinations(getDestinations());
  }, []);

  const filtered = useMemo(() => {
    let list = [...destinations];

    if (search.trim()) {
      list = list.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (filterType !== 'all') {
      list = list.filter((d) => d.type === filterType);
    }
    list = list.filter(
      (d) => d.priceEstimate >= priceRange[0] && d.priceEstimate <= priceRange[1],
    );
    if (minRating > 0) {
      list = list.filter((d) => d.rating >= minRating);
    }

    switch (sortBy) {
      case 'price_asc':
        list.sort((a, b) => a.priceEstimate - b.priceEstimate);
        break;
      case 'price_desc':
        list.sort((a, b) => b.priceEstimate - a.priceEstimate);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return list;
  }, [destinations, search, filterType, priceRange, minRating, sortBy]);

  const openDetail = (dest: DestinationRecord) => {
    setSelDest(dest);
    setDrawerOpen(true);
  };

  return (
    <PageContainer title="Khám phá điểm đến">
      {/* ── Filter Bar ── */}
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm điểm đến..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={24} sm={12} md={5}>
            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: '100%' }}
              placeholder="Loại hình"
            >
              <Option value="all">Tất cả loại</Option>
              <Option value="biển">🏖️ Biển</Option>
              <Option value="núi">⛰️ Núi</Option>
              <Option value="thành phố">🏙️ Thành phố</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={5}>
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
              placeholder="Sắp xếp"
            >
              <Option value="default">Mặc định</Option>
              <Option value="price_asc">Giá tăng dần</Option>
              <Option value="price_desc">Giá giảm dần</Option>
              <Option value="rating">Đánh giá cao nhất</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Text type="secondary">
              <FilterOutlined /> Đánh giá tối thiểu
            </Text>
            <Rate
              allowHalf
              value={minRating}
              onChange={setMinRating}
              style={{ fontSize: 16 }}
            />
          </Col>

          <Col xs={24} md={4}>
            <Text type="secondary">
              <DollarOutlined /> Khoảng giá (VNĐ)
            </Text>
            <Slider
              range
              min={0}
              max={5000000}
              step={500000}
              value={priceRange}
              onChange={(val) => setPriceRange(val as [number, number])}
              tipFormatter={(v) => formatVND(v ?? 0)}
            />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {formatVND(priceRange[0])} – {formatVND(priceRange[1])}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* ── Results count ── */}
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary">
          Hiển thị <strong>{filtered.length}</strong> điểm đến
        </Text>
      </div>

      {/* ── Card Grid ── */}
      <Row gutter={[20, 20]}>
        {filtered.map((dest) => (
          <Col key={dest.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={
                <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                  <img
                    src={dest.image}
                    alt={dest.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/400x200?text=' + dest.name;
                    }}
                  />
                  <Tag
                    color={TYPE_COLOR[dest.type]}
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {TYPE_EMOJI[dest.type]} {dest.type.toUpperCase()}
                  </Tag>
                </div>
              }
              onClick={() => openDetail(dest)}
              style={{ borderRadius: 12, overflow: 'hidden', height: '100%' }}
              bodyStyle={{ padding: '14px 16px' }}
            >
              <Title level={5} ellipsis style={{ marginBottom: 4 }}>
                {dest.name}
              </Title>

              <Rate allowHalf disabled value={dest.rating} style={{ fontSize: 13 }} />

              <Divider style={{ margin: '8px 0' }} />

              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Text>
                  <DollarOutlined style={{ color: '#52c41a' }} />{' '}
                  <strong>{formatVND(dest.priceEstimate)}</strong>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {' '}
                    /người
                  </Text>
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <ClockCircleOutlined /> {dest.visitDuration}h tham quan
                </Text>
              </Space>

              <Button
                type="primary"
                size="small"
                block
                style={{ marginTop: 12, borderRadius: 6 }}
                onClick={(e) => {
                  e.stopPropagation();
                  openDetail(dest);
                }}
              >
                Xem chi tiết
              </Button>
            </Card>
          </Col>
        ))}

        {filtered.length === 0 && (
          <Col span={24} style={{ textAlign: 'center', padding: 60 }}>
            <EnvironmentOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
            <br />
            <Text type="secondary">Không tìm thấy điểm đến phù hợp</Text>
          </Col>
        )}
      </Row>

      {/* ── Detail Drawer ── */}
      <Drawer
        title={
          <Space>
            <EnvironmentOutlined />
            {selDest?.name}
            {selDest && (
              <Tag color={TYPE_COLOR[selDest.type]}>
                {TYPE_EMOJI[selDest.type]} {selDest.type}
              </Tag>
            )}
          </Space>
        }
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
      >
        {selDest && (
          <>
            <img
              src={selDest.image}
              alt={selDest.name}
              style={{ width: '100%', borderRadius: 10, marginBottom: 16, maxHeight: 240, objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/480x240?text=' + selDest.name;
              }}
            />

            <Rate allowHalf disabled value={selDest.rating} />

            <Paragraph style={{ marginTop: 12 }}>{selDest.description}</Paragraph>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary">Ước tính chi phí</Text>
                <br />
                <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                  {formatVND(selDest.priceEstimate)}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Thời gian tham quan</Text>
                <br />
                <Text strong style={{ fontSize: 18 }}>
                  {selDest.visitDuration} giờ
                </Text>
              </Col>
            </Row>

            <Divider />

            <Title level={5}>Chi tiết chi phí</Title>
            <Row gutter={[8, 8]}>
              {[
                { label: '🍜 Ăn uống', val: selDest.costFood },
                { label: '🚌 Di chuyển', val: selDest.costTransport },
                { label: '🏨 Lưu trú', val: selDest.costAccommodation },
                {
                  label: '✨ Khác',
                  val:
                    selDest.priceEstimate -
                    selDest.costFood -
                    selDest.costTransport -
                    selDest.costAccommodation,
                },
              ].map((item) => (
                <Col span={12} key={item.label}>
                  <Card size="small" style={{ borderRadius: 8 }}>
                    <Text type="secondary">{item.label}</Text>
                    <br />
                    <Text strong>{formatVND(item.val)}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default DestinationsPage;

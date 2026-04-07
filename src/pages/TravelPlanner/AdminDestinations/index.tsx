import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Space,
  Popconfirm,
  Rate,
  Tag,
  Typography,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  getDestinations,
  saveDestinations,
  initTravelMockData,
  DestinationRecord,
  DestinationType,
  formatVND,
} from '@/services/TravelPlanner';
import TinyEditor from '@/components/TinyEditor';

const { Option } = Select;
const { Text } = Typography;

const TYPE_COLOR: Record<DestinationType, string> = {
  biển: 'blue',
  núi: 'green',
  'thành phố': 'purple',
};

const AdminDestinationsPage: React.FC = () => {
  const [destinations, setDestinations] = useState<DestinationRecord[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDest, setEditingDest] = useState<DestinationRecord | null>(null);
  const [form] = Form.useForm();
  const [previewImage, setPreviewImage] = useState<string>('');

  useEffect(() => {
    initTravelMockData();
    setDestinations(getDestinations());
  }, []);

  const handleCreate = () => {
    setEditingDest(null);
    form.resetFields();
    setPreviewImage('');
    setIsModalVisible(true);
  };

  const handleEdit = (record: DestinationRecord) => {
    setEditingDest(record);
    form.setFieldsValue(record);
    setPreviewImage(record.image);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const updated = destinations.filter((d) => d.id !== id);
    setDestinations(updated);
    saveDestinations(updated);
    message.success('Đã xóa điểm đến');
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingDest) {
        const updated = destinations.map((d) =>
          d.id === editingDest.id ? { ...d, ...values } : d,
        );
        setDestinations(updated);
        saveDestinations(updated);
        message.success('Cập nhật thành công');
      } else {
        const newDest: DestinationRecord = {
          ...values,
          id: `D${Date.now()}`,
        };
        const updated = [...destinations, newDest];
        setDestinations(updated);
        saveDestinations(updated);
        message.success('Thêm mới thành công');
      }
      setIsModalVisible(false);
    });
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (url: string, record: DestinationRecord) => (
        <img
          src={url}
          alt={record.name}
          style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 6 }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x48?text=N/A';
          }}
        />
      ),
    },
    {
      title: 'Tên điểm đến',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: DestinationRecord, b: DestinationRecord) => a.name.localeCompare(b.name),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: DestinationType) => <Tag color={TYPE_COLOR[type]}>{type}</Tag>,
      filters: [
        { text: '🏖️ Biển', value: 'biển' },
        { text: '⛰️ Núi', value: 'núi' },
        { text: '🏙️ Thành phố', value: 'thành phố' },
      ],
      onFilter: (value: boolean | React.Key, record: DestinationRecord) => record.type === value,
    },
    {
      title: 'Giá ước tính',
      dataIndex: 'priceEstimate',
      key: 'priceEstimate',
      render: (v: number) => formatVND(v),
      sorter: (a: DestinationRecord, b: DestinationRecord) => a.priceEstimate - b.priceEstimate,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (v: number) => <Rate allowHalf disabled value={v} style={{ fontSize: 13 }} />,
      sorter: (a: DestinationRecord, b: DestinationRecord) => a.rating - b.rating,
    },
    {
      title: 'Thời gian TQ',
      dataIndex: 'visitDuration',
      key: 'visitDuration',
      render: (v: number) => `${v}h`,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: DestinationRecord) => (
        <Space size="small">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)}>
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Quản trị điểm đến">
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Thêm điểm đến
          </Button>
        </div>
        <Table<DestinationRecord>
          columns={columns}
          dataSource={destinations}
          rowKey="id"
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title={editingDest ? 'Sửa điểm đến' : 'Thêm điểm đến mới'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        destroyOnClose
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên điểm đến"
                rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
              >
                <Input placeholder="VD: Vịnh Hạ Long" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại hình"
                rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}
              >
                <Select placeholder="Chọn loại hình">
                  <Option value="biển">🏖️ Biển</Option>
                  <Option value="núi">⛰️ Núi</Option>
                  <Option value="thành phố">🏙️ Thành phố</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="image" label="URL ảnh">
                <Input
                  placeholder="https://..."
                  onChange={(e) => setPreviewImage(e.target.value)}
                />
              </Form.Item>
              {previewImage && (
                <img
                  src={previewImage}
                  alt="preview"
                  style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </Col>

            <Col span={8}>
              <Form.Item
                name="priceEstimate"
                label="Giá ước tính (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={100000}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(v) => Number(v?.replace(/,/g, '') ?? 0)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="visitDuration" label="Thời gian TQ (giờ)">
                <InputNumber style={{ width: '100%' }} min={0} step={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="rating" label="Đánh giá">
                <Rate allowHalf />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name="costFood" label="Chi phí Ăn uống (VNĐ)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={50000}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(v) => Number(v?.replace(/,/g, '') ?? 0)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="costTransport" label="Chi phí Di chuyển (VNĐ)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={50000}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(v) => Number(v?.replace(/,/g, '') ?? 0)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="costAccommodation" label="Chi phí Lưu trú (VNĐ)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={50000}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(v) => Number(v?.replace(/,/g, '') ?? 0)}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="description" label="Mô tả">
                <TinyEditor height={200} tinyToolbar />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default AdminDestinationsPage;

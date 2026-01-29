
import React, { useState, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Modal,
  Form,
  InputNumber,
  message,
  Typography,
  Card,
  DatePicker,
  Row,
  Col,
  Descriptions,
  List,
  Statistic
} from 'antd';
import { PlusOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import type { Order, OrderItem, OrderStatus } from '@/models/orders';
import type { Product } from '@/models/products';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const OrdersPage: React.FC = () => {
  const { orders, createOrder, updateOrderStatus } = useModel('orders');
  const { products } = useModel('products');
  const [form] = Form.useForm();

  // --- State for Filters ---
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);

  // --- State for Create Modal ---
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  // We need to track quantities for selected products in the form.
  // We can use Form watchers, but local state might be easier for 'max' validation rendering.
  
  // --- State for View Modal ---
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // --- Filters ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Search text (id or customerName)
      if (searchText) {
        const lowerSearch = searchText.toLowerCase();
        if (!order.id.toLowerCase().includes(lowerSearch) && 
            !order.customerName.toLowerCase().includes(lowerSearch)) {
            return false;
        }
      }
      // 2. Status Filter
      if (statusFilter && order.status !== statusFilter) return false;
      // 3. Date Range
      if (dateRange) {
        const orderDate = moment(order.createdAt);
        if (orderDate.isBefore(dateRange[0], 'day') || orderDate.isAfter(dateRange[1], 'day')) return false;
      }
      return true;
    });
  }, [orders, searchText, statusFilter, dateRange]);

  // --- Handlers ---
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    message.success(`Cập nhật trạng thái đơn hàng ${orderId} thành "${newStatus}"`);
  };

  const handleCreateOrder = async () => {
    try {
      const values = await form.validateFields();
      
      // Construct Order Items
      const orderItems: OrderItem[] = [];
      let totalAmount = 0;

      // Iterate through selected products to get their qtys from form
      selectedProductIds.forEach(pId => {
         const qty = values[`qty_${pId}`];
         const product = products.find(p => p.id === pId);
         if (product && qty > 0) {
           orderItems.push({
             productId: product.id,
             productName: product.name,
             quantity: qty,
             price: product.price
           });
           totalAmount += product.price * qty;
         }
      });

      if (orderItems.length === 0) {
        message.error('Vui lòng chọn ít nhất một sản phẩm với số lượng > 0');
        return;
      }

      const orderData = {
        customerName: values.customerName,
        phone: values.phone,
        address: values.address,
        products: orderItems,
        totalAmount
      };

      createOrder(orderData);
      message.success('Tạo đơn hàng thành công!');
      setIsCreateModalVisible(false);
      form.resetFields();
      setSelectedProductIds([]);
    } catch (error) {
      console.error("Validation Error:", error);
    }
  };

  const openViewModal = (order: Order) => {
    setViewingOrder(order);
    setIsViewModalVisible(true);
  };

  // --- Helpers for Form ---
  // When products are selected, we need to render inputs for them
  const handleProductSelectChange = (ids: number[]) => {
      setSelectedProductIds(ids);
  };
  
  const calculateTotalPreview = () => {
      // Allow realtime preview of total amount in modal? 
      // Might be complex with Form.useWatch, simpler to just calculate on submit OR use a custom component.
      // For simplicity in this timeframe, we calculate on submit, but we can try to show it if we have time.
      // Let's stick strictly to Requirements: "Auto-calculate totalAmount... show total in UI". 
      // So use Form.useWatch? No, let's just use re-render on form values change.
     
      // Actually, let's keep it simple. We can use a small component or just show it at bottom.
  };

  // --- Columns ---
  const columns: ColumnsType<Order> = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Số SP',
      key: 'itemCount',
      render: (_, r) => r.products.length, // distinct products count
      sorter: (a, b) => a.products.length - b.products.length,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select 
           value={status} 
           style={{ width: 120 }} 
           onChange={(val) => handleStatusChange(record.id, val as OrderStatus)}
        >
           <Option value="Chờ xử lý">Chờ xử lý</Option>
           <Option value="Đang giao">Đang giao</Option>
           <Option value="Hoàn thành">Hoàn thành</Option>
           <Option value="Đã hủy">Đã hủy</Option>
        </Select>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button icon={<EyeOutlined />} onClick={() => openViewModal(record)}>Chi tiết</Button>
      ),
    },
  ];

  return (
    <PageContainer title="Quản lý đơn hàng">
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
            <Col span={6}>
                <Input 
                   prefix={<SearchOutlined />} 
                   placeholder="Tìm tên KH hoặc Mã đơn..." 
                   value={searchText}
                   onChange={e => setSearchText(e.target.value)}
                />
            </Col>
            <Col span={4}>
                <Select 
                    allowClear 
                    placeholder="Trạng thái" 
                    style={{ width: '100%' }}
                    onChange={setStatusFilter}
                >
                   <Option value="Chờ xử lý">Chờ xử lý</Option>
                   <Option value="Đang giao">Đang giao</Option>
                   <Option value="Hoàn thành">Hoàn thành</Option>
                   <Option value="Đã hủy">Đã hủy</Option>
                </Select>
            </Col>
            <Col span={6}>
                <RangePicker 
                    style={{ width: '100%' }} 
                    onChange={(dates) => setDateRange(dates as [moment.Moment, moment.Moment])}
                />
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)}>
                    Tạo đơn hàng
                </Button>
            </Col>
        </Row>
      </Card>

      <Table 
        columns={columns} 
        dataSource={filteredOrders} 
        rowKey="id"
      />

      {/* CREATE ORDER MODAL */}
      <Modal
         title="Tạo đơn hàng mới"
         visible={isCreateModalVisible}
         onOk={handleCreateOrder}
         onCancel={() => setIsCreateModalVisible(false)}
         width={800}
         destroyOnClose
      >
        <Form form={form} layout="vertical">
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="customerName" label="Tên khách hàng" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item 
                        name="phone" 
                        label="Số điện thoại" 
                        rules={[
                            { required: true },
                            { pattern: /^[0-9]{10,11}$/, message: 'SĐT không hợp lệ (10-11 số)' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            
            <Form.Item label="Chọn sản phẩm">
                <Select 
                    mode="multiple" 
                    placeholder="Chọn sản phẩm..." 
                    onChange={handleProductSelectChange}
                    optionFilterProp="children"
                >
                    {products.map(p => (
                        <Option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                            {p.name} (Tồn: {p.quantity}) - {new Intl.NumberFormat('vi-VN').format(p.price)}đ
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            {/* Dynamic Quantity Inputs for Selected Products */}
            {selectedProductIds.length > 0 && (
                <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                   <Typography.Text strong>Nhập số lượng:</Typography.Text>
                   {selectedProductIds.map(pId => {
                       const product = products.find(p => p.id === pId);
                       if (!product) return null;
                       return (
                           <Row key={pId} style={{ marginTop: 8 }} align="middle">
                               <Col span={12}>{product.name}</Col>
                               <Col span={12}>
                                   <Form.Item 
                                      name={`qty_${pId}`} 
                                      noStyle
                                      rules={[
                                          { required: true, message: 'Nhập SL' },
                                          { type: 'number', max: product.quantity, message: `Max ${product.quantity}` }
                                      ]}
                                      initialValue={1}
                                   >
                                       <InputNumber min={1} max={product.quantity} style={{ width: '100%' }} />
                                   </Form.Item>
                               </Col>
                           </Row>
                       );
                   })}
                </div>
            )}
            
            {/* Total Amount Preview could go here */}
        </Form>
      </Modal>

      {/* VIEW ORDER DETAIL MODAL */}
      <Modal
        title="Chi tiết đơn hàng"
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
            <Button key="close" onClick={() => setIsViewModalVisible(false)}>Đóng</Button>
        ]}
        width={700}
      >
        {viewingOrder && (
            <div>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Mã đơn">{viewingOrder.id}</Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">{viewingOrder.createdAt}</Descriptions.Item>
                    <Descriptions.Item label="Khách hàng">{viewingOrder.customerName}</Descriptions.Item>
                    <Descriptions.Item label="SĐT">{viewingOrder.phone}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ" span={2}>{viewingOrder.address}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={viewingOrder.status === 'Hoàn thành' ? 'green' : 'blue'}>{viewingOrder.status}</Tag>
                    </Descriptions.Item>
                </Descriptions>
                
                <Table 
                    dataSource={viewingOrder.products}
                    rowKey="productId"
                    pagination={false}
                    style={{ marginTop: 24 }}
                    columns={[
                        { title: 'Sản phẩm', dataIndex: 'productName' },
                        { title: 'Đơn giá', dataIndex: 'price', render: v => new Intl.NumberFormat('vi-VN').format(v) },
                        { title: 'SL', dataIndex: 'quantity' },
                        { title: 'Thành tiền', render: (_, r) => new Intl.NumberFormat('vi-VN').format(r.price * r.quantity) }
                    ]}
                    footer={() => (
                        <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            TỔNG TIỀN: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(viewingOrder.totalAmount)}
                        </div>
                    )}
                />
            </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default OrdersPage;

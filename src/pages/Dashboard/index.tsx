
import React, { useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Row, Col, Statistic, Progress, List, Typography } from 'antd';
import { ShopOutlined, ShoppingCartOutlined, DollarOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useModel } from 'umi';

const { Text } = Typography;

const DashboardPage: React.FC = () => {
  const { products } = useModel('products');
  const { orders } = useModel('orders');

  // --- Statistics ---
  const totalProducts = products.length;
  
  const totalInventoryValue = useMemo(() => {
    return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  }, [products]);

  const totalOrders = orders.length;

  const totalRevenue = useMemo(() => {
    // Revenue is usually calculated from Completed orders
    return orders
      .filter(o => o.status === 'Hoàn thành')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const ordersByStatus = useMemo(() => {
    const counts = {
      'Chờ xử lý': 0,
      'Đang giao': 0,
      'Hoàn thành': 0,
      'Đã hủy': 0
    };
    orders.forEach(o => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [orders]);

  const statusColors = {
    'Chờ xử lý': '#1890ff',
    'Đang giao': '#faad14',
    'Hoàn thành': '#52c41a',
    'Đã hủy': '#ff4d4f'
  };

  return (
    <PageContainer title="Tổng quan (Dashboard)">
      {/* Top Cards */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Tổng số sản phẩm" 
              value={totalProducts} 
              prefix={<AppstoreOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Tổng giá trị tồn kho" 
              value={totalInventoryValue} 
              precision={0}
              prefix={<ShopOutlined />}
              formatter={val => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val))}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Tổng số đơn hàng" 
              value={totalOrders} 
              prefix={<ShoppingCartOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Doanh thu (Đã hoàn thành)" 
              value={totalRevenue} 
              precision={0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
              formatter={val => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val))}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts / Progress */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Trạng thái đơn hàng">
             <List
                dataSource={Object.entries(ordersByStatus)}
                renderItem={([status, count]) => {
                   const percent = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
                   return (
                       <div style={{ marginBottom: 16 }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                               <Text>{status}</Text>
                               <Text>{count} đơn</Text>
                           </div>
                           <Progress 
                              percent={percent} 
                              strokeColor={statusColors[status as keyof typeof statusColors]} 
                              format={p => `${p?.toFixed(1)}%`}
                           />
                       </div>
                   );
                }}
             />
          </Card>
        </Col>
        <Col span={12}>
          {/* Using Ant Design Table/List as a simple "Recent Orders" view could be nice */}
          <Card title="Sản phẩm sắp hết hàng (< 10)">
              <List
                 dataSource={products.filter(p => p.quantity <= 10).slice(0, 5)}
                 renderItem={item => (
                     <List.Item>
                         <List.Item.Meta
                             title={item.name}
                             description={`Tồn kho: ${item.quantity}`} 
                         />
                         <div>
                             {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                         </div>
                     </List.Item>
                 )}
                 locale={{ emptyText: 'Không có sản phẩm nào sắp hết hàng' }}
              />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DashboardPage;


import React, { useState, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Card,
  Row,
  Col,
  Tag,
  Modal,
  Form,
  InputNumber,
  message,
  Popconfirm,
  Slider,
  Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import type { Product } from '@/models/products';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { Text } = Typography;

const ProductsPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useModel('products');
  const [form] = Form.useForm();

  // --- State for Filters ---
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);

  // --- State for Modal ---
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // --- Derived Data for Filters ---
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats);
  }, [products]);

  const maxPrice = useMemo(() => {
     return products.reduce((max, p) => p.price > max ? p.price : max, 0) || 100000000;
  }, [products]);

  // --- Filter & Sort Logic ---
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Name Search
      if (searchText && !p.name.toLowerCase().includes(searchText.toLowerCase())) return false;
      // 2. Category Filter
      if (categoryFilter && p.category !== categoryFilter) return false;
      // 3. Price Range
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      // 4. Status Filter
      if (statusFilter) {
        if (statusFilter === 'conhang' && p.quantity <= 10) return false;
        if (statusFilter === 'saphet' && (p.quantity === 0 || p.quantity > 10)) return false;
        if (statusFilter === 'hethang' && p.quantity > 0) return false;
      }
      return true;
    });
  }, [products, searchText, categoryFilter, priceRange, statusFilter]);

  // --- Handlers ---
  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Product) => {
    setEditingProduct(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    deleteProduct(id);
    message.success('Xóa sản phẩm thành công!');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingProduct) {
        updateProduct(editingProduct.id, values);
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        addProduct(values);
        message.success('Thêm sản phẩm mới thành công!');
      }
      setIsModalVisible(false);
    } catch (error) {
       console.error("Validation failed:", error);
    }
  };

  // --- Columns ---
  const columns: ColumnsType<Product> = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price,
      render: (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        let color = 'green';
        let text = 'Còn hàng';
        if (record.quantity === 0) {
          color = 'red';
          text = 'Hết hàng';
        } else if (record.quantity <= 10) {
          color = 'orange';
          text = 'Sắp hết';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} type="link" />
          <Popconfirm
            title="Bạn có chắc muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} danger type="link" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Quản lý sản phẩm">
      <Card title="Bộ lọc & Tìm kiếm" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
             <Input 
                prefix={<SearchOutlined />} 
                placeholder="Tìm kiếm theo tên..." 
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
             />
          </Col>
          <Col span={4}>
            <Select 
                allowClear 
                placeholder="Danh mục" 
                style={{ width: '100%' }}
                onChange={setCategoryFilter}
            >
              {categories.map(c => <Option key={c} value={c}>{c}</Option>)}
            </Select>
          </Col>
          <Col span={4}>
            <Select 
                allowClear 
                placeholder="Trạng thái" 
                style={{ width: '100%' }}
                onChange={setStatusFilter}
            >
               <Option value="conhang">Còn hàng (&gt;10)</Option>
               <Option value="saphet">Sắp hết (1-10)</Option>
               <Option value="hethang">Hết hàng (0)</Option>
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ paddingLeft: 8 }}>
                <Text>Khoảng giá: </Text>
                <Slider 
                    range 
                    min={0} 
                    max={maxPrice * 1.5} 
                    step={100000}
                    defaultValue={[0, 100000000]}
                    onChange={(val) => setPriceRange(val as [number, number])}
                    tipFormatter={val => new Intl.NumberFormat('vi-VN').format(val || 0)}
                />
            </div>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  Thêm mới
              </Button>
          </Col>
        </Row>
      </Card>

      <Table 
        columns={columns} 
        dataSource={filteredProducts} 
        rowKey="id" 
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
            <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
                <Input />
            </Form.Item>
            <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Vui lòng nhập danh mục' }]}>
                {/* User can type new category or select existing */}
                <Select mode="tags" tokenSeparators={[',']}>
                     {categories.map(c => <Option key={c} value={c}>{c}</Option>)}
                </Select>
            </Form.Item>
            <Form.Item name="price" label="Giá (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
                <InputNumber<number>
                    style={{ width: '100%' }} 
                    min={0} 
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => (value ? parseFloat(value.replace(/\$\s?|(,*)/g, '')) : 0)}
                />
            </Form.Item>
            <Form.Item name="quantity" label="Số lượng tồn kho" rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}>
                <InputNumber style={{ width: '100%' }} min={0} precision={0} />
            </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ProductsPage;

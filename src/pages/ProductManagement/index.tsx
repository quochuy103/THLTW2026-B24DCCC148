import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Popconfirm, message, Card } from 'antd';
import { DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const initialData: Product[] = [
  { id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
  { id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
  { id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
  { id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
];

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // Handle Delete
  const handleDelete = (id: number) => {
    const newProducts = products.filter((item) => item.id !== id);
    setProducts(newProducts);
    message.success('Xóa sản phẩm thành công');
  };

  // Handle Add or Edit
  const handleSave = (values: any) => {
    if (editingProduct) {
      // Edit mode
      const updatedProducts = products.map((item) =>
        item.id === editingProduct.id
          ? { ...item, name: values.name, price: values.price, quantity: values.quantity }
          : item
      );
      setProducts(updatedProducts);
      message.success('Cập nhật sản phẩm thành công');
    } else {
      // Add mode
      const newProduct: Product = {
        id: Math.floor(Math.random() * 100000), // Simple ID generation
        name: values.name,
        price: values.price,
        quantity: values.quantity,
      };
      setProducts([newProduct, ...products]);
      message.success('Thêm sản phẩm thành công');
    }
    setIsModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleEdit = (record: Product) => {
    setEditingProduct(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };


  // Filter products
  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
      align: 'center' as const,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (text: number) => text.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center' as const,
      render: (_: any, record: Product) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            style = {{backgroundColor: 'black', border:'none'}}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Card 
      title="Quản lý Sản phẩm" 
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
          setEditingProduct(null);
          form.resetFields();
          setIsModalVisible(true);
        }}>
          Thêm sản phẩm
        </Button>
      }
    >
      <Input.Search
        placeholder="Tìm kiếm theo tên sản phẩm..."
        allowClear
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 400 }}
      />
      
      <Table
        dataSource={filteredProducts}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        bordered
      />

      <Modal
        title={editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingProduct(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingProduct ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>
          
          <Form.Item
            name="price"
            label="Giá"
            rules={[
              { required: true, message: 'Vui lòng nhập giá sản phẩm!' },
              { type: 'number', min: 1, message: 'Giá phải là số dương!' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập giá sản phẩm"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng!' },
              { type: 'number', min: 1, message: 'Số lượng phải là số nguyên dương!' }
            ]}
          >
             <InputNumber 
                style={{ width: '100%' }} 
                placeholder="Nhập số lượng" 
                precision={0} 
                min={1} 
              />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProductManagement;

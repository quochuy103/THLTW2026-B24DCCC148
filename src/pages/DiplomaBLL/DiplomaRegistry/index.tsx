import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Button, Table, Modal, Form, InputNumber, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getRegistries, addRegistry, DiplomaRegistry } from '@/services/diploma';

const DiplomaRegistryPage: React.FC = () => {
  const [registries, setRegistries] = useState<DiplomaRegistry[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadData = () => {
    setRegistries(getRegistries());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (registries.some(r => r.year === values.year)) {
        message.error(`Sổ văn bằng cho năm ${values.year} đã tồn tại!`);
        return;
      }

      const newRegistry: DiplomaRegistry = {
        id: values.year.toString(),
        year: values.year,
        currentRunningNumber: 0,
      };

      addRegistry(newRegistry);
      message.success('Tạo sổ văn bằng thành công!');
      setIsModalVisible(false);
      loadData();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const columns: ColumnsType<DiplomaRegistry> = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: 'Năm',
      dataIndex: 'year',
      key: 'year',
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: 'Số vào sổ hiện tại',
      dataIndex: 'currentRunningNumber',
      key: 'currentRunningNumber',
    },
  ];

  return (
    <PageContainer title="Sổ văn bằng">
      <Card
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Tạo sổ mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={registries}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Tạo sổ văn bằng mới"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="year"
            label="Năm tốt nghiệp"
            rules={[{ required: true, message: 'Vui lòng nhập năm' }]}
          >
            <InputNumber style={{ width: '100%' }} min={2000} max={2100} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DiplomaRegistryPage;

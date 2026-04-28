import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Card, Table, Button, Modal, Form, InputNumber,
  Space, Popconfirm, message, Tag, Tooltip, DatePicker, Row, Col,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import {
  initFitnessData, getHealthMetrics, saveHealthMetrics,
  calcBMI, getBMICategory, HealthMetricRecord,
} from '@/services/FitnessTracking';
import '@/pages/FitnessTracking/fitness.less';

const HealthMetricsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetricRecord[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthMetricRecord | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    initFitnessData();
    setMetrics(getHealthMetrics());
  }, []);

  const handleCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ date: moment(), restingHeartRate: 70, sleepHours: 7 });
    setIsModalVisible(true);
  };

  const handleEdit = (record: HealthMetricRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({ ...record, date: moment(record.date) });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const updated = metrics.filter((m) => m.metricId !== id);
    setMetrics(updated);
    saveHealthMetrics(updated);
    message.success('Đã xóa chỉ số');
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const bmi = calcBMI(values.weightKg, values.heightCm);
      const rec: HealthMetricRecord = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        bmi,
        metricId: editingRecord ? editingRecord.metricId : `HM${Date.now()}`,
        restingHeartRate: values.restingHeartRate || 0,
        sleepHours: values.sleepHours || 0,
      };
      const updated = editingRecord
        ? metrics.map((m) => (m.metricId === editingRecord.metricId ? rec : m))
        : [...metrics, rec];
      setMetrics(updated);
      saveHealthMetrics(updated);
      message.success(editingRecord ? 'Cập nhật thành công' : 'Thêm chỉ số thành công');
      setIsModalVisible(false);
    });
  };

  const sortedMetrics = [...metrics].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const columns = [
    {
      title: 'Ngày', dataIndex: 'date', key: 'date', width: 120,
      sorter: (a: HealthMetricRecord, b: HealthMetricRecord) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (d: string) => new Date(d).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Cân nặng', dataIndex: 'weightKg', key: 'weightKg', width: 110,
      sorter: (a: HealthMetricRecord, b: HealthMetricRecord) => a.weightKg - b.weightKg,
      render: (v: number) => `${v} kg`,
    },
    {
      title: 'Chiều cao', dataIndex: 'heightCm', key: 'heightCm', width: 110,
      render: (v: number) => `${v} cm`,
    },
    {
      title: 'BMI', dataIndex: 'bmi', key: 'bmi', width: 140,
      sorter: (a: HealthMetricRecord, b: HealthMetricRecord) => a.bmi - b.bmi,
      render: (bmi: number) => {
        const cat = getBMICategory(bmi);
        return (
          <Space>
            <span>{bmi}</span>
            <Tag color={cat.color}>{cat.label}</Tag>
          </Space>
        );
      },
    },
    {
      title: 'Nhịp tim', dataIndex: 'restingHeartRate', key: 'restingHeartRate', width: 110,
      render: (v: number) => v ? `${v} bpm` : '—',
    },
    {
      title: 'Giấc ngủ', dataIndex: 'sleepHours', key: 'sleepHours', width: 110,
      render: (v: number) => v ? `${v} giờ` : '—',
    },
    {
      title: 'Thao tác', key: 'action', width: 90,
      render: (_: any, record: HealthMetricRecord) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined />} size="small" className="ft-btn-icon" onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm title="Xóa chỉ số này?" onConfirm={() => handleDelete(record.metricId)} okText="Xóa" cancelText="Hủy">
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} size="small" className="ft-btn-icon" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Chỉ số Sức khỏe">
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} className="ft-custom-btn ft-btn-primary">
            Thêm chỉ số
          </Button>
        </div>
        <Table<HealthMetricRecord>
          columns={columns}
          dataSource={sortedMetrics}
          rowKey="metricId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title={editingRecord ? 'Chỉnh sửa chỉ số sức khỏe' : 'Thêm chỉ số sức khỏe'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={560}
        okText={editingRecord ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        destroyOnClose
        okButtonProps={{ className: 'ft-custom-btn ft-btn-primary' }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="date" label="Ngày đo" rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="weightKg" label="Cân nặng (kg)" rules={[{ required: true, message: 'Bắt buộc!' }, { type: 'number', min: 1, message: 'Phải > 0' }]}>
                <InputNumber min={1} max={300} step={0.1} style={{ width: '100%' }} placeholder="70" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="heightCm" label="Chiều cao (cm)" rules={[{ required: true, message: 'Bắt buộc!' }, { type: 'number', min: 1, message: 'Phải > 0' }]}>
                <InputNumber min={1} max={250} step={0.5} style={{ width: '100%' }} placeholder="170" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="restingHeartRate" label="Nhịp tim lúc nghỉ (bpm)">
                <InputNumber min={0} max={200} style={{ width: '100%' }} placeholder="70" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sleepHours" label="Số giờ ngủ">
                <InputNumber min={0} max={24} step={0.5} style={{ width: '100%' }} placeholder="7" />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ padding: '8px 12px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f', fontSize: 13 }}>
            💡 BMI sẽ được tự động tính toán từ cân nặng và chiều cao sau khi lưu.
          </div>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default HealthMetricsPage;

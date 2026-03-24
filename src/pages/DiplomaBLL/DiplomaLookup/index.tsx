import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Table,
  Space,
  message,
  Divider,
  Statistic,
  Row,
  Col,
  Tag,
  Alert,
  DatePicker,
  Drawer,
  Descriptions,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { SearchOutlined } from '@ant-design/icons';
import {
  lookupDiploma,
  getLookupStatistics,
  recordLookup,
} from '@/services/diploma';
import type { DiplomaLookupResponse, GraduationDecision } from '@/models/diploma';

const DiplomaLookup: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiplomaLookupResponse[]>([]);
  const [searchCount, setSearchCount] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<DiplomaLookupResponse | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [statistics, setStatistics] = useState<{ [key: string]: number }>({});

  // Tra cứu văn bằng
  const handleSearch = async () => {
    try {
      const values = form.getFieldsValue();
      
      // Kiểm tra ít nhất 2 tham số được nhập
      const filledParams = Object.entries(values)
        .filter(([, value]) => value !== undefined && value !== '' && value !== null);
      
      if (filledParams.length < 2) {
        message.error('Vui lòng nhập ít nhất 2 tham số để tra cứu');
        return;
      }

      setLoading(true);
      
      const searchParams: any = {};
      if (values.diplomaNumber) searchParams.diplomaNumber = values.diplomaNumber;
      if (values.sequenceNumber) searchParams.sequenceNumber = values.sequenceNumber;
      if (values.studentCode) searchParams.studentCode = values.studentCode;
      if (values.studentName) searchParams.studentName = values.studentName;
      if (values.dateOfBirth) searchParams.dateOfBirth = values.dateOfBirth.format('YYYY-MM-DD');

      const response = await lookupDiploma(searchParams);
      
      if (response.success && response.data) {
        setResults(response.data);
        setSearchCount(response.data.length);
        
        // Ghi nhận lượt tra cứu cho từng quyết định
        response.data.forEach(async (result) => {
          await recordLookup(result.diploma.id, result.decision.id);
          
          // Cập nhật thống kê
          const stats = await getLookupStatistics(result.decision.id);
          if (stats.success) {
            setStatistics(prev => ({
              ...prev,
              [result.decision.id]: stats.data?.lookupCount || 0,
            }));
          }
        });

        message.success(`Tìm được ${response.data.length} kết quả`);
      } else {
        setResults([]);
        message.info('Không tìm thấy kết quả');
      }
    } catch (error) {
      message.error('Lỗi: ' + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  // Xem chi tiết
  const handleViewDetails = (record: DiplomaLookupResponse) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
  };

  // Reset form
  const handleReset = () => {
    form.resetFields();
    setResults([]);
  };

  const columns: ColumnsType<DiplomaLookupResponse> = [
    {
      title: 'Số Hiệu Văn Bằng',
      dataIndex: ['diploma', 'diplomaNumber'],
      key: 'diplomaNumber',
      width: 150,
    },
    {
      title: 'Số Vào Sổ',
      dataIndex: ['diploma', 'sequenceNumber'],
      key: 'sequenceNumber',
      width: 100,
    },
    {
      title: 'MSV',
      dataIndex: ['diploma', 'studentCode'],
      key: 'studentCode',
      width: 120,
    },
    {
      title: 'Họ Tên',
      dataIndex: ['diploma', 'studentName'],
      key: 'studentName',
    },
    {
      title: 'Ngày Sinh',
      dataIndex: ['diploma', 'dateOfBirth'],
      key: 'dateOfBirth',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Số QĐ',
      dataIndex: ['decision', 'decisionNumber'],
      key: 'decisionNumber',
      width: 120,
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => handleViewDetails(record)}>
          Xem Chi Tiết
        </Button>
      ),
    },
  ];

  return (
    <Card title="Tra Cứu Thông Tin Văn Bằng">
      <Alert
        message="Vui lòng nhập ít nhất 2 tham số để tra cứu thông tin văn bằng"
        type="info"
        showIcon
        style={{ marginBottom: '20px' }}
      />

      <Card style={{ marginBottom: '20px' }} type="inner">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Số Hiệu Văn Bằng" name="diplomaNumber">
                <Input placeholder="Nhập số hiệu văn bằng" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Số Vào Sổ" name="sequenceNumber">
                <Input placeholder="Nhập số vào sổ" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="MSV" name="studentCode">
                <Input placeholder="Nhập mã sinh viên" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Họ Tên" name="studentName">
                <Input placeholder="Nhập họ tên" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Ngày Sinh" name="dateOfBirth">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} loading={loading}>
                Tìm Kiếm
              </Button>
              <Button onClick={handleReset}>
                Xóa Bộ Lọc
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {searchCount > 0 && (
        <Card style={{ marginBottom: '20px' }} type="inner">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Statistic title="Tổng Kết Quả" value={searchCount} valueStyle={{ color: '#1890ff' }} />
            </Col>
          </Row>
        </Card>
      )}

      <Table
        columns={columns}
        dataSource={results}
        loading={loading}
        rowKey={(record) => record.diploma.id}
        pagination={results.length > 10}
        scroll={{ x: 1200 }}
      />

      <Drawer
        title="Chi Tiết Thông Tin Văn Bằng"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        {selectedRecord && (
          <>
            <Descriptions title="Thông Tin Văn Bằng" bordered column={1} style={{ marginBottom: '20px' }}>
              <Descriptions.Item label="Số Hiệu Văn Bằng">
                {selectedRecord.diploma.diplomaNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Số Vào Sổ">
                {selectedRecord.diploma.sequenceNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Mã Sinh Viên">
                {selectedRecord.diploma.studentCode}
              </Descriptions.Item>
              <Descriptions.Item label="Họ Tên">
                {selectedRecord.diploma.studentName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày Sinh">
                {dayjs(selectedRecord.diploma.dateOfBirth).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng Thái">
                <Tag color={selectedRecord.diploma.status === 'active' ? 'green' : 'red'}>
                  {selectedRecord.diploma.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
              </Descriptions.Item>

              {selectedRecord.diploma.customFields && Object.keys(selectedRecord.diploma.customFields).length > 0 && (
                <>
                  <Divider />
                  {Object.entries(selectedRecord.diploma.customFields).map(([key, value]) => (
                    <Descriptions.Item key={key} label={key}>
                      {typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)
                        ? dayjs(value).format('DD/MM/YYYY')
                        : String(value)}
                    </Descriptions.Item>
                  ))}
                </>
              )}
            </Descriptions>

            <Divider />

            <Descriptions title="Thông Tin Quyết Định Tốt Nghiệp" bordered column={1}>
              <Descriptions.Item label="Số QĐ">
                {selectedRecord.decision.decisionNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày Ban Hành">
                {dayjs(selectedRecord.decision.decisionDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Trích Yếu">
                {selectedRecord.decision.summary}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng Sinh Viên">
                {selectedRecord.decision.totalStudents}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng Lượt Tra Cứu">
                <Tag color="blue">{selectedRecord.decision.lookupCount}</Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Thông Tin Sổ Văn Bằng" bordered column={1}>
              <Descriptions.Item label="Năm">
                {selectedRecord.register.year}
              </Descriptions.Item>
              <Descriptions.Item label="Số Hiệu Sổ">
                {selectedRecord.register.registerNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Số Thứ Tự Hiện Tại">
                {selectedRecord.register.currentSequence}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Drawer>
    </Card>
  );
};

export default DiplomaLookup;

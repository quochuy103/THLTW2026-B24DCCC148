import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Button, Table, Modal, Form, Input, DatePicker, Select, InputNumber, Space, Popconfirm, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { 
  getDiplomas, addDiploma, updateDiploma, deleteDiploma, DiplomaRecord,
  getDecisions, GraduationDecision,
  getTemplateFields, DiplomaTemplateField
} from '@/services/diploma';

const { Option } = Select;

const DiplomaInformationPage: React.FC = () => {
  const [diplomas, setDiplomas] = useState<DiplomaRecord[]>([]);
  const [decisions, setDecisions] = useState<GraduationDecision[]>([]);
  const [templateFields, setTemplateFields] = useState<DiplomaTemplateField[]>([]);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDiploma, setEditingDiploma] = useState<DiplomaRecord | null>(null);
  const [form] = Form.useForm();

  const [filterDecisionId, setFilterDecisionId] = useState<string | undefined>(undefined);

  const loadData = () => {
    setDiplomas(getDiplomas());
    setDecisions(getDecisions());
    setTemplateFields(getTemplateFields());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDiplomas = useMemo(() => {
    if (!filterDecisionId) return diplomas;
    return diplomas.filter(d => d.decisionId === filterDecisionId);
  }, [diplomas, filterDecisionId]);

  const handleAdd = () => {
    setEditingDiploma(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: DiplomaRecord) => {
    setEditingDiploma(record);
    
    const dynamicVals: Record<string, any> = {};
    if (record.dynamicData) {
      Object.keys(record.dynamicData).forEach(key => {
        const fieldDef = templateFields.find(f => f.id === key);
        if (fieldDef && fieldDef.dataType === 'Date') {
          dynamicVals[key] = dayjs(record.dynamicData[key]);
        } else {
          dynamicVals[key] = record.dynamicData[key];
        }
      });
    }

    form.setFieldsValue({
      ...record,
      dateOfBirth: dayjs(record.dateOfBirth),
      ...dynamicVals,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteDiploma(id);
    message.success('Xóa văn bằng thành công!');
    loadData();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const dynamicData: Record<string, any> = {};
      templateFields.forEach(field => {
        if (values[field.id] !== undefined) {
          if (field.dataType === 'Date') {
            dynamicData[field.id] = values[field.id].format('YYYY-MM-DD');
          } else {
            dynamicData[field.id] = values[field.id];
          }
        }
      });

      const payload = {
        diplomaNumber: values.diplomaNumber,
        studentId: values.studentId,
        fullName: values.fullName,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        decisionId: values.decisionId,
        dynamicData,
      };

      if (editingDiploma) {
        updateDiploma(editingDiploma.id, payload);
        message.success('Cập nhật văn bằng thành công!');
      } else {
        addDiploma(payload as Omit<DiplomaRecord, 'id' | 'registryNumber'>);
        message.success('Tạo văn bằng mới thành công!');
      }
      setIsModalVisible(false);
      loadData();
    } catch (error) {
       if (error instanceof Error) {
           message.error(error.message);
       }
       console.error("Validation failed:", error);
    }
  };

  const columns: ColumnsType<DiplomaRecord> = [
    {
      title: 'Số vào sổ',
      dataIndex: 'registryNumber',
      key: 'registryNumber',
    },
    {
      title: 'Số hiệu VB',
      dataIndex: 'diplomaNumber',
      key: 'diplomaNumber',
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'MSV',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (val) => dayjs(val).format('DD/MM/YYYY'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} type="link" />
          <Popconfirm
            title="Bạn có chắc muốn xóa VB này?"
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

  const renderDynamicInput = (field: DiplomaTemplateField) => {
    switch (field.dataType) {
      case 'Number':
        return <InputNumber style={{ width: '100%' }} />;
      case 'Date':
        return <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />;
      case 'String':
      default:
        return <Input />;
    }
  };

  return (
    <PageContainer title="Quản lý thông tin văn bằng">
      <Card title="Bộ lọc & Tìm kiếm" style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Select 
                allowClear 
                placeholder="Lọc theo Quyết định tốt nghiệp" 
                style={{ width: '100%' }}
                onChange={setFilterDecisionId}
            >
              {decisions.map(d => <Option key={d.decisionId} value={d.decisionId}>{`QĐ: ${d.decisionNumber} (Năm ${d.registryYear})`}</Option>)}
            </Select>
          </Col>
          <Col span={16} style={{ textAlign: 'right' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  Thêm Văn bằng
              </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredDiplomas}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingDiploma ? 'Chỉnh sửa Văn bằng' : 'Tạo Văn bằng mới'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>

             <Col span={12}>
                <Form.Item
                  name="decisionId"
                  label="Quyết định tốt nghiệp"
                  rules={[{ required: true, message: 'Vui lòng chọn quyết định' }]}
                >
                  <Select placeholder="Chọn quyết định" disabled={!!editingDiploma}>
                    {decisions.map(d => (
                      <Option key={d.decisionId} value={d.decisionId}>{`QĐ: ${d.decisionNumber} (Năm ${d.registryYear})`}</Option>
                    ))}
                  </Select>
                </Form.Item>
             </Col>
             <Col span={12}>
               <Form.Item
                  name="diplomaNumber"
                  label="Số hiệu văn bằng"
                  rules={[{ required: true, message: 'Vui lòng nhập số hiệu' }]}
                >
                  <Input />
                </Form.Item>
             </Col>
             <Col span={12}>
                <Form.Item
                  name="studentId"
                  label="Mã sinh viên"
                  rules={[{ required: true, message: 'Vui lòng nhập MSV' }]}
                >
                  <Input />
                </Form.Item>
             </Col>
             <Col span={12}>
                <Form.Item
                  name="fullName"
                  label="Họ và tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                  <Input />
                </Form.Item>
             </Col>
             <Col span={12}>
                <Form.Item
                  name="dateOfBirth"
                  label="Ngày sinh"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
             </Col>
          </Row>
          

          {templateFields.length > 0 && (
            <>
              <div style={{ margin: '16px 0', borderBottom: '1px solid #f0f0f0' }}><strong>Thông tin cấu hình thêm:</strong></div>
              <Row gutter={16}>
                {templateFields.map(field => (
                  <Col span={12} key={field.id}>
                    <Form.Item
                      name={field.id}
                      label={field.fieldName}
                      rules={[{ required: true, message: `Vui lòng nhập ${field.fieldName}` }]}
                    >
                      {renderDynamicInput(field)}
                    </Form.Item>
                  </Col>
                ))}
              </Row>
            </>
          )}

        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DiplomaInformationPage;

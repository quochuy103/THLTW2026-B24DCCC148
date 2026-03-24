import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Button, Form, Input, DatePicker, message, Descriptions, Alert, Typography, Divider, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  getDiplomas, DiplomaRecord,
  getDecisions, GraduationDecision,
  getRegistries, DiplomaRegistry,
  getTemplateFields, DiplomaTemplateField,
  incrementLookupCount
} from '@/services/diploma';

const { Title, Text } = Typography;

const DiplomaLookupPage: React.FC = () => {
  const [form] = Form.useForm();
  const [searchResults, setSearchResults] = useState<DiplomaRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [decisionsCache, setDecisionsCache] = useState<Record<string, GraduationDecision>>({});
  const [registriesCache, setRegistriesCache] = useState<Record<number, DiplomaRegistry>>({});
  const [templatesCache, setTemplatesCache] = useState<DiplomaTemplateField[]>([]);

  const handleSearch = async () => {
    try {
      const values = await form.validateFields();
      
      const filledKeys = Object.keys(values).filter(key => {
        const val = values[key];
        return val !== undefined && val !== null && val !== '';
      });

      if (filledKeys.length < 2) {
        message.warning('Vui lòng nhập ít nhất 2 thông tin để tra cứu.');
        return;
      }

      const allDiplomas = getDiplomas();
      const allDecisions = getDecisions();
      const allRegistries = getRegistries();
      const allTemplates = getTemplateFields();

      const dCache: Record<string, GraduationDecision> = {};
      allDecisions.forEach(d => dCache[d.decisionId] = d);
      setDecisionsCache(dCache);

      const rCache: Record<number, DiplomaRegistry> = {};
      allRegistries.forEach(r => rCache[r.year] = r);
      setRegistriesCache(rCache);

      setTemplatesCache(allTemplates);

      const matched = allDiplomas.filter(diploma => {
        if (values.diplomaNumber && diploma.diplomaNumber !== values.diplomaNumber) return false;
        if (values.registryNumber && diploma.registryNumber.toString() !== values.registryNumber) return false;
        if (values.studentId && diploma.studentId !== values.studentId) return false;
        if (values.fullName && !diploma.fullName.toLowerCase().includes(values.fullName.toLowerCase())) return false;
        if (values.dateOfBirth && diploma.dateOfBirth !== values.dateOfBirth.format('YYYY-MM-DD')) return false;

        return true;
      });

      setSearchResults(matched);
      setHasSearched(true);

      if (matched.length > 0) {
        message.success(`Tìm thấy ${matched.length} kết quả.`);
        const distinctDecisions = new Set(matched.map(m => m.decisionId));
        distinctDecisions.forEach(decId => {
          incrementLookupCount(decId);
        });
      } else {
        message.info('Không tìm thấy kết quả nào trùng khớp.');
      }

    } catch (error) {
      console.error("Validation error", error);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <PageContainer title="Tra cứu văn bằng">
      <Card title="Thông tin tra cứu" style={{ marginBottom: 24 }}>
        <Alert 
          message="Hướng dẫn" 
          description="Bạn cần cung cấp tối thiểu 2 trong số các thông tin bên dưới để thực hiện tra cứu." 
          type="info" 
          showIcon 
          style={{ marginBottom: 24 }} 
        />
        
        <Form form={form} layout="vertical">
          <Form.Item name="diplomaNumber" label="Số hiệu văn bằng">
            <Input placeholder="Nhập số hiệu văn bằng" />
          </Form.Item>
          <Form.Item name="registryNumber" label="Số vào sổ">
            <Input placeholder="Nhập số vào sổ" />
          </Form.Item>
          <Form.Item name="studentId" label="Mã sinh viên">
            <Input placeholder="Nhập mã sinh viên" />
          </Form.Item>
          <Form.Item name="fullName" label="Họ và tên">
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>
          <Form.Item name="dateOfBirth" label="Ngày sinh">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
          </Form.Item>

          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              Tra cứu
            </Button>
            <Button onClick={handleReset}>Nhập lại</Button>
          </Space>
        </Form>
      </Card>

      {hasSearched && (
        <Card title="Kết quả tra cứu">
          {searchResults.length === 0 ? (
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
              <Text type="secondary">Không tìm thấy thông tin nào phù hợp với yêu cầu.</Text>
            </div>
          ) : (
            searchResults.map(diploma => {
              const decision = decisionsCache[diploma.decisionId];
              return (
                <div key={diploma.id} style={{ marginBottom: 32 }}>
                  <Descriptions title={`Văn bằng: ${diploma.fullName} - ${diploma.studentId}`} bordered>
                    <Descriptions.Item label="Số hiệu VB">{diploma.diplomaNumber}</Descriptions.Item>
                    <Descriptions.Item label="Số vào sổ">{diploma.registryNumber}</Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">{dayjs(diploma.dateOfBirth).format('DD/MM/YYYY')}</Descriptions.Item>
                    
                    {diploma.dynamicData && Object.keys(diploma.dynamicData).map(key => {
                      const def = templatesCache.find(t => t.id === key);
                      if (!def) return null;
                      const val = def.dataType === 'Date' ? dayjs(diploma.dynamicData[key]).format('DD/MM/YYYY') : diploma.dynamicData[key];
                      return (
                        <Descriptions.Item key={key} label={def.fieldName}>
                          {val}
                        </Descriptions.Item>
                      );
                    })}

                    <Descriptions.Item label="Thuộc Quyết định" span={3}>
                      {decision ? (
                        <Space direction="vertical" size={2}>
                          <Text strong>Quyết định số: {decision.decisionNumber}</Text>
                          <Text>Ngày ban hành: {dayjs(decision.issueDate).format('DD/MM/YYYY')}</Text>
                          <Text>Trích yếu: {decision.summary}</Text>
                          <Text>Năm sổ VB: {decision.registryYear}</Text>
                        </Space>
                      ) : (
                        <Text type="danger">Không tìm thấy thông tin quyết định</Text>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider />
                </div>
              );
            })
          )}
        </Card>
      )}

    </PageContainer>
  );
};

export default DiplomaLookupPage;

import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Tabs } from 'antd';
import { 
  AppstoreOutlined, 
  BookOutlined, 
  QuestionCircleOutlined, 
  FileTextOutlined 
} from '@ant-design/icons';

import CategoriesTab from './components/CategoriesTab';
import SubjectsTab from './components/SubjectsTab';
import QuestionsTab from './components/QuestionsTab';
import ExamsTab from './components/ExamsTab';

const QuestionBankManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('categories');

  return (
    <PageContainer title="Ngân hàng đề thi">
      <Card style={{ minHeight: 'calc(100vh - 120px)' }} bodyStyle={{ padding: '16px 24px' }}>
<Tabs
  activeKey={activeTab}
  onChange={setActiveTab}
  size="large"
>
          <Tabs.TabPane 
            tab={<span><AppstoreOutlined /> Khối kiến thức</span>} 
            key="categories"
          >
            <CategoriesTab />
          </Tabs.TabPane>
          
          <Tabs.TabPane 
            tab={<span><BookOutlined /> Môn học</span>} 
            key="subjects"
          >
            <SubjectsTab />
          </Tabs.TabPane>
          
          <Tabs.TabPane 
            tab={<span><QuestionCircleOutlined /> Ngân hàng Câu hỏi</span>} 
            key="questions"
          >
            <QuestionsTab />
          </Tabs.TabPane>
          
          <Tabs.TabPane 
            tab={<span><FileTextOutlined /> Quản lý ra đề thi</span>} 
            key="exams"
          >
            <ExamsTab />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </PageContainer>
  );
};

export default QuestionBankManagement;

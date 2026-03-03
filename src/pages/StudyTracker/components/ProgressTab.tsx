import { useState } from 'react';
import {
  Card,
  Select,
  Progress,
  Row,
  Col,
  Typography,
  InputNumber,
  Button,
  Space,
  Form,
  Empty,
} from 'antd';
import { AimOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

const ProgressTab = () => {
  const { subjects, sessions, goals, setGoal } = useModel('study');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    dayjs().format('YYYY-MM')
  );

  // Tạo danh sách 12 tháng (6 tháng trước -> 6 tháng sau)
  const monthOptions = Array.from({ length: 12 }).map((_, i) => {
    const d = dayjs().subtract(6 - i, 'month');
    return {
      value: d.format('YYYY-MM'),
      label: d.format('MM/YYYY'),
    };
  });

  const handleSetGoal = (subjectId: string, values: any) => {
    setGoal({
      subjectId,
      month: selectedMonth,
      targetMinutes: values.targetMinutes,
    });
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}g ${m}p`;
  };

  const getSubjectProgress = (subjectId: string) => {
    const subjectSessions = sessions.filter(
      s =>
        s.subjectId === subjectId &&
        s.date.startsWith(selectedMonth)
    );

    const loggedMinutes = subjectSessions.reduce(
      (acc, cur) => acc + cur.durationMinutes,
      0
    );

    const goal = goals.find(
      g =>
        g.subjectId === subjectId &&
        g.month === selectedMonth
    );

    const targetMinutes = goal?.targetMinutes || 0;

    const percent =
      targetMinutes > 0
        ? Math.min(
            100,
            Math.round((loggedMinutes / targetMinutes) * 100)
          )
        : 0;

    return { loggedMinutes, targetMinutes, percent };
  };

  if (subjects.length === 0) {
    return (
      <Empty description="Bạn chưa có môn học nào. Hãy thêm môn học trước." />
    );
  }

  return (
    <div>
      {/* Chọn tháng */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          background: '#f5f5f5',
          borderRadius: 8,
        }}
      >
        <Space>
          <Text strong>Chọn tháng:</Text>
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            style={{ width: 150 }}
          >
            {monthOptions.map(opt => (
              <Option key={opt.value} value={opt.value}>
                Tháng {opt.label}
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {subjects.map(subject => {
          const { loggedMinutes, targetMinutes, percent } =
            getSubjectProgress(subject.id);

          const hasGoal = targetMinutes > 0;

          return (
            <Col xs={24} md={12} lg={8} key={subject.id}>
              <Card
                hoverable
                title={
                  <Space>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: subject.color,
                      }}
                    />
                    {subject.name}
                  </Space>
                }
              >
                {!hasGoal ? (
                  <Form
                    layout="vertical"
                    onFinish={values =>
                      handleSetGoal(subject.id, values)
                    }
                  >
                    <Form.Item
                      name="targetMinutes"
                      label="Mục tiêu tháng (phút)"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        min={30}
                        step={30}
                        style={{ width: '100%' }}
                        placeholder="VD: 1200"
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<AimOutlined />}
                      block
                    >
                      Thiết lập mục tiêu
                    </Button>
                  </Form>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <Progress
                      type="circle"
                      percent={percent}
                      strokeColor={subject.color}
                    />

                    <div style={{ marginTop: 16 }}>
                      <Text type="secondary">
                        Đã hoàn thành:
                      </Text>
                      <br />
                      <Text strong>
                        {formatTime(loggedMinutes)} /{' '}
                        {formatTime(targetMinutes)}
                      </Text>
                    </div>

                    {/* Cập nhật mục tiêu */}
                    <Form
                      layout="inline"
                      style={{
                        marginTop: 24,
                        justifyContent: 'center',
                      }}
                      initialValues={{ targetMinutes }}
                      onFinish={values =>
                        handleSetGoal(subject.id, values)
                      }
                    >
                      <Form.Item name="targetMinutes" noStyle>
                        <InputNumber
                          min={30}
                          step={30}
                          size="small"
                          style={{ width: 90 }}
                        />
                      </Form.Item>

                      <Form.Item noStyle>
                        <Button
                          size="small"
                          htmlType="submit"
                          style={{ marginLeft: 8 }}
                        >
                          Cập nhật
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default ProgressTab;
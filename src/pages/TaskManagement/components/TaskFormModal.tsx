import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Row, Col } from 'antd';
import moment from 'moment';
import { TaskRecord, TaskStatus, TaskPriority, generateTaskId } from '@/services/TaskManagement';

const { Option } = Select;
const { TextArea } = Input;

interface TaskFormModalProps {
  visible: boolean;
  editingTask: TaskRecord | null;
  onOk: (task: TaskRecord) => void;
  onCancel: () => void;
}

const PRIORITIES: TaskPriority[] = ['HIGH', 'MEDIUM', 'LOW'];
const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  HIGH: '🔴 Cao',
  MEDIUM: '🟡 Trung bình',
  LOW: '🟢 Thấp',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'Cần làm',
  IN_PROGRESS: 'Đang làm',
  DONE: 'Hoàn thành',
};

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  editingTask,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (editingTask) {
        form.setFieldsValue({
          ...editingTask,
          deadline: editingTask.deadline ? moment(editingTask.deadline) : undefined,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ priority: 'MEDIUM', status: 'TODO' });
      }
    }
  }, [visible, editingTask]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      const task: TaskRecord = {
        taskId: editingTask ? editingTask.taskId : generateTaskId(),
        title: values.title,
        description: values.description || '',
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : '',
        priority: values.priority,
        tags: values.tags || [],
        status: values.status,
        createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
      };
      onOk(task);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={editingTask ? '✏️ Chỉnh sửa Task' : '➕ Thêm Task mới'}
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={680}
      okText={editingTask ? 'Cập nhật' : 'Thêm mới'}
      cancelText="Hủy"
      destroyOnClose
      okButtonProps={{ className: 'tm-btn-primary' }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề task!' }]}
        >
          <Input placeholder="VD: Xây dựng tính năng đăng nhập" />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <TextArea rows={3} placeholder="Mô tả chi tiết công việc cần làm..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="deadline"
              label="Hạn hoàn thành"
              rules={[{ required: true, message: 'Vui lòng chọn hạn hoàn thành!' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="priority"
              label="Độ ưu tiên"
              rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên!' }]}
            >
              <Select placeholder="Chọn độ ưu tiên">
                {PRIORITIES.map((p) => (
                  <Option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
            >
              <Select placeholder="Chọn trạng thái">
                {STATUSES.map((s) => (
                  <Option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tags" label="Tags">
              <Select
                mode="tags"
                placeholder="Nhập và Enter để thêm tag"
                style={{ width: '100%' }}
                tokenSeparators={[',']}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default TaskFormModal;

import React, { useEffect, useState, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Table, Button, Input, Select, Tag, Space, Popconfirm, message, Tooltip, Row, Col, Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { ColumnsType, SorterResult } from 'antd/lib/table/interface';
import {
  initTaskData, getTasks, saveTasks, TaskRecord, TaskStatus, TaskPriority, isOverdue,
} from '@/services/TaskManagement';
import TaskFormModal from '@/pages/TaskManagement/components/TaskFormModal';
import '@/pages/TaskManagement/task.less';

const { Option } = Select;

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  HIGH: 'red',
  MEDIUM: 'orange',
  LOW: 'green',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  HIGH: '🔴 Cao',
  MEDIUM: '🟡 Trung bình',
  LOW: '🟢 Thấp',
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  TODO: 'blue',
  IN_PROGRESS: 'orange',
  DONE: 'green',
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'Cần làm',
  IN_PROGRESS: 'Đang làm',
  DONE: 'Hoàn thành',
};

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [formVisible, setFormVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);

  useEffect(() => {
    initTaskData();
    setTasks(getTasks());
  }, []);


  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        searchText === '' || t.title.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = statusFilter === '' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tasks, searchText, statusFilter]);


  const handleCreate = () => {
    setEditingTask(null);
    setFormVisible(true);
  };

  const handleEdit = (task: TaskRecord) => {
    setEditingTask(task);
    setFormVisible(true);
  };

  const handleDelete = (taskId: string) => {
    const updated = tasks.filter((t) => t.taskId !== taskId);
    setTasks(updated);
    saveTasks(updated);
    message.success('Đã xóa task');
  };

  const handleFormOk = (task: TaskRecord) => {
    const exists = tasks.some((t) => t.taskId === task.taskId);
    const updated = exists
      ? tasks.map((t) => (t.taskId === task.taskId ? task : t))
      : [...tasks, task];
    setTasks(updated);
    saveTasks(updated);
    message.success(exists ? 'Đã cập nhật task' : 'Đã thêm task mới');
    setFormVisible(false);
    setEditingTask(null);
  };


  const columns: ColumnsType<TaskRecord> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: TaskRecord) => {
        const overdue = isOverdue(record);
        return (
          <span>
            <span style={{ fontWeight: 600 }}>{text}</span>
            {overdue && (
              <Tag color="red" style={{ marginLeft: 8, fontSize: 10 }}>
                Quá hạn
              </Tag>
            )}
          </span>
        );
      },
    },
    {
      title: 'Hạn hoàn thành',
      dataIndex: 'deadline',
      key: 'deadline',
      sorter: (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      render: (deadline: string, record: TaskRecord) => {
        const overdue = isOverdue(record);
        return (
          <span style={{ color: overdue ? '#ff4d4f' : undefined, fontWeight: overdue ? 600 : undefined }}>
            {new Date(deadline).toLocaleDateString('vi-VN')}
          </span>
        );
      },
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: TaskPriority) => (
        <Tag color={PRIORITY_COLOR[priority]}>{PRIORITY_LABEL[priority]}</Tag>
      ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space wrap>
          {tags.map((tag) => (
            <Tag key={tag} style={{ fontSize: 11 }}>{tag}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: TaskStatus) => (
        <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      render: (_: any, record: TaskRecord) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#1677ff' }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa task này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.taskId)}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Danh sách Task">
      {/* Toolbar */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="tm-btn-primary"
              onClick={handleCreate}
            >
              Thêm Task
            </Button>
          </Col>
          <Col flex="auto">
            <Row gutter={[8, 8]} justify="end">
              <Col xs={24} sm={8} md={6}>
                <Select
                  allowClear
                  placeholder="Lọc trạng thái"
                  style={{ width: '100%' }}
                  value={statusFilter || undefined}
                  onChange={(v) => setStatusFilter((v as TaskStatus) || '')}
                >
                  <Option value="TODO">📋 Cần làm</Option>
                  <Option value="IN_PROGRESS">⚡ Đang làm</Option>
                  <Option value="DONE">✅ Hoàn thành</Option>
                </Select>
              </Col>
              <Col xs={24} sm={10} md={8}>
                <Input.Search
                  placeholder="Tìm theo tiêu đề..."
                  allowClear
                  prefix={<SearchOutlined />}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Card className="tm-table-wrapper">
        <Table<TaskRecord>
          dataSource={filteredTasks}
          columns={columns}
          rowKey="taskId"
          rowClassName={(record) => (isOverdue(record) ? 'overdue-row' : '')}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng: ${total} task` }}
          locale={{ emptyText: 'Không tìm thấy task nào' }}
          scroll={{ x: 800 }}
        />
      </Card>

      <TaskFormModal
        visible={formVisible}
        editingTask={editingTask}
        onOk={handleFormOk}
        onCancel={() => { setFormVisible(false); setEditingTask(null); }}
      />
    </PageContainer>
  );
};

export default TaskList;

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Badge,
  Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TagOutlined } from '@ant-design/icons';
import {
  getPosts,
  getTags,
  saveTags,
  recalcTagUsage,
  initBlogData,
  TagRecord,
} from '@/services/BlogManagement';
import '@/pages/BlogManagement/blog.less';

const TagManagementPage: React.FC = () => {
  const [tags, setTags] = useState<TagRecord[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<TagRecord | null>(null);
  const [form] = Form.useForm();

  const loadData = () => {
    initBlogData();
    const posts = getPosts();
    const rawTags = getTags();
    const recalculated = recalcTagUsage(posts, rawTags);
    setTags(recalculated);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingTag(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: TagRecord) => {
    setEditingTag(record);
    form.setFieldsValue({ tagName: record.tagName });
    setIsModalVisible(true);
  };

  const handleDelete = (tagId: string) => {
    const target = tags.find((t) => t.tagId === tagId);
    if (target && target.usageCount > 0) {
      message.warning(
        `Không thể xóa thẻ "${target.tagName}" vì đang được dùng trong ${target.usageCount} bài viết.`,
      );
      return;
    }
    const updated = tags.filter((t) => t.tagId !== tagId);
    setTags(updated);
    saveTags(updated);
    message.success('Đã xóa thẻ');
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const duplicate = tags.some(
        (t) =>
          t.tagName.toLowerCase() === values.tagName.trim().toLowerCase() &&
          t.tagId !== editingTag?.tagId,
      );
      if (duplicate) {
        form.setFields([{ name: 'tagName', errors: ['Tên thẻ này đã tồn tại!'] }]);
        return;
      }

      if (editingTag) {
        const updated = tags.map((t) =>
          t.tagId === editingTag.tagId ? { ...t, tagName: values.tagName.trim() } : t,
        );
        setTags(updated);
        saveTags(updated);
        message.success('Cập nhật thẻ thành công');
      } else {
        const existingNums = tags
          .map((t) => parseInt(t.tagId.replace(/\D/g, ''), 10))
          .filter((n) => !isNaN(n));
        const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
        const newTag: TagRecord = {
          tagId: `TAG${String(nextNum).padStart(3, '0')}`,
          tagName: values.tagName.trim(),
          usageCount: 0,
        };
        const updated = [...tags, newTag];
        setTags(updated);
        saveTags(updated);
        message.success('Thêm thẻ thành công');
      }
      setIsModalVisible(false);
    });
  };

  const columns = [
    {
      title: 'Mã thẻ',
      dataIndex: 'tagId',
      key: 'tagId',
      width: 130,
    },
    {
      title: 'Tên thẻ',
      dataIndex: 'tagName',
      key: 'tagName',
      sorter: (a: TagRecord, b: TagRecord) => a.tagName.localeCompare(b.tagName),
      render: (name: string) => (
        <span>
          <TagOutlined style={{ color: '#1890ff', marginRight: 6 }} />
          <strong>{name}</strong>
        </span>
      ),
    },
    {
      title: 'Số bài viết sử dụng',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 180,
      sorter: (a: TagRecord, b: TagRecord) => a.usageCount - b.usageCount,
      render: (count: number) => (
        <Badge
          count={count}
          style={{
            backgroundColor: count > 0 ? '#1890ff' : '#d9d9d9',
          }}
          showZero
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: any, record: TagRecord) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              className="btn-icon"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title={
              record.usageCount > 0
                ? `Thẻ này đang được dùng trong ${record.usageCount} bài viết. Không thể xóa!`
                : 'Bạn có chắc muốn xóa thẻ này?'
            }
            onConfirm={() => handleDelete(record.tagId)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ disabled: record.usageCount > 0 }}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                className="btn-icon"
                disabled={record.usageCount > 0}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Quản lý Thẻ"
      subTitle="Quản lý các thẻ chủ đề được sử dụng trong bài viết"
    >
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            className="custom-btn btn-primary"
          >
            Tạo thẻ mới
          </Button>
        </div>
        <Table<TagRecord>
          columns={columns}
          dataSource={tags}
          rowKey="tagId"
          pagination={{ pageSize: 15 }}
        />
      </Card>

      <Modal
        title={editingTag ? 'Chỉnh sửa thẻ' : 'Thêm thẻ mới'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText={editingTag ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        destroyOnClose
        width={420}
        okButtonProps={{ className: 'custom-btn btn-primary' }}
        cancelButtonProps={{ className: 'custom-btn' }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="tagName"
            label="Tên thẻ"
            rules={[
              { required: true, message: 'Vui lòng nhập tên thẻ!' },
              { max: 50, message: 'Tên thẻ không được vượt quá 50 ký tự!' },
              { min: 2, message: 'Tên thẻ phải có ít nhất 2 ký tự!' },
            ]}
          >
            <Input placeholder="Ví dụ: ReactJS, TypeScript, CSS..." />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default TagManagementPage;

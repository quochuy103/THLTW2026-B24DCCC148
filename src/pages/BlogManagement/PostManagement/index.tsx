import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Tag,
  Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { history } from 'umi';
import '@/pages/BlogManagement/blog.less';
import {
  getPosts,
  savePosts,
  getTags,
  initBlogData,
  PostRecord,
  TagRecord,
} from '@/services/BlogManagement';

const { Option } = Select;
const { TextArea } = Input;

const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const PostManagementPage: React.FC = () => {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [tags, setTags] = useState<TagRecord[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<PostRecord | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [form] = Form.useForm();

  useEffect(() => {
    initBlogData();
    setPosts(getPosts());
    setTags(getTags());
  }, []);

  const handleCreate = () => {
    setEditingPost(null);
    form.resetFields();
    form.setFieldsValue({ status: 'DRAFT', tags: [], viewCount: 0 });
    setIsModalVisible(true);
  };

  const handleEdit = (record: PostRecord) => {
    setEditingPost(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (postId: string) => {
    const updated = posts.filter((p) => p.postId !== postId);
    setPosts(updated);
    savePosts(updated);
    message.success('Đã xóa bài viết');
  };

  const handleTitleChange = () => {
    if (!editingPost) {
      const title = form.getFieldValue('title') || '';
      form.setFieldsValue({ slug: slugify(title) });
    }
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      // Slug uniqueness check
      const slugDuplicate = posts.some(
        (p) => p.slug === values.slug && p.postId !== editingPost?.postId,
      );
      if (slugDuplicate) {
        form.setFields([{ name: 'slug', errors: ['Slug này đã tồn tại! Vui lòng chọn slug khác.'] }]);
        return;
      }

      if (editingPost) {
        const updated = posts.map((p) =>
          p.postId === editingPost.postId ? ({ ...p, ...values } as PostRecord) : p,
        );
        setPosts(updated);
        savePosts(updated);
        message.success('Cập nhật bài viết thành công');
      } else {
        const newPost: PostRecord = {
          ...values,
          postId: `POST${Date.now()}`,
          createdAt: new Date().toISOString(),
          viewCount: 0,
        };
        const updated = [...posts, newPost];
        setPosts(updated);
        savePosts(updated);
        message.success('Thêm bài viết thành công');
      }
      setIsModalVisible(false);
    });
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === '' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTagName = (tagId: string) => {
    const found = tags.find((t) => t.tagId === tagId);
    return found ? found.tagName : tagId;
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      sorter: (a: PostRecord, b: PostRecord) => a.title.localeCompare(b.title),
      render: (text: string, record: PostRecord) => (
        <span
          style={{ fontWeight: 600, cursor: 'pointer', color: '#1890ff' }}
          onClick={() => history.push(`/blog-management/post/${record.slug}`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) =>
        status === 'PUBLISHED' ? (
          <Tag color="green">Đã đăng</Tag>
        ) : (
          <Tag color="orange">Nháp</Tag>
        ),
      filters: [
        { text: 'Đã đăng', value: 'PUBLISHED' },
        { text: 'Nháp', value: 'DRAFT' },
      ],
      onFilter: (value: string | number | boolean, record: PostRecord) =>
        record.status === value,
    },
    {
      title: 'Thẻ',
      dataIndex: 'tags',
      key: 'tags',
      render: (tagIds: string[]) =>
        tagIds.map((id) => (
          <Tag key={id} color="blue" style={{ marginBottom: 2 }}>
            {getTagName(id)}
          </Tag>
        )),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
      sorter: (a: PostRecord, b: PostRecord) => a.viewCount - b.viewCount,
      render: (v: number) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.8 }}>
          <EyeOutlined />
          {v}
        </span>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: (a: PostRecord, b: PostRecord) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (iso: string) =>
        new Date(iso).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: any, record: PostRecord) => (
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
            title="Bạn có chắc muốn xóa bài viết này?"
            onConfirm={() => handleDelete(record.postId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                className="btn-icon"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Quản lý Bài viết">
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            className="custom-btn btn-primary"
          >
            Tạo bài viết
          </Button>
          <Space>
            <Select
              allowClear
              placeholder="Lọc theo trạng thái"
              style={{ width: 180 }}
              value={statusFilter || undefined}
              onChange={(val) => setStatusFilter(val || '')}
            >
              <Option value="PUBLISHED">Đã đăng</Option>
              <Option value="DRAFT">Nháp</Option>
            </Select>
            <Input.Search
              placeholder="Tìm kiếm theo tiêu đề..."
              allowClear
              style={{ width: 280 }}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Space>
        </div>

        <Table<PostRecord>
          columns={columns}
          dataSource={filteredPosts}
          rowKey="postId"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingPost ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={760}
        okText={editingPost ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        destroyOnClose
        okButtonProps={{ className: 'custom-btn btn-primary' }}
        cancelButtonProps={{ className: 'custom-btn' }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input onChange={handleTitleChange} />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug (URL)"
            rules={[
              { required: true, message: 'Vui lòng nhập slug!' },
              {
                pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                message: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang!',
              },
            ]}
          >
            <Input placeholder="vi-du-slug-bai-viet" />
          </Form.Item>

          <Form.Item
            name="thumbnail"
            label="URL Thumbnail"
            rules={[{ required: true, message: 'Vui lòng nhập URL thumbnail!' }]}
          >
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item
            name="author"
            label="Tác giả"
            rules={[{ required: true, message: 'Vui lòng nhập tên tác giả!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="summary"
            label="Tóm tắt"
            rules={[{ required: true, message: 'Vui lòng nhập tóm tắt bài viết!' }]}
          >
            <TextArea rows={3} maxLength={300} showCount />
          </Form.Item>

          <Form.Item name="tags" label="Thẻ">
            <Select mode="multiple" placeholder="Chọn thẻ" allowClear>
              {tags.map((tag) => (
                <Option key={tag.tagId} value={tag.tagId}>
                  {tag.tagName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              <Option value="DRAFT">Nháp</Option>
              <Option value="PUBLISHED">Đã đăng</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung (Markdown)"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung bài viết!' }]}
          >
            <TextArea rows={12} placeholder="Viết nội dung bài viết bằng Markdown..." />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default PostManagementPage;

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Table, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCourses, saveCourses, getInstructors, initCourseData, CourseRecord, InstructorRecord } from '@/services/CourseManagement';
import TinyEditor from '@/components/TinyEditor';

const { Option } = Select;

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [instructors, setInstructors] = useState<InstructorRecord[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseRecord | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    initCourseData();
    setCourses(getCourses());
    setInstructors(getInstructors());
  }, []);

  const handleCreate = () => {
    setEditingCourse(null);
    form.resetFields();
    form.setFieldsValue({ status: 'OPEN', studentCount: 0 });
    setIsModalVisible(true);
  };

  const handleEdit = (record: CourseRecord) => {
    setEditingCourse(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (courseId: string) => {
    const targetCourse = courses.find(c => c.courseId === courseId);
    if (targetCourse && targetCourse.studentCount > 0) {
      message.error('Không thể xóa khóa học đang có học viên');
      return;
    }
    const updated = courses.filter(c => c.courseId !== courseId);
    setCourses(updated);
    saveCourses(updated);
    message.success('Đã xóa khóa học thành công');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const isDuplicate = courses.some(
        c => c.courseName.toLowerCase() === values.courseName.toLowerCase() && c.courseId !== editingCourse?.courseId
      );
      
      if (isDuplicate) {
        form.setFields([{ name: 'courseName', errors: ['Tên khóa học đã tồn tại!'] }]);
        return;
      }

      const formattedValues = {
        ...values,
      };

      if (editingCourse) {
        const updated = courses.map(c => 
          c.courseId === editingCourse.courseId ? { ...c, ...formattedValues } as CourseRecord : c
        );
        setCourses(updated);
        saveCourses(updated);
        message.success('Cập nhật thành công');
      } else {
        const existingIds = courses.map(c => parseInt(c.courseId.replace(/\D/g, ''), 10) || 0);
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        const newCourse: CourseRecord = {
          ...formattedValues,
          courseId: `C${String(maxId + 1).padStart(2, '0')}`,
        };
        const updated = [...courses, newCourse];
        setCourses(updated);
        saveCourses(updated);
        message.success('Thêm mới khóa học thành công');
      }
      setIsModalVisible(false);
    });
  };

  const filteredCourses = courses.filter(course =>
    course.courseName.toLowerCase().includes(searchText.toLowerCase())
  );

  const getInstructorName = (id: string) => {
    const instructor = instructors.find(i => i.instructorId === id);
    return instructor ? instructor.instructorName : id;
  };

  const columns = [
    {
      title: 'Mã KH',
      dataIndex: 'courseId',
      key: 'courseId',
    },
    {
      title: 'Tên khóa học',
      dataIndex: 'courseName',
      key: 'courseName',
      sorter: (a: CourseRecord, b: CourseRecord) => a.courseName.localeCompare(b.courseName),
    },
    {
      title: 'Giảng viên',
      dataIndex: 'instructor',
      key: 'instructor',
      render: (instructorId: string) => getInstructorName(instructorId),
      filters: instructors.map(i => ({ text: i.instructorName, value: i.instructorId })),
      onFilter: (value: string | number | boolean, record: CourseRecord) => record.instructor === value,
    },
    {
      title: 'Số học viên',
      dataIndex: 'studentCount',
      key: 'studentCount',
      sorter: (a: CourseRecord, b: CourseRecord) => a.studentCount - b.studentCount,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = { OPEN: '#52c41a', CLOSED: '#f5222d', PAUSED: '#faad14' };
        const labels: Record<string, string> = { OPEN: 'Đang mở', CLOSED: 'Đã kết thúc', PAUSED: 'Tạm dừng' };
        return <span style={{ color: colors[status] || '#000' }}>{labels[status] || status}</span>;
      },
      filters: [
        { text: 'Đang mở', value: 'OPEN' },
        { text: 'Đã kết thúc', value: 'CLOSED' },
        { text: 'Tạm dừng', value: 'PAUSED' },
      ],
      onFilter: (value: string | number | boolean, record: CourseRecord) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: CourseRecord) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Bạn có chắc muốn xóa khóa học này?" onConfirm={() => handleDelete(record.courseId)}>
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Quản lý Khóa học">
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Thêm Khóa học
          </Button>
          <Input.Search 
            placeholder="Tìm kiếm theo tên khóa học..." 
            allowClear 
            style={{ width: 300 }} 
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <Table<CourseRecord>
          columns={columns}
          dataSource={filteredCourses}
          rowKey="courseId"
        />
      </Card>

      <Modal
        title={editingCourse ? "Chỉnh sửa Khóa học" : "Thêm Khóa học"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="courseName" 
            label="Tên khóa học" 
            rules={[
              { required: true, message: 'Vui lòng nhập tên khóa học!' },
              { max: 100, message: 'Tên khóa học không được vượt quá 100 ký tự!' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item 
            name="instructor" 
            label="Giảng viên" 
            rules={[{ required: true, message: 'Vui lòng chọn giảng viên!' }]}
          >
            <Select placeholder="Chọn giảng viên">
              {instructors.map(inst => (
                <Option key={inst.instructorId} value={inst.instructorId}>
                  {inst.instructorName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            name="studentCount" 
            label="Số lượng học viên" 
            rules={[{ required: true, message: 'Vui lòng nhập số học viên!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item 
            name="status" 
            label="Trạng thái" 
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              <Option value="OPEN">Đang mở</Option>
              <Option value="PAUSED">Tạm dừng</Option>
              <Option value="CLOSED">Đã kết thúc</Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Mô tả chi tiết">
            <TinyEditor height={300} tinyToolbar={true} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default CoursesPage;

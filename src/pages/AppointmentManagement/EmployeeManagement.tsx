import { useState } from 'react';
import {
	Table,
	Button,
	Modal,
	Form,
	Input,
	InputNumber,
	Select,
	Card,
	Space,
	Tag,
	message,
	Divider,
	Checkbox,
	Row,
	Col,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { Employee, DayOfWeek, WorkSchedule } from '@/models/appointment';
import useAppointmentModel from '@/models/appointment';
import { employeeService } from '@/services/appointment';

const DAYS_OF_WEEK: DayOfWeek[] = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

export default function EmployeeManagement() {
	const { employees, addEmployee, updateEmployee, deleteEmployee } = useAppointmentModel();
	const [form] = Form.useForm();
	const [modalVisible, setModalVisible] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
	const [schedules, setSchedules] = useState<WorkSchedule[]>([]);

	const handleAddEdit = async (values: any) => {
		const validation = employeeService.validateEmployee({
			...values,
			workSchedules: schedules,
		});

		if (!validation.valid) {
			message.error(validation.errors.join(', '));
			return;
		}

		const employeeData: Omit<Employee, 'id' | 'createdAt' | 'averageRating' | 'totalRating' | 'ratingCount'> = {
			name: values.name,
			phone: values.phone,
			email: values.email,
			position: values.position,
			maxAppointmentsPerDay: values.maxAppointmentsPerDay,
			workSchedules: schedules,
			status: values.status || 'active',
		};

		if (editingId) {
			updateEmployee(editingId, {
				...employeeData,
				totalRating: employees.find((e) => e.id === editingId)?.totalRating || 0,
				ratingCount: employees.find((e) => e.id === editingId)?.ratingCount || 0,
				averageRating: employees.find((e) => e.id === editingId)?.averageRating || 0,
			});
			message.success('Cập nhật nhân viên thành công');
		} else {
			addEmployee(employeeService.createEmployee(employeeData));
			message.success('Thêm nhân viên thành công');
		}

		handleCloseModal();
	};

	const handleCloseModal = () => {
		setModalVisible(false);
		setEditingId(null);
		form.resetFields();
		setSelectedDays([]);
		setSchedules([]);
	};

	const handleEdit = (record: Employee) => {
		setEditingId(record.id);
		form.setFieldsValue({
			name: record.name,
			phone: record.phone,
			email: record.email,
			position: record.position,
			maxAppointmentsPerDay: record.maxAppointmentsPerDay,
			status: record.status,
		});
		setSchedules(record.workSchedules);
		setSelectedDays(record.workSchedules.map((s) => s.dayOfWeek));
		setModalVisible(true);
	};

	const handleDelete = (id: string) => {
		Modal.confirm({
			title: 'Xóa nhân viên',
			content: 'Bạn có chắc chắn muốn xóa nhân viên này?',
			okText: 'Xóa',
			cancelText: 'Hủy',
			onOk() {
				deleteEmployee(id);
				message.success('Xóa nhân viên thành công');
			},
		});
	};

	const handleDayToggle = (day: DayOfWeek, checked: boolean) => {
		if (checked) {
			setSelectedDays([...selectedDays, day]);
			setSchedules([...schedules, { dayOfWeek: day, startTime: '09:00', endTime: '17:00' }]);
		} else {
			setSelectedDays(selectedDays.filter((d) => d !== day));
			setSchedules(schedules.filter((s) => s.dayOfWeek !== day));
		}
	};

	const handleScheduleChange = (day: DayOfWeek, field: 'startTime' | 'endTime', value: string) => {
		setSchedules(schedules.map((s) => (s.dayOfWeek === day ? { ...s, [field]: value } : s)));
	};

	const columns = [
		{
			title: 'Tên',
			dataIndex: 'name',
			key: 'name',
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Số điện thoại',
			dataIndex: 'phone',
			key: 'phone',
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
		},
		{
			title: 'Chức vụ',
			dataIndex: 'position',
			key: 'position',
		},
		{
			title: 'Lịch/Ngày',
			dataIndex: 'maxAppointmentsPerDay',
			key: 'maxAppointmentsPerDay',
			render: (max: number) => `${max} khách`,
		},
		{
			title: 'Đánh giá',
			dataIndex: 'averageRating',
			key: 'averageRating',
			render: (rating: number, record: Employee) =>
				record.ratingCount > 0 ? (
					<Space>
						<Tag color='gold'>{rating.toFixed(1)} ⭐</Tag>
						<span>({record.ratingCount})</span>
					</Space>
				) : (
					<span style={{ color: '#999' }}>Chưa có đánh giá</span>
				),
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => (
				<Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? 'Hoạt động' : 'Tạm dừng'}</Tag>
			),
		},
		{
			title: 'Thao tác',
			key: 'action',
			render: (_: any, record: Employee) => (
				<Space>
					<Button type='primary' size='small' icon={<EditOutlined />} onClick={() => handleEdit(record)}>
						Sửa
					</Button>
					<Button danger size='small' icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
						Xóa
					</Button>
				</Space>
			),
		},
	];

	return (
		<Card
			title='Quản lý nhân viên'
			extra={
				<Button type='primary' icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
					Thêm nhân viên
				</Button>
			}
		>
			<Table columns={columns} dataSource={employees} rowKey='id' pagination={{ pageSize: 10 }} />

			<Modal
				title={editingId ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}
				visible={modalVisible}
				onOk={form.submit}
				onCancel={handleCloseModal}
				width={700}
			>
				<Form form={form} layout='vertical' onFinish={handleAddEdit}>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item label='Tên nhân viên' name='name' rules={[{ required: true }]}>
								<Input placeholder='Nhập tên nhân viên' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='Số điện thoại' name='phone' rules={[{ required: true }]}>
								<Input placeholder='Nhập số điện thoại' />
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col span={12}>
							<Form.Item label='Email' name='email' rules={[{ required: true }]}>
								<Input placeholder='Nhập email' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='Chức vụ' name='position' rules={[{ required: true }]}>
								<Input placeholder='Ví dụ: Nhân viên cắt tóc' />
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col span={12}>
							<Form.Item label='Số khách tối đa/ngày' name='maxAppointmentsPerDay' rules={[{ required: true }]}>
								<InputNumber min={1} max={20} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='Trạng thái' name='status' initialValue='active'>
								<Select
									options={[
										{ label: 'Hoạt động', value: 'active' },
										{ label: 'Tạm dừng', value: 'inactive' },
									]}
								/>
							</Form.Item>
						</Col>
					</Row>

					<Divider>Lịch làm việc</Divider>

					<div style={{ marginBottom: 16 }}>
						{DAYS_OF_WEEK.map((day) => (
							<div
								key={day}
								style={{ marginBottom: 12, padding: '10px', border: '1px solid #f0f0f0', borderRadius: 4 }}
							>
								<Checkbox checked={selectedDays.includes(day)} onChange={(e) => handleDayToggle(day, e.target.checked)}>
									{day}
								</Checkbox>
								{selectedDays.includes(day) && (
									<Row gutter={8} style={{ marginTop: 8, marginLeft: 24 }}>
										<Col span={12}>
											<Input
												type='time'
												value={schedules.find((s) => s.dayOfWeek === day)?.startTime || '09:00'}
												onChange={(e) => handleScheduleChange(day, 'startTime', e.target.value)}
												style={{ width: '100%' }}
											/>
										</Col>
										<Col span={12}>
											<Input
												type='time'
												value={schedules.find((s) => s.dayOfWeek === day)?.endTime || '17:00'}
												onChange={(e) => handleScheduleChange(day, 'endTime', e.target.value)}
												style={{ width: '100%' }}
											/>
										</Col>
									</Row>
								)}
							</div>
						))}
					</div>
				</Form>
			</Modal>
		</Card>
	);
}

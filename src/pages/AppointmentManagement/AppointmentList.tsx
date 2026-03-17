import { useState } from 'react';
import {
	Table,
	Button,
	Modal,
	Select,
	Card,
	Space,
	Tag,
	message,
	DatePicker,
	Popconfirm,
	Row,
	Col,
	Statistic,
	Form,
	Input,
	TimePicker,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { Appointment, AppointmentStatus } from '@/models/appointment';
import useAppointmentModel from '@/models/appointment';
import dayjs from 'dayjs';

export default function AppointmentList() {
	const {
		appointments,
		addAppointment,
		updateAppointment,
		deleteAppointment,
		employees,
		services,
		checkAppointmentConflict,
	} = useAppointmentModel();

	const [statusFilter, setStatusFilter] = useState<any>('Tất cả');
	const [dateFilter, setDateFilter] = useState<string | null>(null);
	const [detailOpen, setDetailOpen] = useState(false);
	const [selected, setSelected] = useState<Appointment | null>(null);
	const [bookingOpen, setBookingOpen] = useState(false);
	const [form] = Form.useForm();

	const handleBook = (values: any) => {
		const service = services.find((s) => s.id === values.serviceId);
		if (!service) return;

		const appointmentDate = values.appointmentDate.format('YYYY-MM-DD');
		const startTime = values.startTime.format('HH:mm');

		const startDt = dayjs(`2000-01-01 ${startTime}`);
		const endDt = startDt.add(service.duration, 'minute');
		const endTime = endDt.format('HH:mm');

		const conflict = checkAppointmentConflict(values.employeeId, appointmentDate, startTime, endTime);
		if (conflict) {
			message.error('Nhân viên đã có lịch trong khung giờ này!');
			return;
		}

		const newAppointment: Appointment = {
			id: `APT${Date.now()}`,
			customerId: `CUST${Date.now()}`,
			customerName: values.customerName,
			customerPhone: values.customerPhone,
			customerEmail: values.customerEmail || '',
			employeeId: values.employeeId,
			serviceId: values.serviceId,
			appointmentDate,
			startTime,
			endTime,
			status: 'Chờ duyệt',
			notes: values.notes || '',
			totalPrice: service.price,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		addAppointment(newAppointment);
		message.success('Đặt lịch thành công');
		setBookingOpen(false);
		form.resetFields();
	};

	const getEmployeeName = (id: string) => {
		const emp = employees.find((e) => e.id === id);
		return emp ? emp.name : 'N/A';
	};

	const getServiceName = (id: string) => {
		const svc = services.find((s) => s.id === id);
		return svc ? svc.name : 'N/A';
	};

	let data = appointments;

	if (statusFilter !== 'Tất cả') {
		data = data.filter((a) => a.status === statusFilter);
	}

	if (dateFilter) {
		data = data.filter((a) => a.appointmentDate === dateFilter);
	}

	const stats = {
		total: data.length,
		confirmed: data.filter((a) => a.status === 'Xác nhận').length,
		completed: data.filter((a) => a.status === 'Hoàn thành').length,
		cancelled: data.filter((a) => a.status === 'Hủy').length,
	};

	const changeStatus = (id: string, status: AppointmentStatus) => {
		updateAppointment(id, { status });
		message.success('Cập nhật thành công');
	};

	const removeAppointment = (id: string) => {
		deleteAppointment(id);
		message.success('Đã xóa');
	};

	const columns = [
		{
			title: 'Mã',
			dataIndex: 'id',
		},
		{
			title: 'Khách',
			render: (_: any, r: Appointment) => (
				<div>
					<b>{r.customerName}</b>
					<br />
					<small>{r.customerPhone}</small>
				</div>
			),
		},
		{
			title: 'Nhân viên',
			render: (_: any, r: Appointment) => getEmployeeName(r.employeeId),
		},
		{
			title: 'Dịch vụ',
			render: (_: any, r: Appointment) => getServiceName(r.serviceId),
		},
		{
			title: 'Ngày',
			render: (_: any, r: Appointment) => (
				<div>
					{dayjs(r.appointmentDate).format('DD/MM/YYYY')}
					<br />
					{r.startTime} - {r.endTime}
				</div>
			),
		},
		{
			title: 'Giá',
			render: (_: any, r: Appointment) => (
				<span style={{ color: '#52c41a', fontWeight: 600 }}>
					{new Intl.NumberFormat('vi-VN').format(r.totalPrice)}đ
				</span>
			),
		},
		{
			title: 'Trạng thái',
			render: (_: any, r: Appointment) => {
				let color = 'default';
				if (r.status === 'Xác nhận') color = 'blue';
				if (r.status === 'Hoàn thành') color = 'green';
				if (r.status === 'Hủy') color = 'red';
				return <Tag color={color}>{r.status}</Tag>;
			},
		},
		{
			title: 'Thao tác',
			render: (_: any, r: Appointment) => (
				<Space direction='vertical' size='small'>
					<Button
						size='small'
						block
						onClick={() => {
							setSelected(r);
							setDetailOpen(true);
						}}
					>
						Chi tiết
					</Button>

					{r.status !== 'Hoàn thành' && r.status !== 'Hủy' && (
						<Button size='small' type='primary' block onClick={() => changeStatus(r.id, 'Xác nhận')}>
							Xác nhận
						</Button>
					)}

					{r.status === 'Xác nhận' && (
						<Button
							size='small'
							block
							style={{ background: '#52c41a', color: '#fff' }}
							onClick={() => changeStatus(r.id, 'Hoàn thành')}
						>
							Hoàn thành
						</Button>
					)}

					<Popconfirm title='Hủy lịch?' onConfirm={() => changeStatus(r.id, 'Hủy')}>
						<Button danger size='small' block>
							Hủy
						</Button>
					</Popconfirm>

					<Popconfirm title='Xóa lịch?' onConfirm={() => removeAppointment(r.id)}>
						<Button danger size='small' icon={<DeleteOutlined />} block>
							Xóa
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<Card style={{ marginBottom: 16 }}>
				<Row gutter={16}>
					<Col span={6}>
						<Statistic title='Tổng' value={stats.total} />
					</Col>
					<Col span={6}>
						<Statistic title='Xác nhận' value={stats.confirmed} />
					</Col>
					<Col span={6}>
						<Statistic title='Hoàn thành' value={stats.completed} />
					</Col>
					<Col span={6}>
						<Statistic title='Hủy' value={stats.cancelled} />
					</Col>
				</Row>
			</Card>

			<Card
				title='Danh sách lịch hẹn'
				extra={
					<Space>
						<Button type='primary' icon={<PlusOutlined />} onClick={() => setBookingOpen(true)}>
							Đặt lịch mới
						</Button>
						<Select
							style={{ width: 150 }}
							value={statusFilter}
							onChange={setStatusFilter}
							options={[
								{ label: 'Tất cả', value: 'Tất cả' },
								{ label: 'Chờ duyệt', value: 'Chờ duyệt' },
								{ label: 'Xác nhận', value: 'Xác nhận' },
								{ label: 'Hoàn thành', value: 'Hoàn thành' },
								{ label: 'Hủy', value: 'Hủy' },
							]}
						/>
						<DatePicker format='DD/MM/YYYY' onChange={(d: any) => setDateFilter(d ? d.format('YYYY-MM-DD') : null)} />
					</Space>
				}
			>
				<Table columns={columns} dataSource={data} rowKey='id' pagination={{ pageSize: 10 }} />
			</Card>

			<Modal title={`Chi tiết - ${selected?.id}`} visible={detailOpen} onCancel={() => setDetailOpen(false)} footer={null}>
				{selected && (
					<div>
						<p>
							<b>Khách:</b> {selected.customerName}
						</p>
						<p>
							<b>Điện thoại:</b> {selected.customerPhone}
						</p>
						<p>
							<b>Email:</b> {selected.customerEmail}
						</p>
						<p>
							<b>Nhân viên:</b> {getEmployeeName(selected.employeeId)}
						</p>
						<p>
							<b>Dịch vụ:</b> {getServiceName(selected.serviceId)}
						</p>
						<p>
							<b>Ngày:</b> {dayjs(selected.appointmentDate).format('DD/MM/YYYY')}
						</p>
						<p>
							<b>Giờ:</b> {selected.startTime} - {selected.endTime}
						</p>
						<p>
							<b>Giá:</b> {new Intl.NumberFormat('vi-VN').format(selected.totalPrice)}đ
						</p>
						{selected.notes && (
							<p>
								<b>Ghi chú:</b> {selected.notes}
							</p>
						)}
					</div>
				)}
			</Modal>

			<Modal
				title='Đặt lịch hẹn mới'
				visible={bookingOpen}
				onCancel={() => {
					setBookingOpen(false);
					form.resetFields();
				}}
				onOk={() => form.submit()}
				destroyOnClose
				okText='Đặt lịch'
				cancelText='Hủy'
			>
				<Form layout='vertical' form={form} onFinish={handleBook}>
					<Form.Item
						name='customerName'
						label='Tên khách hàng'
						rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
					>
						<Input placeholder='Nhập tên khách hàng' />
					</Form.Item>
					<Form.Item
						name='customerPhone'
						label='Số điện thoại'
						rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
					>
						<Input placeholder='Nhập số điện thoại' />
					</Form.Item>
					<Form.Item
						name='customerEmail'
						label='Email'
						rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
					>
						<Input placeholder='Nhập email (không bắt buộc)' />
					</Form.Item>
					<Form.Item
						name='serviceId'
						label='Dịch vụ'
						rules={[{ required: true, message: 'Vui lòng chọn dịch vụ' }]}
					>
						<Select placeholder='Chọn dịch vụ'>
							{services
								.filter((s) => s.status === 'active')
								.map((s) => (
									<Select.Option key={s.id} value={s.id}>
										{s.name} - {new Intl.NumberFormat('vi-VN').format(s.price)}đ
									</Select.Option>
								))}
						</Select>
					</Form.Item>
					<Form.Item
						name='employeeId'
						label='Nhân viên'
						rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
					>
						<Select placeholder='Chọn nhân viên'>
							{employees
								.filter((e) => e.status === 'active')
								.map((e) => (
									<Select.Option key={e.id} value={e.id}>
										{e.name}
									</Select.Option>
								))}
						</Select>
					</Form.Item>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item
								name='appointmentDate'
								label='Ngày hẹn'
								rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
							>
								<DatePicker format='DD/MM/YYYY' style={{ width: '100%' }} placeholder='Chọn ngày' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name='startTime'
								label='Giờ hẹn'
								rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
							>
								<TimePicker format='HH:mm' style={{ width: '100%' }} minuteStep={15} placeholder='Chọn giờ' />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item name='notes' label='Ghi chú'>
						<Input.TextArea rows={3} placeholder='Ghi chú thêm...' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}

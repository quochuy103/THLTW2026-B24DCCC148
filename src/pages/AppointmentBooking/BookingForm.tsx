import { useState } from 'react';
import {
	Form,
	Input,
	Select,
	Button,
	Card,
	Space,
	message,
	Steps,
	Divider,
	Row,
	Col,
	Alert,
	Tag,
	DatePicker,
	Segmented,
} from 'antd';
import { CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { Service, Employee } from '@/models/appointment';
import useAppointmentModel from '@/models/appointment';
import { appointmentService, employeeService } from '@/services/appointment';
import dayjs from 'dayjs';

export default function BookingForm() {
	const [form] = Form.useForm();
	const { employees, services, appointments, addAppointment } = useAppointmentModel();
	const [currentStep, setCurrentStep] = useState(0);
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
	const [selectedService, setSelectedService] = useState<Service | null>(null);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [timeSlots, setTimeSlots] = useState<string[]>([]);
	const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [bookingSuccess, setBookingSuccess] = useState(false);
	const [newAppointmentId, setNewAppointmentId] = useState<string | null>(null);

	const activeEmployees = employees.filter((e) => e.status === 'active');
	const activeServices = services.filter((s) => s.status === 'active');

	const handleEmployeeChange = (empId: string) => {
		const emp = activeEmployees.find((e) => e.id === empId);
		setSelectedEmployee(emp || null);
	};

	const handleServiceChange = (svcId: string) => {
		const svc = activeServices.find((s) => s.id === svcId);
		setSelectedService(svc || null);
	};

	const handleDateChange = (date: dayjs.Dayjs | null) => {
		if (!date || !selectedEmployee || !selectedService) {
			setTimeSlots([]);
			setSelectedTimeSlot(null);
			return;
		}

		const dateStr = date.format('YYYY-MM-DD');
		setSelectedDate(dateStr);

		// Check if employee can work on that date
		const workStatus = employeeService.getEmployeeWorkStatus(selectedEmployee, dateStr, '09:00');
		if (!workStatus.canWork) {
			message.error(workStatus.reason);
			setTimeSlots([]);
			return;
		}

		// Get available time slots
		const slots = appointmentService.getAvailableTimeSlots(dateStr, selectedEmployee, selectedService, appointments);

		setTimeSlots(slots);
		setSelectedTimeSlot(null);

		if (slots.length === 0) {
			message.warning('Không có khung giờ trống trong ngày hôm nay');
		}
	};

	const handleSubmit = async (values: any) => {
		if (!selectedDate || !selectedTimeSlot || !selectedEmployee || !selectedService) {
			message.error('Vui lòng chọn đủ thông tin');
			return;
		}

		// Check conflict again before booking
		const hasConflict = appointments.some((apt) => {
			if (apt.employeeId !== selectedEmployee.id) return false;
			if (apt.appointmentDate !== selectedDate) return false;
			if (apt.status === 'Hủy') return false;

			const endTime = appointmentService.calculateEndTime(selectedTimeSlot, selectedService.duration);
			const newStart = new Date(`2000-01-01 ${selectedTimeSlot}`);
			const newEnd = new Date(`2000-01-01 ${endTime}`);
			const existStart = new Date(`2000-01-01 ${apt.startTime}`);
			const existEnd = new Date(`2000-01-01 ${apt.endTime}`);

			return newStart < existEnd && newEnd > existStart;
		});

		if (hasConflict) {
			message.error('Khung giờ này đã được đặt, vui lòng chọn khung giờ khác');
			return;
		}

		setLoading(true);

		try {
			const endTime = appointmentService.calculateEndTime(selectedTimeSlot, selectedService.duration);
			const newAppointment = appointmentService.createAppointment({
				customerId: `CUST${Date.now()}`,
				customerName: values.customerName,
				customerPhone: values.customerPhone,
				customerEmail: values.customerEmail,
				employeeId: selectedEmployee.id,
				serviceId: selectedService.id,
				appointmentDate: selectedDate,
				startTime: selectedTimeSlot,
				endTime: endTime,
				status: 'Chờ duyệt',
				notes: values.notes || '',
				totalPrice: selectedService.price,
			});

			addAppointment(newAppointment);
			setNewAppointmentId(newAppointment.id);
			setBookingSuccess(true);
			form.resetFields();
			setCurrentStep(2);

			message.success('Đặt lịch hẹn thành công! Vui lòng chờ xác nhận từ đơn vị.');
		} catch (error) {
			message.error('Có lỗi xảy ra. Vui lòng thử lại!');
		} finally {
			setLoading(false);
		}
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case 0:
				return (
					<Form form={form} layout='vertical'>
						<Alert message='Bước 1: Nhập thông tin cá nhân' type='info' showIcon style={{ marginBottom: 16 }} />

						<Form.Item
							label='Tên của bạn'
							name='customerName'
							rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
						>
							<Input placeholder='Nhập tên đầy đủ' size='large' />
						</Form.Item>

						<Form.Item
							label='Số điện thoại'
							name='customerPhone'
							rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
						>
							<Input placeholder='Nhập số điện thoại' size='large' />
						</Form.Item>

						<Form.Item
							label='Email'
							name='customerEmail'
							rules={[
								{ required: true, message: 'Vui lòng nhập email' },
								{ type: 'email', message: 'Email không hợp lệ' },
							]}
						>
							<Input placeholder='Nhập email' size='large' />
						</Form.Item>

						<Button
							type='primary'
							size='large'
							block
							onClick={() => {
								form.validateFields().then(() => setCurrentStep(1));
							}}
						>
							Tiếp tục
						</Button>
					</Form>
				);

			case 1:
				return (
					<Form form={form} layout='vertical'>
						<Alert message='Bước 2: Chọn dịch vụ & nhân viên' type='info' showIcon style={{ marginBottom: 16 }} />

						<Form.Item label='Chọn nhân viên' required>
							<Select
								placeholder='Chọn nhân viên'
								size='large'
								onChange={handleEmployeeChange}
								options={activeEmployees.map((emp) => ({
									label: (
										<div>
											{emp.name} - {emp.position}
											{emp.averageRating > 0 && <Tag color='gold'>{emp.averageRating} ⭐</Tag>}
										</div>
									),
									value: emp.id,
								}))}
							/>
						</Form.Item>

						<Form.Item label='Chọn dịch vụ' required>
							<Select
								placeholder='Chọn dịch vụ'
								size='large'
								onChange={handleServiceChange}
								options={activeServices.map((svc) => ({
									label: `${svc.name} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
										svc.price,
									)} (${svc.duration} phút)`,
									value: svc.id,
								}))}
							/>
						</Form.Item>

						{selectedEmployee && selectedService && (
							<Card style={{ marginBottom: 16, background: '#f6f8fb' }}>
								<Row gutter={16}>
									<Col span={12}>
										<div>
											<strong>Nhân viên:</strong> {selectedEmployee.name}
										</div>
									</Col>
									<Col span={12}>
										<div>
											<strong>Dịch vụ:</strong> {selectedService.name}
										</div>
									</Col>
								</Row>
								<Row gutter={16}>
									<Col span={12}>
										<div>
											<strong>Thời gian:</strong> {selectedService.duration} phút
										</div>
									</Col>
									<Col span={12}>
										<div>
											<strong>Giá:</strong>{' '}
											{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
												selectedService.price,
											)}
										</div>
									</Col>
								</Row>
							</Card>
						)}

						<Form.Item label='Ghi chú thêm' name='notes'>
							<Input.TextArea rows={3} placeholder='Nhập ghi chú (tùy chọn)' />
						</Form.Item>

						<Space style={{ width: '100%' }} size='large'>
							<Button size='large' style={{ flex: 1 }} onClick={() => setCurrentStep(0)}>
								Quay lại
							</Button>
							<Button
								type='primary'
								size='large'
								style={{ flex: 1 }}
								onClick={() => {
									if (!selectedEmployee || !selectedService) {
										message.error('Vui lòng chọn nhân viên và dịch vụ');
										return;
									}
									setCurrentStep(2);
								}}
							>
								Tiếp tục
							</Button>
						</Space>
					</Form>
				);

			case 2:
				if (bookingSuccess) {
					return (
						<div style={{ textAlign: 'center', padding: '40px 0' }}>
							<CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
							<h2>Đặt lịch hẹn thành công!</h2>
							<p style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
								Mã lịch hẹn của bạn: <strong style={{ color: '#1890ff' }}>{newAppointmentId}</strong>
							</p>
							<p style={{ color: '#666' }}>Chúng tôi sẽ gửi xác nhận qua email trong vòng 1 giờ</p>
							<Button
								type='primary'
								size='large'
								onClick={() => {
									setCurrentStep(0);
									setBookingSuccess(false);
									form.resetFields();
									setSelectedEmployee(null);
									setSelectedService(null);
									setSelectedDate(null);
									setTimeSlots([]);
									setSelectedTimeSlot(null);
								}}
								style={{ marginTop: 24 }}
							>
								Đặt lịch mới
							</Button>
						</div>
					);
				}

				return (
					<Form form={form} layout='vertical' onFinish={handleSubmit}>
						<Alert message='Bước 3: Chọn ngày & giờ' type='info' showIcon style={{ marginBottom: 16 }} />

						<Form.Item label='Chọn ngày hẹn' required>
							<DatePicker
								size='large'
								style={{ width: '100%' }}
								format='DD/MM/YYYY'
								disabledDate={(date) => date < dayjs().startOf('day')}
								onChange={(date: any) => handleDateChange(date)}
							/>
						</Form.Item>

						{selectedDate && timeSlots.length > 0 && (
							<Form.Item label='Chọn giờ hẹn' required>
								<Segmented
									block
									options={timeSlots.map((slot) => ({
										label: slot,
										value: slot,
									}))}
									value={selectedTimeSlot || ''}
									onChange={(val: any) => setSelectedTimeSlot((val as string) || null)}
									style={{ width: '100%' }}
								/>
							</Form.Item>
						)}

						{selectedDate && timeSlots.length === 0 && (
							<Alert message='Không có khung giờ trống trong ngày này' type='warning' showIcon />
						)}

						{selectedDate && selectedTimeSlot && selectedService && (
							<Card style={{ marginBottom: 16, background: '#f6f8fb' }}>
								<Row gutter={16}>
									<Col span={12}>
										<CalendarOutlined /> <strong>Ngày:</strong> {dayjs(selectedDate).format('DD/MM/YYYY')}
									</Col>
									<Col span={12}>
										<ClockCircleOutlined /> <strong>Giờ:</strong> {selectedTimeSlot} -{' '}
										{appointmentService.calculateEndTime(selectedTimeSlot, selectedService.duration)}
									</Col>
								</Row>
							</Card>
						)}

						<Space style={{ width: '100%' }} size='large'>
							<Button size='large' style={{ flex: 1 }} onClick={() => setCurrentStep(1)}>
								Quay lại
							</Button>
							<Button type='primary' size='large' style={{ flex: 1 }} htmlType='submit' loading={loading}>
								Xác nhận đặt lịch
							</Button>
						</Space>
					</Form>
				);

			default:
				return null;
		}
	};

	return (
		<div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
			<Card title={<h2>Đặt lịch hẹn dịch vụ</h2>}>
				<Steps current={currentStep} status='process' style={{ marginBottom: 24 }}>
					<Steps.Step title='Thông tin cá nhân' icon={<CheckCircleOutlined />} />
					<Steps.Step title='Chọn dịch vụ' icon={<CheckCircleOutlined />} />
					<Steps.Step title='Chọn ngày & giờ' icon={<CheckCircleOutlined />} />
				</Steps>

				<Divider />

				{renderStepContent()}
			</Card>
		</div>
	);
}

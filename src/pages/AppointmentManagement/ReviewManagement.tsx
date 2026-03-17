import { useState } from 'react';
import {
	Table,
	Button,
	Modal,
	Form,
	Input,
	Select,
	Card,
	Space,
	Tag,
	message,
	Tabs,
	Row,
	Col,
	Rate,
	Empty,
	Divider,
} from 'antd';
import { DeleteOutlined, SendOutlined } from '@ant-design/icons';
import type { Review } from '@/models/appointment';
import useAppointmentModel from '@/models/appointment';
import { reviewService } from '@/services/appointment';
import dayjs from 'dayjs';

export default function ReviewManagement() {
	const { reviews, appointments, employees, services, addReview, updateReview, deleteReview } = useAppointmentModel();
	const [form] = Form.useForm();
	const [replyForm] = Form.useForm();
	const [modalVisible, setModalVisible] = useState(false);
	const [replyModalVisible, setReplyModalVisible] = useState(false);
	const [selectedReview, setSelectedReview] = useState<Review | null>(null);
	const [filterEmployee, setFilterEmployee] = useState<string | 'Tất cả'>('Tất cả');

	const filteredReviews = reviews.filter((review) => {
		if (filterEmployee !== 'Tất cả' && review.employeeId !== filterEmployee) return false;
		return true;
	});

	const completedAppointments = appointments.filter((apt) => apt.status === 'Hoàn thành');
	const unreviewed = completedAppointments.filter((apt) => !reviews.find((r) => r.appointmentId === apt.id));

	const handleAddReview = async (values: any) => {
		if (!values.appointmentId) {
			message.error('Vui lòng chọn lịch hẹn');
			return;
		}

		const appointment = appointments.find((apt) => apt.id === values.appointmentId);
		if (!appointment) {
			message.error('Lịch hẹn không hợp lệ');
			return;
		}

		const validation = reviewService.validateReview({
			rating: values.rating,
			comment: values.comment,
		});

		if (!validation.valid) {
			message.error(validation.errors.join(', '));
			return;
		}

		const newReview = reviewService.createReview({
			appointmentId: values.appointmentId,
			customerId: appointment.customerId,
			customerName: appointment.customerName,
			employeeId: appointment.employeeId,
			rating: values.rating,
			comment: values.comment,
		});

		addReview(newReview);
		message.success('Thêm đánh giá thành công');
		handleCloseModal();
	};

	const handleCloseModal = () => {
		setModalVisible(false);
		form.resetFields();
	};

	const handleOpenReplyModal = (review: Review) => {
		setSelectedReview(review);
		setReplyModalVisible(true);
		if (review.employeeReply) {
			replyForm.setFieldsValue({ reply: review.employeeReply.reply });
		}
	};

	const handleSubmitReply = async (values: any) => {
		if (!selectedReview) return;

		if (!values.reply?.trim()) {
			message.error('Vui lòng nhập phản hồi');
			return;
		}

		updateReview(selectedReview.id, {
			employeeReply: {
				reply: values.reply,
				repliedAt: new Date().toISOString(),
			},
		});

		message.success('Phản hồi đánh giá thành công');
		setReplyModalVisible(false);
		replyForm.resetFields();
		setSelectedReview(null);
	};

	const handleDeleteReview = (id: string) => {
		Modal.confirm({
			title: 'Xóa đánh giá',
			okText: 'Xóa',
			cancelText: 'Hủy',
			onOk() {
				deleteReview(id);
				message.success('Xóa đánh giá thành công');
			},
		});
	};

	const getEmployeeName = (id: string) => employees.find((e) => e.id === id)?.name || 'N/A';
	const getServiceName = (id: string) => services.find((s) => s.id === id)?.name || 'N/A';

	const columns = [
		{
			title: 'Khách hàng',
			dataIndex: 'customerName',
			key: 'customerName',
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Nhân viên',
			dataIndex: 'employeeId',
			key: 'employeeId',
			render: (empId: string) => getEmployeeName(empId),
		},
		{
			title: 'Đánh giá',
			dataIndex: 'rating',
			key: 'rating',
			render: (rating: number) => (
				<div>
					<Rate disabled value={rating} />
					<span style={{ marginLeft: 8 }}>({rating}/5)</span>
				</div>
			),
		},
		{
			title: 'Bình luận',
			dataIndex: 'comment',
			key: 'comment',
			ellipsis: true,
			render: (text: string) => <span>{text}</span>,
		},
		{
			title: 'Phản hồi',
			key: 'reply',
			render: (_: any, record: Review) => (
				<Tag color={record.employeeReply ? 'green' : 'orange'}>{record.employeeReply ? 'Có' : 'Chưa phản hồi'}</Tag>
			),
		},
		{
			title: 'Ngày',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
		},
		{
			title: 'Thao tác',
			key: 'action',
			render: (_: any, record: Review) => (
				<Space>
					<Button type='primary' size='small' icon={<SendOutlined />} onClick={() => handleOpenReplyModal(record)}>
						{record.employeeReply ? 'Sửa' : 'Phản hồi'}
					</Button>
					<Button danger size='small' icon={<DeleteOutlined />} onClick={() => handleDeleteReview(record.id)}>
						Xóa
					</Button>
				</Space>
			),
		},
	];

	const employeeStats = employees.map((emp) => ({
		employeeId: emp.id,
		employeeName: emp.name,
		averageRating: emp.averageRating,
		ratingCount: emp.ratingCount,
		totalRating: emp.totalRating,
	}));

	return (
		<div>
			<Tabs>
				<Tabs.TabPane tab='Danh sách đánh giá' key='1'>
					<Card
						title='Quản lý đánh giá dịch vụ'
						extra={
							<Select
								style={{ width: 200 }}
								value={filterEmployee}
								onChange={setFilterEmployee}
								options={[
									{ label: 'Tất cả nhân viên', value: 'Tất cả' },
									...employees.map((emp) => ({ label: emp.name, value: emp.id })),
								]}
							/>
						}
					>
						<Table columns={columns} dataSource={filteredReviews} rowKey='id' pagination={{ pageSize: 10 }} />
					</Card>
				</Tabs.TabPane>

				<Tabs.TabPane tab={`Đánh giá mới (${unreviewed.length})`} key='2'>
					<Card
						title='Lịch hẹn chưa được đánh giá'
					>
						{unreviewed.length === 0 ? (
							<Empty description='Không có lịch hẹn chưa đánh giá' />
						) : (
							<Table
								columns={[
									{
										title: 'Mã lịch',
										dataIndex: 'id',
										key: 'id',
										width: 100,
									},
									{
										title: 'Khách hàng',
										dataIndex: 'customerName',
										key: 'customerName',
									},
									{
										title: 'Nhân viên',
										dataIndex: 'employeeId',
										key: 'employeeId',
										render: (empId: string) => getEmployeeName(empId),
									},
									{
										title: 'Dịch vụ',
										dataIndex: 'serviceId',
										key: 'serviceId',
										render: (svcId: string) => getServiceName(svcId),
									},
									{
										title: 'Ngày hoàn thành',
										dataIndex: 'appointmentDate',
										key: 'appointmentDate',
										render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
									},
									{
										title: 'Thao tác',
										key: 'action',
										render: (_: any, record: any) => (
											<Button
												type='primary'
												size='small'
												onClick={() => {
													form.setFieldsValue({ appointmentId: record.id, rating: 5 });
													setModalVisible(true);
												}}
											>
												Đánh giá
											</Button>
										),
									},
								]}
								dataSource={unreviewed}
								rowKey='id'
								pagination={{ pageSize: 10 }}
							/>
						)}
					</Card>
				</Tabs.TabPane>

				<Tabs.TabPane tab='Thống kê đánh giá' key='3'>
					<Card title='Thống kê đánh giá nhân viên'>
						{employeeStats.length === 0 ? (
							<Empty description='Không có dữ liệu' />
						) : (
							employeeStats.map((stat) => (
								<div key={stat.employeeId}>
									<Row
										gutter={16}
										style={{ marginBottom: 24, padding: '16px', background: '#f6f8fb', borderRadius: 4 }}
									>
										<Col span={8}>
											<h3>{stat.employeeName}</h3>
										</Col>
										<Col span={8}>
											<div>
												<strong>Đánh giá trung bình:</strong>
												<div style={{ marginTop: 8 }}>
													<Rate disabled value={Math.round(stat.averageRating)} />
													<span style={{ marginLeft: 8 }}>{stat.averageRating.toFixed(1)}/5</span>
												</div>
											</div>
										</Col>
										<Col span={8}>
											<div>
												<strong>Số lần đánh giá:</strong>
												<div style={{ marginTop: 8, fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
													{stat.ratingCount}
												</div>
											</div>
										</Col>
									</Row>
								</div>
							))
						)}
					</Card>
				</Tabs.TabPane>
			</Tabs>

			{/* Add Review Modal */}
			<Modal
				title='Thêm đánh giá mới'
				visible={modalVisible}
				onOk={form.submit}
				onCancel={handleCloseModal}
				width={600}
			>
				<Form form={form} layout='vertical' onFinish={handleAddReview}>
					<Form.Item
						label='Chọn lịch hẹn'
						name='appointmentId'
						rules={[{ required: true, message: 'Vui lòng chọn lịch hẹn' }]}
					>
						<Select
							placeholder='Chọn lịch hẹn đã hoàn thành'
							options={unreviewed.map((apt) => ({
								label: `${apt.customerName} - ${getServiceName(apt.serviceId)} (${dayjs(apt.appointmentDate).format(
									'DD/MM/YYYY',
								)})`,
								value: apt.id,
							}))}
						/>
					</Form.Item>

					<Form.Item
						label='Đánh giá'
						name='rating'
						rules={[{ required: true, message: 'Vui lòng chọn đánh giá' }]}
						initialValue={5}
					>
						<Rate />
					</Form.Item>

					<Form.Item label='Bình luận' name='comment' rules={[{ required: true, message: 'Vui lòng nhập bình luận' }]}>
						<Input.TextArea rows={4} placeholder='Nhập bình luận chi tiết' />
					</Form.Item>
				</Form>
			</Modal>

			{/* Reply Modal */}
			<Modal
				title='Phản hồi đánh giá'
				visible={replyModalVisible}
				onOk={replyForm.submit}
				onCancel={() => {
					setReplyModalVisible(false);
					replyForm.resetFields();
					setSelectedReview(null);
				}}
				width={600}
			>
				{selectedReview && (
					<div>
						<div style={{ marginBottom: 16, padding: 12, background: '#f6f8fb', borderRadius: 4 }}>
							<Row gutter={16}>
								<Col span={12}>
									<strong>Khách hàng:</strong> {selectedReview.customerName}
								</Col>
								<Col span={12}>
									<strong>Đánh giá:</strong>
									<div style={{ marginTop: 4 }}>
										<Rate disabled value={selectedReview.rating} />
									</div>
								</Col>
							</Row>
							<Divider />
							<div>
								<strong>Bình luận:</strong>
								<p style={{ marginTop: 8 }}>{selectedReview.comment}</p>
							</div>
						</div>

						<Form form={replyForm} layout='vertical' onFinish={handleSubmitReply}>
							<Form.Item label='Phản hồi' name='reply' rules={[{ required: true, message: 'Vui lòng nhập phản hồi' }]}>
								<Input.TextArea rows={4} placeholder='Nhập phản hồi của bạn' />
							</Form.Item>
						</Form>
					</div>
				)}
			</Modal>
		</div>
	);
}

import { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Card, Space, Tag, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { Service } from '@/models/appointment';
import useAppointmentModel from '@/models/appointment';
import { serviceService } from '@/services/appointment';

export default function ServiceManagement() {
	const { services, addService, updateService, deleteService } = useAppointmentModel();
	const [form] = Form.useForm();
	const [modalVisible, setModalVisible] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const handleAddEdit = async (values: any) => {
		const validation = serviceService.validateService(values);

		if (!validation.valid) {
			message.error(validation.errors.join(', '));
			return;
		}

		if (editingId) {
			updateService(editingId, {
				name: values.name,
				description: values.description,
				price: values.price,
				duration: values.duration,
				status: values.status || 'active',
			});
			message.success('Cập nhật dịch vụ thành công');
		} else {
			addService(
				serviceService.createService({
					name: values.name,
					description: values.description,
					price: values.price,
					duration: values.duration,
					status: values.status || 'active',
				}),
			);
			message.success('Thêm dịch vụ thành công');
		}

		handleCloseModal();
	};

	const handleCloseModal = () => {
		setModalVisible(false);
		setEditingId(null);
		form.resetFields();
	};

	const handleEdit = (record: Service) => {
		setEditingId(record.id);
		form.setFieldsValue({
			name: record.name,
			description: record.description,
			price: record.price,
			duration: record.duration,
			status: record.status,
		});
		setModalVisible(true);
	};

	const handleDelete = (id: string) => {
		Modal.confirm({
			title: 'Xóa dịch vụ',
			content: 'Bạn có chắc chắn muốn xóa dịch vụ này?',
			okText: 'Xóa',
			cancelText: 'Hủy',
			onOk() {
				deleteService(id);
				message.success('Xóa dịch vụ thành công');
			},
		});
	};

	const columns = [
		{
			title: 'Tên dịch vụ',
			dataIndex: 'name',
			key: 'name',
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Mô tả',
			dataIndex: 'description',
			key: 'description',
			ellipsis: true,
		},
		{
			title: 'Giá (VND)',
			dataIndex: 'price',
			key: 'price',
			render: (price: number) => (
				<span style={{ fontWeight: 'bold', color: '#1890ff' }}>{new Intl.NumberFormat('vi-VN').format(price)}</span>
			),
		},
		{
			title: 'Thời gian (phút)',
			dataIndex: 'duration',
			key: 'duration',
			render: (duration: number) => `${duration} phút`,
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
			render: (_: any, record: Service) => (
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
			title='Quản lý dịch vụ'
			extra={
				<Button type='primary' icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
					Thêm dịch vụ
				</Button>
			}
		>
			<Table columns={columns} dataSource={services} rowKey='id' pagination={{ pageSize: 10 }} />

			<Modal
				title={editingId ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}
				visible={modalVisible}
				onOk={form.submit}
				onCancel={handleCloseModal}
				width={600}
			>
				<Form form={form} layout='vertical' onFinish={handleAddEdit}>
					<Form.Item label='Tên dịch vụ' name='name' rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}>
						<Input placeholder='Ví dụ: Cắt tóc nam' />
					</Form.Item>

					<Form.Item label='Mô tả' name='description'>
						<Input.TextArea rows={3} placeholder='Mô tả chi tiết dịch vụ' />
					</Form.Item>

					<Form.Item label='Giá (VND)' name='price' rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
						<InputNumber min={0} style={{ width: '100%' }} placeholder='Nhập giá dịch vụ' />
					</Form.Item>

					<Form.Item
						label='Thời gian thực hiện (phút)'
						name='duration'
						rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
					>
						<InputNumber min={5} step={5} style={{ width: '100%' }} placeholder='Nhập thời gian (phút)' />
					</Form.Item>

					<Form.Item label='Trạng thái' name='status' initialValue='active'>
						<select style={{ width: '100%', padding: '6px 11px', border: '1px solid #d9d9d9', borderRadius: '2px' }}>
							<option value='active'>Hoạt động</option>
							<option value='inactive'>Tạm dừng</option>
						</select>
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
}

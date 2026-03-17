import { useState } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Table, Tabs, Empty, Space } from 'antd';
import { DollarOutlined, CalendarOutlined } from '@ant-design/icons';
import useAppointmentModel from '@/models/appointment';
import { statisticsService } from '@/services/appointment';
import dayjs from 'dayjs';

export default function Statistics() {
	const { appointments, employees, services } = useAppointmentModel();
	const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
		dayjs().subtract(30, 'days'),
		dayjs(),
	]);

	if (!dateRange) {
		return <Empty description='Vui lòng chọn khoảng thời gian' />;
	}

	const startDate = dateRange[0].format('YYYY-MM-DD');
	const endDate = dateRange[1].format('YYYY-MM-DD');

	// Get statistics
	const appointmentStats = statisticsService.getAppointmentStats(appointments, startDate, endDate);
	const employeeStats = statisticsService.getEmployeeStats(appointments, employees, startDate, endDate);
	const serviceStats = statisticsService.getServiceStats(appointments, services, startDate, endDate);

	// Calculate totals
	const totalAppointments = appointmentStats.reduce((sum, stat) => sum + stat.count, 0);
	const totalCompleted = appointmentStats.reduce((sum, stat) => sum + stat.completed, 0);
	const totalCancelled = appointmentStats.reduce((sum, stat) => sum + stat.cancelled, 0);
	const totalRevenue = appointments
		.filter((apt) => apt.appointmentDate >= startDate && apt.appointmentDate <= endDate && apt.status === 'Hoàn thành')
		.reduce((sum, apt) => sum + apt.totalPrice, 0);

	// Employee columns
	const employeeColumns = [
		{
			title: 'Tên nhân viên',
			dataIndex: 'employeeName',
			key: 'employeeName',
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Tổng lịch',
			dataIndex: 'totalAppointments',
			key: 'totalAppointments',
			render: (count: number) => <span style={{ fontWeight: 'bold' }}>{count}</span>,
		},
		{
			title: 'Hoàn thành',
			dataIndex: 'completedAppointments',
			key: 'completedAppointments',
			render: (count: number) => <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{count}</span>,
		},
		{
			title: 'Doanh thu',
			dataIndex: 'revenue',
			key: 'revenue',
			render: (revenue: number) => (
				<span style={{ color: '#1890ff', fontWeight: 'bold' }}>
					{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenue)}
				</span>
			),
		},
		{
			title: 'Đánh giá TB',
			dataIndex: 'averageRating',
			key: 'averageRating',
			render: (rating: number) => (
				<span>
					{rating > 0 ? (
						<>
							<span style={{ color: '#faad14' }}>⭐ {rating.toFixed(1)}</span>
						</>
					) : (
						'Chưa có'
					)}
				</span>
			),
		},
	];

	const serviceColumns = [
		{
			title: 'Tên dịch vụ',
			dataIndex: 'serviceName',
			key: 'serviceName',
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Giá',
			dataIndex: 'price',
			key: 'price',
			render: (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price),
		},
		{
			title: 'Số lần đặt',
			dataIndex: 'totalAppointments',
			key: 'totalAppointments',
			render: (count: number) => <strong>{count}</strong>,
		},
		{
			title: 'Doanh thu',
			dataIndex: 'revenue',
			key: 'revenue',
			render: (revenue: number) => (
				<span style={{ color: '#1890ff', fontWeight: 'bold' }}>
					{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenue)}
				</span>
			),
		},
		{
			title: '% doanh thu',
			key: 'percentage',
			render: (_: any, record: any) => (
				<span>{totalRevenue > 0 ? ((record.revenue / totalRevenue) * 100).toFixed(1) : 0}%</span>
			),
		},
	];

	const appointmentColumns = [
		{
			title: 'Ngày',
			dataIndex: 'date',
			key: 'date',
			render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
		},
		{
			title: 'Tổng lịch',
			dataIndex: 'count',
			key: 'count',
		},
		{
			title: 'Hoàn thành',
			dataIndex: 'completed',
			key: 'completed',
			render: (count: number) => <span style={{ color: '#52c41a' }}>{count}</span>,
		},
		{
			title: 'Hủy',
			dataIndex: 'cancelled',
			key: 'cancelled',
			render: (count: number) => <span style={{ color: '#ff4d4f' }}>{count}</span>,
		},
	];

	return (
		<div>
			<Card style={{ marginBottom: 16 }}>
				<Space>
					<strong>Chọn khoảng thời gian:</strong>
					<DatePicker.RangePicker
						format='DD/MM/YYYY'
						value={dateRange as any}
						onChange={(dates: any) => setDateRange(dates)}
					/>
				</Space>
			</Card>

			{/* Summary Cards */}
			<Row gutter={16} style={{ marginBottom: 24 }}>
				<Col span={6}>
					<Card>
						<Statistic
							title='Tổng lịch hẹn'
							value={totalAppointments}
							prefix={<CalendarOutlined />}
							valueStyle={{ color: '#1890ff' }}
						/>
					</Card>
				</Col>
				<Col span={6}>
					<Card>
						<Statistic
							title='Hoàn thành'
							value={totalCompleted}
							valueStyle={{ color: '#52c41a' }}
							suffix={`(${totalAppointments > 0 ? ((totalCompleted / totalAppointments) * 100).toFixed(0) : 0}%)`}
						/>
					</Card>
				</Col>
				<Col span={6}>
					<Card>
						<Statistic
							title='Hủy'
							value={totalCancelled}
							valueStyle={{ color: '#ff4d4f' }}
							suffix={`(${totalAppointments > 0 ? ((totalCancelled / totalAppointments) * 100).toFixed(0) : 0}%)`}
						/>
					</Card>
				</Col>
				<Col span={6}>
					<Card>
						<Statistic
							title='Doanh thu'
							value={totalRevenue}
							prefix={<DollarOutlined />}
							valueStyle={{ color: '#faad14' }}
							formatter={(value: any) => new Intl.NumberFormat('vi-VN').format(value as number)}
							suffix='VND'
						/>
					</Card>
				</Col>
			</Row>

			{/* Tabs */}
			<Tabs>
				<Tabs.TabPane key='1' tab={`Thống kê theo nhân viên (${employeeStats.length})`}>
					<Card>
						{employeeStats.length === 0 ? (
							<Empty description='Không có dữ liệu' />
						) : (
							<Table
								columns={employeeColumns}
								dataSource={employeeStats}
								rowKey='employeeId'
								pagination={false}
								size='middle'
							/>
						)}
					</Card>
				</Tabs.TabPane>

				<Tabs.TabPane key='2' tab={`Thống kê theo dịch vụ (${serviceStats.length})`}>
					<Card>
						{serviceStats.length === 0 ? (
							<Empty description='Không có dữ liệu' />
						) : (
							<Table
								columns={serviceColumns}
								dataSource={serviceStats}
								rowKey='serviceId'
								pagination={false}
								size='middle'
							/>
						)}
					</Card>
				</Tabs.TabPane>

				<Tabs.TabPane key='3' tab={`Thống kê theo ngày (${appointmentStats.length})`}>
					<Card>
						{appointmentStats.length === 0 ? (
							<Empty description='Không có dữ liệu' />
						) : (
							<Table
								columns={appointmentColumns}
								dataSource={appointmentStats}
								rowKey='date'
								pagination={false}
								size='middle'
							/>
						)}
					</Card>
				</Tabs.TabPane>

				<Tabs.TabPane key='4' tab='Chi tiết lịch hẹn'>
					<Card>
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
									render: (empId: string) => employees.find((e) => e.id === empId)?.name || 'N/A',
								},
								{
									title: 'Dịch vụ',
									dataIndex: 'serviceId',
									key: 'serviceId',
									render: (svcId: string) => services.find((s) => s.id === svcId)?.name || 'N/A',
								},
								{
									title: 'Ngày',
									dataIndex: 'appointmentDate',
									key: 'appointmentDate',
									render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
								},
								{
									title: 'Giá',
									dataIndex: 'totalPrice',
									key: 'totalPrice',
									render: (price: number) =>
										new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price),
								},
								{
									title: 'Trạng thái',
									dataIndex: 'status',
									key: 'status',
								},
							]}
							dataSource={appointments.filter(
								(apt) => apt.appointmentDate >= startDate && apt.appointmentDate <= endDate,
							)}
							rowKey='id'
							pagination={{ pageSize: 15 }}
							size='small'
						/>
					</Card>
				</Tabs.TabPane>
			</Tabs>
		</div>
	);
}

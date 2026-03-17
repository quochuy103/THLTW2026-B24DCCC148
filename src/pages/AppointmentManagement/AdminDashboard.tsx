import { Tabs } from 'antd';
import { UserOutlined, ShoppingOutlined, CalendarOutlined, StarOutlined, BarChartOutlined } from '@ant-design/icons';

import EmployeeManagement from './EmployeeManagement';
import ServiceManagement from './ServiceManagement';
import AppointmentList from './AppointmentList';
import ReviewManagement from './ReviewManagement';
import Statistics from './Statistics';

export default function AdminDashboard() {
	return (
		<Tabs defaultActiveKey='employees'>
			<Tabs.TabPane
				key='employees'
				tab={
					<span>
						<UserOutlined />
						Quản lý nhân viên
					</span>
				}
			>
				<EmployeeManagement />
			</Tabs.TabPane>

			<Tabs.TabPane
				key='services'
				tab={
					<span>
						<ShoppingOutlined />
						Quản lý dịch vụ
					</span>
				}
			>
				<ServiceManagement />
			</Tabs.TabPane>

			<Tabs.TabPane
				key='appointments'
				tab={
					<span>
						<CalendarOutlined />
						Quản lý lịch hẹn
					</span>
				}
			>
				<AppointmentList />
			</Tabs.TabPane>

			<Tabs.TabPane
				key='reviews'
				tab={
					<span>
						<StarOutlined />
						Quản lý đánh giá
					</span>
				}
			>
				<ReviewManagement />
			</Tabs.TabPane>

			<Tabs.TabPane
				key='statistics'
				tab={
					<span>
						<BarChartOutlined />
						Thống kê & báo cáo
					</span>
				}
			>
				<Statistics />
			</Tabs.TabPane>
		</Tabs>
	);
}

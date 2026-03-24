export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './Dashboard',
		icon: 'DashboardOutlined',
	},
	{
		path: '/products',
		name: 'Quản lý Sản phẩm',
		component: './Products',
		icon: 'ShopOutlined',
	},
	{
		path: '/orders',
		name: 'Quản lý Đơn hàng',
		component: './Orders',
		icon: 'ShoppingCartOutlined',
	},
	{
		path: '/game',
		name: 'Trò chơi Đoán Số',
		component: './GuessingGame',
		icon: 'PlayCircleOutlined',
	},
	{
		path: '/study',
		name: 'Theo dõi Học tập',
		component: './StudyTracker',
		icon: 'ReadOutlined',
	},
	{
		path: '/keo-bua-bao',
		name: 'Kéo Búa Bao',
		component: './KeoBuaBao',
		icon: 'TrophyOutlined',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		path: '/question-bank-management',
		name: 'Ngân hàng Đề thi',
		component: './QuestionBankManagement',
		icon: 'DatabaseOutlined',
	},
	{
		path: '/appointment-management',
		name: 'Quản lý Lịch Hẹn',
		component: './AppointmentManagement/AdminDashboard',
		icon: 'CalendarOutlined',
	},
	{
		path: '/random-user',
		name: 'RandomUser',
		component: './RandomUser',
		icon: 'ArrowsAltOutlined',
		hideInMenu: true,
	},
	{
		path: '/todo-list',
		name: 'TodoList',
		icon: 'OrderedListOutlined',
		component: './TodoList',
		hideInMenu: true,
	},
	// Removing old product-management path to avoid confusion
	// {
	// 	path: '/product-management',
	// 	name: 'Quản lý Sản phẩm',
	// 	component: './ProductManagement',
	// 	icon: 'TableOutlined',
	// },

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},

	// Diploma BLL (Sổ Văn Bằng Tốt Nghiệp) Management Routes
	{
		path: '/diploma-bll',
		name: 'Quản Lý Sổ Văn Bằng',
		icon: 'FileTextOutlined',
		routes: [
			{
				path: '/diploma-bll/register',
				name: 'Quản Lý Sổ Văn Bằng',
				component: './DiplomaBLL/DiplomaRegisterManagement',
			},
			{
				path: '/diploma-bll/decision',
				name: 'Quyết Định Tốt Nghiệp',
				component: './DiplomaBLL/GraduationDecisionManagement',
			},
			{
				path: '/diploma-bll/form-config',
				name: 'Cấu Hình Biểu Mẫu',
				component: './DiplomaBLL/FormConfiguration',
			},
			{
				path: '/diploma-bll/diploma-info',
				name: 'Quản Lý Thông Tin Văn Bằng',
				component: './DiplomaBLL/DiplomaManagement',
			},
			{
				path: '/diploma-bll/lookup',
				name: 'Tra Cứu Văn Bằng',
				component: './DiplomaBLL/DiplomaLookup',
			},
		],
	},

	{
		path: '/',
		redirect: '/dashboard',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];

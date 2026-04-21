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
		path: '/diploma',
		name: 'Quản lý Văn bằng',
		icon: 'SafetyCertificateOutlined',
		routes: [
			{
				path: '/diploma/registry',
				name: 'Sổ văn bằng',
				component: './DiplomaBLL/DiplomaRegistry',
			},
			{
				path: '/diploma/decision',
				name: 'Quyết định tốt nghiệp',
				component: './DiplomaBLL/GraduationDecision',
			},
			{
				path: '/diploma/template',
				name: 'Cấu hình biểu mẫu',
				component: './DiplomaBLL/DiplomaTemplate',
			},
			{
				path: '/diploma/information',
				name: 'Thông tin văn bằng',
				component: './DiplomaBLL/DiplomaInformation',
			},
			{
				path: '/diploma/lookup',
				name: 'Tra cứu văn bằng',
				component: './DiplomaBLL/DiplomaLookup',
			},
		],
	},

	{
		path: '/club-management',
		name: 'Quản lý CLB',
		icon: 'TeamOutlined',
		routes: [
			{
				path: '/club-management/dashboard',
				name: 'Báo cáo & Thống kê',
				component: './ClubManagement/Dashboard',
			},
			{
				path: '/club-management/clubs',
				name: 'Câu lạc bộ',
				component: './ClubManagement/Clubs',
			},
			{
				path: '/club-management/applications',
				name: 'Đơn đăng ký',
				component: './ClubManagement/Applications',
			},
			{
				path: '/club-management/members',
				name: 'Thành viên',
				component: './ClubManagement/Members',
			},
		],
	},

	{
		path: '/travel-planner',
		name: 'Kế hoạch Du lịch',
		icon: 'CompassOutlined',
		routes: [
			{
				path: '/travel-planner/destinations',
				name: 'Khám phá điểm đến',
				component: './TravelPlanner/Destinations',
			},
			{
				path: '/travel-planner/itinerary',
				name: 'Lịch trình',
				component: './TravelPlanner/Itinerary',
			},
			{
				path: '/travel-planner/budget',
				name: 'Ngân sách',
				component: './TravelPlanner/Budget',
			},
			{
				path: '/travel-planner/admin',
				name: 'Quản trị điểm đến',
				component: './TravelPlanner/AdminDestinations',
			},
			{
				path: '/travel-planner/reports',
				name: 'Báo cáo & Thống kê',
				component: './TravelPlanner/Reports',
			},
		],
	},

	{
		path: '/course-management',
		name: 'Quản lý Khóa học',
		icon: 'ReadOutlined',
		routes: [
			{
				path: '/course-management/courses',
				name: 'Danh sách Khóa học',
				component: './CourseManagement/Courses',
			},
		],
	},

	{
		path: '/blog-management',
		name: 'Blog',
		icon: 'FileTextOutlined',
		routes: [
			{
				path: '/blog-management/home',
				name: 'Trang chủ Blog',
				component: './BlogManagement/Home',
			},
			{
				path: '/blog-management/post/:slug',
				component: './BlogManagement/PostDetail',
				hideInMenu: true,
			},
			{
				path: '/blog-management/about',
				name: 'Giới thiệu',
				component: './BlogManagement/About',
			},
			{
				path: '/blog-management/posts',
				name: 'Quản lý Bài viết',
				component: './BlogManagement/PostManagement',
			},
			{
				path: '/blog-management/tags',
				name: 'Quản lý Thẻ',
				component: './BlogManagement/TagManagement',
			},
		],
	},

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

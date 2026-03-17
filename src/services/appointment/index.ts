import { Employee, Service, Appointment, Review, AppointmentStatus } from '@/models/appointment';

// ============== Employee Service ==============
export const employeeService = {
	createEmployee: (data: Omit<Employee, 'id' | 'createdAt' | 'averageRating' | 'totalRating' | 'ratingCount'>) =>
		({
			...data,
			id: `EMP${Date.now()}`,
			createdAt: new Date().toISOString(),
			totalRating: 0,
			ratingCount: 0,
			averageRating: 0,
		} as Employee),

	validateEmployee: (data: any): { valid: boolean; errors: string[] } => {
		const errors: string[] = [];
		if (!data.name?.trim()) errors.push('Tên nhân viên là bắt buộc');
		if (!data.phone?.trim()) errors.push('Số điện thoại là bắt buộc');
		if (!data.email?.trim()) errors.push('Email là bắt buộc');
		if (!data.position?.trim()) errors.push('Chức vụ là bắt buộc');
		if (!data.maxAppointmentsPerDay || data.maxAppointmentsPerDay < 1) errors.push('Số lịch tối đa mỗi ngày phải >= 1');
		if (!data.workSchedules || data.workSchedules.length === 0) errors.push('Vui lòng chọn ít nhất 1 ngày làm việc');
		return { valid: errors.length === 0, errors };
	},

	getEmployeeWorkStatus: (employee: Employee, date: string, time: string): { canWork: boolean; reason?: string } => {
		const dateObj = new Date(date);
		const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
		const dayOfWeek = dayNames[dateObj.getDay()];

		const schedule = employee.workSchedules.find((s) => s.dayOfWeek === dayOfWeek);
		if (!schedule) {
			return { canWork: false, reason: `${employee.name} không làm việc vào ${dayOfWeek}` };
		}

		const timeNum = parseInt(time.replace(':', ''));
		const startNum = parseInt(schedule.startTime.replace(':', ''));
		const endNum = parseInt(schedule.endTime.replace(':', ''));

		if (timeNum < startNum || timeNum >= endNum) {
			return {
				canWork: false,
				reason: `Giờ này nằm ngoài thời gian làm việc (${schedule.startTime}-${schedule.endTime})`,
			};
		}

		return { canWork: true };
	},
};

// ============== Service Service ==============
export const serviceService = {
	createService: (data: Omit<Service, 'id' | 'createdAt'>) =>
		({
			...data,
			id: `SVC${Date.now()}`,
			createdAt: new Date().toISOString(),
		} as Service),

	validateService: (data: any): { valid: boolean; errors: string[] } => {
		const errors: string[] = [];
		if (!data.name?.trim()) errors.push('Tên dịch vụ là bắt buộc');
		if (!data.price || data.price < 0) errors.push('Giá dịch vụ phải > 0');
		if (!data.duration || data.duration < 5) errors.push('Thời gian thực hiện phải >= 5 phút');
		return { valid: errors.length === 0, errors };
	},

	formatPrice: (price: number): string => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
	},
};

// ============== Appointment Service ==============
export const appointmentService = {
	createAppointment: (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) =>
		({
			...data,
			id: `APT${Date.now()}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			status: 'Chờ duyệt' as AppointmentStatus,
		} as Appointment),

	validateAppointment: (
		data: any,
		employees: Employee[],
		services: Service[],
	): { valid: boolean; errors: string[] } => {
		const errors: string[] = [];
		if (!data.customerName?.trim()) errors.push('Tên khách hàng là bắt buộc');
		if (!data.customerPhone?.trim()) errors.push('Số điện thoại khách hàng là bắt buộc');
		if (!data.customerEmail?.trim()) errors.push('Email khách hàng là bắt buộc');
		if (!data.employeeId || !employees.find((e) => e.id === data.employeeId)) errors.push('Nhân viên không hợp lệ');
		if (!data.serviceId || !services.find((s) => s.id === data.serviceId)) errors.push('Dịch vụ không hợp lệ');
		if (!data.appointmentDate) errors.push('Ngày hẹn là bắt buộc');
		if (!data.startTime) errors.push('Giờ bắt đầu là bắt buộc');

		// Validate date not in past
		const appointmentDate = new Date(data.appointmentDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		if (appointmentDate < today) errors.push('Ngày hẹn không được trong quá khứ');

		return { valid: errors.length === 0, errors };
	},

	calculateEndTime: (startTime: string, durationMinutes: number): string => {
		const [hours, minutes] = startTime.split(':').map(Number);
		const totalMinutes = hours * 60 + minutes + durationMinutes;
		const endHours = Math.floor(totalMinutes / 60);
		const endMinutes = totalMinutes % 60;
		return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
	},

	getAppointmentStatusColor: (status: AppointmentStatus): string => {
		const colors: Record<AppointmentStatus, string> = {
			'Chờ duyệt': 'orange',
			'Xác nhận': 'blue',
			'Hoàn thành': 'green',
			Hủy: 'red',
		};
		return colors[status];
	},

	canCancelAppointment: (appointment: Appointment): boolean => {
		if (appointment.status === 'Hoàn thành' || appointment.status === 'Hủy') return false;

		const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.startTime}`);
		const now = new Date();
		const hoursUntil = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

		return hoursUntil >= 1; // Có thể hủy nếu còn >= 1 giờ
	},

	getAvailableTimeSlots: (
		date: string,
		employee: Employee,
		service: Service,
		appointments: Appointment[],
	): string[] => {
		const dateObj = new Date(date);
		const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
		const dayOfWeek = dayNames[dateObj.getDay()];

		const schedule = employee.workSchedules.find((s) => s.dayOfWeek === dayOfWeek);
		if (!schedule) return [];

		const slots: string[] = [];
		const [startHour, startMin] = schedule.startTime.split(':').map(Number);
		const [endHour, endMin] = schedule.endTime.split(':').map(Number);
		const startTotalMin = startHour * 60 + startMin;
		const endTotalMin = endHour * 60 + endMin;

		for (let time = startTotalMin; time + service.duration <= endTotalMin; time += 30) {
			const hour = Math.floor(time / 60);
			const min = time % 60;
			const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

			// Check if slot is available
			const endTime = appointmentService.calculateEndTime(timeStr, service.duration);
			const hasConflict = appointments.some((apt) => {
				if (apt.employeeId !== employee.id) return false;
				if (apt.appointmentDate !== date) return false;
				if (apt.status === 'Hủy') return false;

				const newStart = new Date(`2000-01-01 ${timeStr}`);
				const newEnd = new Date(`2000-01-01 ${endTime}`);
				const existStart = new Date(`2000-01-01 ${apt.startTime}`);
				const existEnd = new Date(`2000-01-01 ${apt.endTime}`);

				return newStart < existEnd && newEnd > existStart;
			});

			if (!hasConflict) {
				slots.push(timeStr);
			}
		}

		return slots;
	},
};

// ============== Review Service ==============
export const reviewService = {
	createReview: (data: Omit<Review, 'id' | 'createdAt'>) =>
		({
			...data,
			id: `REV${Date.now()}`,
			createdAt: new Date().toISOString(),
		} as Review),

	validateReview: (data: any): { valid: boolean; errors: string[] } => {
		const errors: string[] = [];
		if (!data.rating || data.rating < 1 || data.rating > 5) errors.push('Đánh giá phải từ 1-5 sao');
		if (!data.comment?.trim()) errors.push('Bình luận là bắt buộc');
		return { valid: errors.length === 0, errors };
	},

	getStarDisplay: (rating: number): string => {
		return '⭐'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
	},
};

// ============== Statistics Service ==============
export const statisticsService = {
	getAppointmentStats: (
		appointments: Appointment[],
		startDate: string,
		endDate: string,
	): { date: string; count: number; completed: number; cancelled: number }[] => {
		const stats: Record<string, { count: number; completed: number; cancelled: number }> = {};

		appointments.forEach((apt) => {
			if (apt.appointmentDate >= startDate && apt.appointmentDate <= endDate) {
				if (!stats[apt.appointmentDate]) {
					stats[apt.appointmentDate] = { count: 0, completed: 0, cancelled: 0 };
				}
				if (apt.status !== 'Hủy') stats[apt.appointmentDate].count++;
				if (apt.status === 'Hoàn thành') stats[apt.appointmentDate].completed++;
				if (apt.status === 'Hủy') stats[apt.appointmentDate].cancelled++;
			}
		});

		return Object.entries(stats)
			.map(([date, data]) => ({ date, ...data }))
			.sort((a, b) => a.date.localeCompare(b.date));
	},

	getEmployeeStats: (
		appointments: Appointment[],
		employees: Employee[],
		startDate: string,
		endDate: string,
	): {
		employeeId: string;
		employeeName: string;
		totalAppointments: number;
		completedAppointments: number;
		revenue: number;
		averageRating: number;
	}[] => {
		const stats: Record<string, { name: string; total: number; completed: number; revenue: number; rating: number }> =
			{};

		employees.forEach((emp) => {
			stats[emp.id] = { name: emp.name, total: 0, completed: 0, revenue: 0, rating: emp.averageRating };
		});

		appointments.forEach((apt) => {
			if (apt.appointmentDate >= startDate && apt.appointmentDate <= endDate && apt.employeeId in stats) {
				if (apt.status !== 'Hủy') stats[apt.employeeId].total++;
				if (apt.status === 'Hoàn thành') {
					stats[apt.employeeId].completed++;
					stats[apt.employeeId].revenue += apt.totalPrice;
				}
			}
		});

		return Object.entries(stats).map(([empId, data]) => ({
			employeeId: empId,
			employeeName: data.name,
			totalAppointments: data.total,
			completedAppointments: data.completed,
			revenue: data.revenue,
			averageRating: data.rating,
		}));
	},

	getServiceStats: (
		appointments: Appointment[],
		services: Service[],
		startDate: string,
		endDate: string,
	): {
		serviceId: string;
		serviceName: string;
		totalAppointments: number;
		revenue: number;
		price: number;
	}[] => {
		const stats: Record<string, { name: string; count: number; revenue: number; price: number }> = {};

		services.forEach((svc) => {
			stats[svc.id] = { name: svc.name, count: 0, revenue: 0, price: svc.price };
		});

		appointments.forEach((apt) => {
			if (apt.appointmentDate >= startDate && apt.appointmentDate <= endDate && apt.serviceId in stats) {
				if (apt.status === 'Hoàn thành') {
					stats[apt.serviceId].count++;
					stats[apt.serviceId].revenue += apt.totalPrice;
				}
			}
		});

		return Object.entries(stats).map(([svcId, data]) => ({
			serviceId: svcId,
			serviceName: data.name,
			totalAppointments: data.count,
			revenue: data.revenue,
			price: data.price,
		}));
	},
};

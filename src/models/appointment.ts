import { useState, useEffect } from 'react';
import { getStorageData, setStorageData, StorageKeys } from '@/utils/storage';

export type AppointmentStatus = 'Chờ duyệt' | 'Xác nhận' | 'Hoàn thành' | 'Hủy';
export type DayOfWeek = 'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7' | 'Chủ nhật';

export interface WorkSchedule {
	dayOfWeek: DayOfWeek;
	startTime: string;
	endTime: string;
}

export interface Employee {
	id: string;
	name: string;
	phone: string;
	email: string;
	position: string;
	maxAppointmentsPerDay: number;
	workSchedules: WorkSchedule[];
	totalRating: number;
	ratingCount: number;
	averageRating: number;
	createdAt: string;
	status: 'active' | 'inactive';
}

export interface Service {
	id: string;
	name: string;
	description: string;
	price: number;
	duration: number;
	createdAt: string;
	status: 'active' | 'inactive';
}

export interface Appointment {
	id: string;
	customerId: string;
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	employeeId: string;
	serviceId: string;
	appointmentDate: string;
	startTime: string;
	endTime: string;
	status: AppointmentStatus;
	notes: string;
	totalPrice: number;
	createdAt: string;
	updatedAt: string;
}

export interface Review {
	id: string;
	appointmentId: string;
	customerId: string;
	customerName: string;
	employeeId: string;
	rating: number;
	comment: string;
	createdAt: string;
	employeeReply?: {
		reply: string;
		repliedAt: string;
	};
}

const DEFAULT_EMPLOYEES: Employee[] = [
	{
		id: 'EMP001',
		name: 'Trần Hương',
		phone: '0912345678',
		email: 'huong@salon.com',
		position: 'Nhân viên cắt tóc',
		maxAppointmentsPerDay: 8,
		workSchedules: [
			{ dayOfWeek: 'Thứ 2', startTime: '09:00', endTime: '17:00' },
			{ dayOfWeek: 'Thứ 3', startTime: '09:00', endTime: '17:00' },
			{ dayOfWeek: 'Thứ 4', startTime: '09:00', endTime: '17:00' },
			{ dayOfWeek: 'Thứ 5', startTime: '09:00', endTime: '17:00' },
			{ dayOfWeek: 'Thứ 6', startTime: '09:00', endTime: '17:00' },
			{ dayOfWeek: 'Thứ 7', startTime: '10:00', endTime: '18:00' },
		],
		totalRating: 24,
		ratingCount: 5,
		averageRating: 4.8,
		createdAt: '2024-01-01',
		status: 'active',
	},
];

const DEFAULT_SERVICES: Service[] = [
	{
		id: 'SVC001',
		name: 'Cắt tóc nam',
		description: 'Cắt tóc nam hiện đại',
		price: 50000,
		duration: 30,
		createdAt: '2024-01-01',
		status: 'active',
	},
	{
		id: 'SVC002',
		name: 'Cắt tóc nữ',
		description: 'Cắt tóc nữ chuyên nghiệp',
		price: 80000,
		duration: 45,
		createdAt: '2024-01-01',
		status: 'active',
	},
	{
		id: 'SVC003',
		name: 'Nhuộm tóc',
		description: 'Nhuộm tóc chuyên nghiệp',
		price: 150000,
		duration: 90,
		createdAt: '2024-01-01',
		status: 'active',
	},
];

const DEFAULT_APPOINTMENTS: Appointment[] = [
	{
		id: 'APT001',
		customerId: 'CUST001',
		customerName: 'Nguyễn Văn A',
		customerPhone: '0987654321',
		customerEmail: 'nguyenvanA@email.com',
		employeeId: 'EMP001',
		serviceId: 'SVC001',
		appointmentDate: '2024-01-20',
		startTime: '09:00',
		endTime: '09:30',
		status: 'Xác nhận',
		notes: 'Cắt nhẹ khoảng 2cm',
		totalPrice: 50000,
		createdAt: '2024-01-15',
		updatedAt: '2024-01-15',
	},
];

const DEFAULT_REVIEWS: Review[] = [
	{
		id: 'REV001',
		appointmentId: 'APT001',
		customerId: 'CUST001',
		customerName: 'Nguyễn Văn A',
		employeeId: 'EMP001',
		rating: 5,
		comment: 'Rất tốt, nhân viên chuyên nghiệp',
		createdAt: '2024-01-22',
		employeeReply: {
			reply: 'Cảm ơn bạn, rất vui được phục vụ!',
			repliedAt: '2024-01-23',
		},
	},
];

export default function useAppointmentModel() {
	const [employees, setEmployees] = useState<Employee[]>(() =>
		getStorageData(StorageKeys.EMPLOYEES, DEFAULT_EMPLOYEES),
	);
	const [services, setServices] = useState<Service[]>(() => getStorageData(StorageKeys.SERVICES, DEFAULT_SERVICES));
	const [appointments, setAppointments] = useState<Appointment[]>(() =>
		getStorageData(StorageKeys.APPOINTMENTS, DEFAULT_APPOINTMENTS),
	);
	const [reviews, setReviews] = useState<Review[]>(() => getStorageData(StorageKeys.REVIEWS, DEFAULT_REVIEWS));

	useEffect(() => {
		setStorageData(StorageKeys.EMPLOYEES, employees);
	}, [employees]);

	useEffect(() => {
		setStorageData(StorageKeys.SERVICES, services);
	}, [services]);

	useEffect(() => {
		setStorageData(StorageKeys.APPOINTMENTS, appointments);
	}, [appointments]);

	useEffect(() => {
		setStorageData(StorageKeys.REVIEWS, reviews);
	}, [reviews]);

	const addEmployee = (employee: Employee) => {
		setEmployees([...employees, employee]);
	};

	const updateEmployee = (id: string, data: Partial<Employee>) => {
		setEmployees(employees.map((emp) => (emp.id === id ? { ...emp, ...data } : emp)));
	};

	const deleteEmployee = (id: string) => {
		setEmployees(employees.filter((emp) => emp.id !== id));
	};

	const getEmployee = (id: string) => employees.find((emp) => emp.id === id);

	const addService = (service: Service) => {
		setServices([...services, service]);
	};

	const updateService = (id: string, data: Partial<Service>) => {
		setServices(services.map((svc) => (svc.id === id ? { ...svc, ...data } : svc)));
	};

	const deleteService = (id: string) => {
		setServices(services.filter((svc) => svc.id !== id));
	};

	const getService = (id: string) => services.find((svc) => svc.id === id);

	const addAppointment = (appointment: Appointment) => {
		setAppointments([...appointments, appointment]);
	};

	const updateAppointment = (id: string, data: Partial<Appointment>) => {
		setAppointments(
			appointments.map((apt) => (apt.id === id ? { ...apt, ...data, updatedAt: new Date().toISOString() } : apt)),
		);
	};

	const deleteAppointment = (id: string) => {
		setAppointments(appointments.filter((apt) => apt.id !== id));
	};

	const getAppointment = (id: string) => appointments.find((apt) => apt.id === id);

	const addReview = (review: Review) => {
		setReviews([...reviews, review]);

		const emp = employees.find((e) => e.id === review.employeeId);
		if (emp) {
			const newTotalRating = emp.totalRating + review.rating;
			const newRatingCount = emp.ratingCount + 1;
			const newAverageRating = newTotalRating / newRatingCount;
			updateEmployee(emp.id, {
				totalRating: newTotalRating,
				ratingCount: newRatingCount,
				averageRating: newAverageRating,
			});
		}
	};

	const updateReview = (id: string, data: Partial<Review>) => {
		setReviews(reviews.map((rev) => (rev.id === id ? { ...rev, ...data } : rev)));
	};

	const deleteReview = (id: string) => {
		const reviewToDelete = reviews.find((r) => r.id === id);
		setReviews(reviews.filter((rev) => rev.id !== id));

		if (reviewToDelete) {
			const emp = employees.find((e) => e.id === reviewToDelete.employeeId);
			if (emp && emp.ratingCount > 0) {
				const newTotalRating = emp.totalRating - reviewToDelete.rating;
				const newRatingCount = emp.ratingCount - 1;
				const newAverageRating = newRatingCount > 0 ? newTotalRating / newRatingCount : 0;
				updateEmployee(emp.id, {
					totalRating: newTotalRating,
					ratingCount: newRatingCount,
					averageRating: newAverageRating,
				});
			}
		}
	};

	const checkAppointmentConflict = (
		employeeId: string,
		appointmentDate: string,
		startTime: string,
		endTime: string,
		excludeId?: string,
	): boolean => {
		return appointments.some((apt) => {
			if (excludeId && apt.id === excludeId) return false;
			if (apt.employeeId !== employeeId) return false;
			if (apt.appointmentDate !== appointmentDate) return false;
			if (apt.status === 'Hủy') return false;

			const newStart = new Date(`2000-01-01 ${startTime}`);
			const newEnd = new Date(`2000-01-01 ${endTime}`);
			const existStart = new Date(`2000-01-01 ${apt.startTime}`);
			const existEnd = new Date(`2000-01-01 ${apt.endTime}`);

			return newStart < existEnd && newEnd > existStart;
		});
	};

	return {
		employees,
		addEmployee,
		updateEmployee,
		deleteEmployee,
		getEmployee,
		services,
		addService,
		updateService,
		deleteService,
		getService,
		appointments,
		addAppointment,
		updateAppointment,
		deleteAppointment,
		getAppointment,
		checkAppointmentConflict,
		reviews,
		addReview,
		updateReview,
		deleteReview,
	};
}

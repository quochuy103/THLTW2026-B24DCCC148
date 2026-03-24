/**
 * Models for Diploma Management System
 */

// Sổ Văn Bằng (Diploma Register)
export interface DiplomaRegister {
  id: string;
  year: number;
  registerNumber: string; // Số hiệu sổ
  currentSequence: number; // Số thứ tự hiện tại (tự động tăng)
  createdDate: string;
  description?: string;
  status: 'active' | 'inactive';
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Quyết Định Tốt Nghiệp (Graduation Decision)
export interface GraduationDecision {
  id: string;
  decisionNumber: string; // Số QĐ
  decisionDate: string; // Ngày ban hành
  summary: string; // Trích yếu
  registerId: string; // Liên kết tới Sổ Văn Bằng
  totalStudents: number; // Tổng số sinh viên tốt nghiệp
  lookupCount: number; // Tổng lượt tra cứu
  status: 'active' | 'inactive';
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Trường Cấu Hình Biểu Mẫu (Form Field Configuration)
export interface FormField {
  id: string;
  fieldName: string; // Tên trường
  fieldType: 'String' | 'Number' | 'Date'; // Kiểu dữ liệu
  description?: string;
  isRequired: boolean;
  displayOrder: number;
  status: 'active' | 'inactive';
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Thông Tin Văn Bằng (Diploma Information)
export interface DiplomaInfo {
  id: string;
  registerId: string; // Liên kết tới Sổ Văn Bằng
  decisionId: string; // Liên kết tới Quyết Định Tốt Nghiệp
  sequenceNumber: number; // Số vào sổ (tự động)
  diplomaNumber: string; // Số hiệu văn bằng
  studentCode: string; // Mã sinh viên (MSV)
  studentName: string; // Họ tên sinh viên
  dateOfBirth: string; // Ngày sinh
  
  // Trường động từ cấu hình biểu mẫu
  customFields: { [key: string]: any };
  
  status: 'active' | 'inactive';
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Request/Response Types
export interface DiplomaInfoRequest {
  registerId: string;
  decisionId: string;
  diplomaNumber: string;
  studentCode: string;
  studentName: string;
  dateOfBirth: string;
  customFields?: { [key: string]: any };
}

export interface DiplomaLookupRequest {
  diplomaNumber?: string; // Số hiệu văn bằng
  sequenceNumber?: string; // Số vào sổ
  studentCode?: string; // MSV
  studentName?: string; // Họ tên
  dateOfBirth?: string; // Ngày sinh
}

export interface DiplomaLookupResponse {
  diploma: DiplomaInfo;
  decision: GraduationDecision;
  register: DiplomaRegister;
}

# Hệ Thống Quản Lý Sổ Văn Bằng Tốt Nghiệp (Diploma Management System)

## Mô Tả

Ứng dụng quản lý sổ văn bằng tốt nghiệp giúp phòng chuyên viên quản lý sổ văn bằng và cho phép người dùng tra cứu thông tin văn bằng.

## Các Chức Năng Chính

### 1. Quản Lý Sổ Văn Bằng (`/diploma-bll/register`)

- **Tạo sổ mới**: Tạo sổ văn bằng cho mỗi năm học
- **Số vào sổ tự động**: Số thứ tự tự động tăng dần, reset về 1 khi mở sổ mới
- **Chỉnh sửa/Xóa**: Cập nhật thông tin hoặc xóa sổ không cần thiết
- **Quản lý trạng thái**: Đánh dấu sổ hoạt động hay không hoạt động

**Thông tin sổ văn bằng:**

- Năm: Năm đào tạo
- Số hiệu sổ: Mã định danh của sổ
- Số thứ tự hiện tại: Số vào sổ hiện tại (dùng cho sinh viên tiếp theo)
- Mô tả: Ghi chú thêm

### 2. Quyết Định Tốt Nghiệp (`/diploma-bll/decision`)

- **Quản lý đợt tốt nghiệp**: Mỗi năm có nhiều đợt sinh viên tốt nghiệp
- **Thông tin quyết định**:
  - Số QĐ: Số hiệu quyết định
  - Ngày ban hành: Ngày ký phát hành quyết định
  - Trích yếu: Nội dung tóm tắt quyết định
  - Sổ văn bằng: Liên kết tới sổ quản lý
  - Tổng sinh viên: Số lượng sinh viên tốt nghiệp
- **Ghi nhận lượt tra cứu**: Hệ thống tự động ghi nhận số lần tra cứu
- **Thống kê**: Xem tổng lượt tra cứu cho mỗi quyết định

### 3. Cấu Hình Biểu Mẫu (`/diploma-bll/form-config`)

- **Quản trị viên cấu hình**: Định nghĩa các trường thông tin bổ sung
- **Kiểu dữ liệu hỗ trợ**:
  - String (Văn bản): Dân tộc, Nơi sinh, v.v.
  - Number (Số): Điểm trung bình, xếp hạng, v.v.
  - Date (Ngày tháng): Ngày nhập học, v.v.
- **Quản lý trường**:
  - Thêm mới trường thông tin
  - Chỉnh sửa tên, kiểu dữ liệu, yêu cầu bắt buộc
  - Xóa trường không cần thiết
  - Sắp xếp thứ tự hiển thị
- **Trạng thái bắt buộc**: Đánh dấu trường nào phải nhập bắt buộc

### 4. Quản Lý Thông Tin Văn Bằng (`/diploma-bll/diploma-info`)

- **Tạo thông tin sinh viên**: Nhập thông tin văn bằng cho từng sinh viên
- **Số vào sổ tự động**: Tự động tăng theo sổ đã chọn, không cho chỉnh sửa
- **Thông tin mặc định**:
  - Số vào sổ (tự động)
  - Số hiệu văn bằng
  - Mã sinh viên (MSV)
  - Họ tên
  - Ngày sinh
- **Thông tin bổ sung**: Được lấy từ cấu hình biểu mẫu (kiểu dữ liệu phải tương ứng)
- **Liên kết với quyết định**: Xác định sinh viên công nhân theo quyết định nào

### 5. Tra Cứu Văn Bằng (`/diploma-bll/lookup`)

- **Cho người dùng tra cứu**: Không yêu cầu đăng nhập
- **Tham số tìm kiếm**:
  - Số hiệu văn bằng
  - Số vào sổ
  - Mã sinh viên (MSV)
  - Họ tên
  - Ngày sinh
- **Yêu cầu**: Nhập **ít nhất 2 tham số** để tìm kiếm
- **Kết quả**: Hiển thị thông tin chi tiết văn bằng, quyết định, sổ
- **Ghi nhận**: Hệ thống tự động ghi nhận lượt tra cứu

## Cấu Trúc Thư Mục

```
src/
├── models/
│   └── diploma.ts                          # Các interface/type định nghĩa
├── services/
│   └── diploma/
│       └── index.ts                        # API calls cho tất cả chức năng
└── pages/
    └── DiplomaBLL/
        ├── DiplomaRegisterManagement/      # Quản lý sổ văn bằng
        ├── GraduationDecisionManagement/   # Quản lý quyết định
        ├── FormConfiguration/              # Cấu hình biểu mẫu
        ├── DiplomaManagement/              # Quản lý thông tin văn bằng
        └── DiplomaLookup/                  # Tra cứu văn bằng
```

## Routes

| Đường dẫn                   | Tên Chức Năng              | Mô Tả                           |
| --------------------------- | -------------------------- | ------------------------------- |
| `/diploma-bll/register`     | Quản Lý Sổ Văn Bằng        | Tạo, chỉnh sửa, xóa sổ văn bằng |
| `/diploma-bll/decision`     | Quyết Định Tốt Nghiệp      | Quản lý các đợt tốt nghiệp      |
| `/diploma-bll/form-config`  | Cấu Hình Biểu Mẫu          | Cấu hình các trường thông tin   |
| `/diploma-bll/diploma-info` | Quản Lý Thông Tin Văn Bằng | Quản lý thông tin sinh viên     |
| `/diploma-bll/lookup`       | Tra Cứu Văn Bằng           | Cho người dùng tra cứu          |

## Công Nghệ Sử Dụng

- **Framework**: React + TypeScript
- **UI Library**: Ant Design
- **State Management**: @umijs Max
- **HTTP Client**: UMI request
- **Date Handling**: dayjs

## Các Models/Types

### DiplomaRegister (Sổ Văn Bằng)

```typescript
{
  id: string;
  year: number;
  registerNumber: string;
  currentSequence: number;
  description?: string;
  status: 'active' | 'inactive';
}
```

### GraduationDecision (Quyết Định Tốt Nghiệp)

```typescript
{
	id: string;
	decisionNumber: string;
	decisionDate: string;
	summary: string;
	registerId: string;
	totalStudents: number;
	lookupCount: number;
	status: 'active' | 'inactive';
}
```

### FormField (Trường Biểu Mẫu)

```typescript
{
  id: string;
  fieldName: string;
  fieldType: 'String' | 'Number' | 'Date';
  description?: string;
  isRequired: boolean;
  displayOrder: number;
  status: 'active' | 'inactive';
}
```

### DiplomaInfo (Thông Tin Văn Bằng)

```typescript
{
  id: string;
  registerId: string;
  decisionId: string;
  sequenceNumber: number;
  diplomaNumber: string;
  studentCode: string;
  studentName: string;
  dateOfBirth: string;
  customFields: { [key: string]: any };
  status: 'active' | 'inactive';
}
```

## API Endpoints

Backend cần cung cấp các endpoint:

- `/api/diploma/registers` - CRUD sổ văn bằng
- `/api/diploma/decisions` - CRUD quyết định
- `/api/diploma/form-fields` - CRUD trường biểu mẫu
- `/api/diploma/infos` - CRUD thông tin văn bằng
- `/api/diploma/lookup` - Tra cứu thông tin
- `/api/diploma/record-lookup` - Ghi nhận lượt tra cứu
- `/api/diploma/lookup-stats/:decisionId` - Thống kê lượt tra cứu

## Lưu Ý Quan Trọng

1. **Số vào sổ tự động**: Không cho phép chỉnh sửa, tự động tăng khi tạo thông tin sinh viên mới
2. **Kiểm tra dữ liệu**: Tra cứu yêu cầu ít nhất 2 tham số
3. **Ghi nhận tra cứu**: Tự động ghi nhận mỗi lần tra cứu thành công
4. **Quản lý trạng thái**: Tất cả thực thể đều có trạng thái hoạt động/không hoạt động

## Hướng Phát Triển Tiếp Theo

- [ ] Xuất báo cáo tra cứu theo quyết định
- [ ] In/Xuất thông tin văn bằng
- [ ] Xác minh chữ ký điện tử
- [ ] Hỗ trợ import dữ liệu từ Excel
- [ ] Dashboard tổng quan thống kê
- [ ] Phân quyền chi tiết (Admin, Staff, User)

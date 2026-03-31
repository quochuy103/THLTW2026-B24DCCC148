export interface ClubRecord {
  clubId: string;
  avatar: string;
  clubName: string;
  foundedDate: string;
  description: string;
  president: string;
  isActive: boolean;
}

export interface HistoryLog {
  timestamp: string;
  action: string;
  note?: string;
}

export interface ApplicationRecord {
  applicationId: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other' | string;
  address: string;
  skills: string;
  clubId: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectNote?: string;
  historyLogs: HistoryLog[];
}

const CLUBS_KEY = 'CM_CLUBS';
const APPS_KEY = 'CM_APPS';

export const getClubs = (): ClubRecord[] => {
  const data = localStorage.getItem(CLUBS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveClubs = (clubs: ClubRecord[]) => {
  localStorage.setItem(CLUBS_KEY, JSON.stringify(clubs));
};

export const getApplications = (): ApplicationRecord[] => {
  const data = localStorage.getItem(APPS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveApplications = (apps: ApplicationRecord[]) => {
  localStorage.setItem(APPS_KEY, JSON.stringify(apps));
};

export const initMockData = () => {
  if (!localStorage.getItem(CLUBS_KEY)) {
    saveClubs([
      {
        clubId: 'C001',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
        clubName: 'IT Club',
        foundedDate: '2020-01-01',
        description: '<p>Câu lạc bộ IT của trường PTIT</p>',
        president: 'Nguyễn Văn A',
        isActive: true,
      },
      {
        clubId: 'C002',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
        clubName: 'English Club',
        foundedDate: '2019-05-15',
        description: '<p>Câu lạc bộ Tiếng Anh giao tiếp</p>',
        president: 'Trần Thị B',
        isActive: true,
      }
    ]);
  }
  if (!localStorage.getItem(APPS_KEY)) {
    saveApplications([
      {
        applicationId: 'APP001',
        fullName: 'Lê Văn C',
        email: 'levanc@example.com',
        phone: '0123456789',
        gender: 'Male',
        address: 'Hà Nội',
        skills: 'Coding, Design',
        clubId: 'C001',
        reason: 'Yêu thích lập trình',
        status: 'Pending',
        historyLogs: [
          {
            timestamp: new Date().toISOString(),
            action: 'Application submitted',
          }
        ]
      },
      {
        applicationId: 'APP002',
        fullName: 'Phạm Thị D',
        email: 'phamthid@example.com',
        phone: '0987654321',
        gender: 'Female',
        address: 'Đà Nẵng',
        skills: 'English, Presentation',
        clubId: 'C002',
        reason: 'Muốn cải thiện kỹ năng giao tiếp',
        status: 'Approved',
        historyLogs: [
          {
            timestamp: new Date(Date.now() - 86400000).toISOString(), 
            action: 'Application submitted',
          },
          {
            timestamp: new Date().toISOString(),
            action: 'Status changed to Approved by Admin',
          }
        ]
      }
    ]);
  }
};

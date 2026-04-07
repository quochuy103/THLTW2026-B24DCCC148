export type DestinationType = 'biển' | 'núi' | 'thành phố';

export interface DestinationRecord {
  id: string;
  name: string;
  image: string;
  type: DestinationType;
  priceEstimate: number;
  rating: number;
  description: string;
  visitDuration: number;
  costFood: number;
  costTransport: number;
  costAccommodation: number;
}

export interface ItineraryDay {
  date: string;
  destinationIds: string[];
}

export interface ItineraryRecord {
  itineraryId: string;
  title: string;
  createdAt: string;
  peopleCount: number;
  days: ItineraryDay[];
}

export interface BudgetRecord {
  itineraryId: string;
  budgetLimit: number;
  other: number;
}



export const MOCK_DESTINATIONS: DestinationRecord[] = [
  {
    id: 'D001',
    name: 'Vịnh Hạ Long',
    image: 'https://asiaholiday.com.vn/pic/Tour/tour-du-lich-ha-long-5_1821_HasThumb.jpg',
    type: 'biển',
    priceEstimate: 3500000,
    rating: 5,
    description: 'Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi.',
    visitDuration: 8,
    costFood: 800000,
    costTransport: 1000000,
    costAccommodation: 1200000,
  },
  {
    id: 'D002',
    name: 'Đà Nẵng',
    image: 'https://i1-vnexpress.vnecdn.net/2026/04/07/DJI-20260125143419-0037-D-1772-8673-3263-1775537419.jpg?w=0&h=0&q=100&dpr=2&fit=crop&s=0XdHvHxcIg1JrpJWxdwsKA',
    type: 'thành phố',
    priceEstimate: 2500000,
    rating: 4.5,
    description: 'Thành phố biển năng động với Cầu Rồng và Bà Nà Hills.',
    visitDuration: 6,
    costFood: 600000,
    costTransport: 700000,
    costAccommodation: 900000,
  },
  {
    id: 'D003',
    name: 'Sapa',
    image: 'https://cdn.baolaocai.vn/images/2c77a1fcf62764f842a62d823ed57061a8cec174a200849bfc759cfde097ca87/sapa-2.jpg',
    type: 'núi',
    priceEstimate: 2800000,
    rating: 4.7,
    description: 'Thị trấn vùng cao với ruộng bậc thang tuyệt đẹp và khí hậu mát mẻ.',
    visitDuration: 10,
    costFood: 500000,
    costTransport: 1200000,
    costAccommodation: 800000,
  },
  {
    id: 'D004',
    name: 'Hội An',
    image: 'https://i1-dulich.vnecdn.net/2025/07/11/hoi-an-photographer-BQePUQ526m-8643-2926-1752223855.jpg?w=0&h=0&q=100&dpr=2&fit=crop&s=9qfBG-xy0cyvOOiwgL6MXA',
    type: 'thành phố',
    priceEstimate: 2000000,
    rating: 4.8,
    description: 'Phố cổ Hội An được UNESCO công nhận di sản văn hóa thế giới.',
    visitDuration: 5,
    costFood: 600000,
    costTransport: 400000,
    costAccommodation: 700000,
  },
  {
    id: 'D005',
    name: 'Mũi Né',
    image: 'https://lalago.vn/wp-content/uploads/2025/05/image7-5.jpg',
    type: 'biển',
    priceEstimate: 1800000,
    rating: 4.2,
    description: 'Thiên đường cồn cát, kite-surf và hải sản tươi ngon.',
    visitDuration: 6,
    costFood: 500000,
    costTransport: 500000,
    costAccommodation: 600000,
  },
  {
    id: 'D006',
    name: 'Đà Lạt',
    image: 'https://cdtour.vn/wp-content/uploads/2025/05/Da-lat.webp',
    type: 'núi',
    priceEstimate: 2200000,
    rating: 4.6,
    description: 'Thành phố ngàn hoa với khí hậu se lạnh quanh năm.',
    visitDuration: 7,
    costFood: 550000,
    costTransport: 700000,
    costAccommodation: 700000,
  },
  {
    id: 'D007',
    name: 'Phú Quốc',
    image: 'https://cdn3.ivivu.com/2025/06/top-du-lich-phu-quoc-ivivu4.jpg',
    type: 'biển',
    priceEstimate: 4500000,
    rating: 4.9,
    description: 'Đảo ngọc với bãi biển trắng tinh và nước biển trong xanh.',
    visitDuration: 12,
    costFood: 1000000,
    costTransport: 1500000,
    costAccommodation: 1500000,
  },
  {
    id: 'D008',
    name: 'Hà Nội',
    image: 'https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/shutterstock1391898416-1646649508378.png',
    type: 'thành phố',
    priceEstimate: 1500000,
    rating: 4.3,
    description: 'Thủ đô nghìn năm văn hiến với hồ Hoàn Kiếm và phố cổ.',
    visitDuration: 4,
    costFood: 500000,
    costTransport: 400000,
    costAccommodation: 500000,
  },
];

const _now = new Date();
const _monthAgo = new Date(_now.getFullYear(), _now.getMonth() - 1, 15);

const MOCK_ITINERARIES: ItineraryRecord[] = [
  {
    itineraryId: 'IT001',
    title: 'Hành trình miền Trung',
    createdAt: _monthAgo.toISOString(),
    peopleCount: 2,
    days: [
      { date: '2026-05-01', destinationIds: ['D002'] },
      { date: '2026-05-02', destinationIds: ['D004'] },
      { date: '2026-05-03', destinationIds: ['D001'] },
    ],
  },
  {
    itineraryId: 'IT002',
    title: 'Khám phá vùng núi cao',
    createdAt: _now.toISOString(),
    peopleCount: 4,
    days: [
      { date: '2026-06-10', destinationIds: ['D003'] },
      { date: '2026-06-11', destinationIds: ['D009'] },
      { date: '2026-06-12', destinationIds: ['D006'] },
    ],
  },
];

const MOCK_BUDGETS: BudgetRecord[] = [
  { itineraryId: 'IT001', budgetLimit: 9000000, other: 500000 },
  { itineraryId: 'IT002', budgetLimit: 8000000, other: 300000 },
];

const CUSTOM_DEST_KEY = 'TP_CUSTOM_DESTINATIONS';
const ITIN_KEY = 'TP_ITINERARIES';
const BUDGET_KEY = 'TP_BUDGETS';

export const getDestinations = (): DestinationRecord[] => {
  const customData = localStorage.getItem(CUSTOM_DEST_KEY);
  const customDests: DestinationRecord[] = customData ? JSON.parse(customData) : [];
  return [...MOCK_DESTINATIONS, ...customDests];
};

export const saveDestinations = (items: DestinationRecord[]) => {
  const mockIds = new Set(MOCK_DESTINATIONS.map((d) => d.id));
  const customItems = items.filter((d) => !mockIds.has(d.id));
  localStorage.setItem(CUSTOM_DEST_KEY, JSON.stringify(customItems));
};

export const getItineraries = (): ItineraryRecord[] => {
  const data = localStorage.getItem(ITIN_KEY);
  return data ? JSON.parse(data) : MOCK_ITINERARIES;
};

export const saveItineraries = (items: ItineraryRecord[]) => {
  localStorage.setItem(ITIN_KEY, JSON.stringify(items));
};

export const getBudgets = (): BudgetRecord[] => {
  const data = localStorage.getItem(BUDGET_KEY);
  return data ? JSON.parse(data) : MOCK_BUDGETS;
};

export const saveBudgets = (items: BudgetRecord[]) => {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(items));
};

export const getBudgetByItinerary = (itineraryId: string): BudgetRecord =>
  getBudgets().find((b) => b.itineraryId === itineraryId) ?? {
    itineraryId,
    budgetLimit: 0,
    other: 0,
  };

export const upsertBudget = (record: BudgetRecord) => {
  const all = getBudgets().filter((b) => b.itineraryId !== record.itineraryId);
  saveBudgets([...all, record]);
};

export const clearTravelData = () => {
  localStorage.removeItem(CUSTOM_DEST_KEY);
  localStorage.removeItem(ITIN_KEY);
  localStorage.removeItem(BUDGET_KEY);
};

export const initTravelMockData = () => {};

export const formatVND = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

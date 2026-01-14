export type CustomerContactDTO = {
  id: number;
  name: string;
  title: string | null;
};

export type CustomerLogDTO = {
  id: number;
  logDate: string;
  method: string;
  notes: string;
};

export type CustomerListItemDTO = {
  id: number;
  company: string;
  category: { id: number; name: string };
  phone: string | null;
  address: string;
  level: string;
  otherSales: string | null;
  nextTime: string | null;
  contacts: CustomerContactDTO[];
  logs: CustomerLogDTO[]; // 列表只回最新一筆（詳情頁再取全量）
  contactCount: number;
  logCount: number;
};

export type CustomerListResponseDTO = {
  items: CustomerListItemDTO[];
  nextCursor: number | null;
};


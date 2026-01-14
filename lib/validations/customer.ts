import { z } from 'zod';

export const customerSchema = z.object({
  company: z.string()
    .min(2, '公司名稱至少需要 2 個字')
    .max(100, '公司名稱不可超過 100 個字'),
  
  category: z.string()
    .min(1, '請選擇產業類別'),
  
  phone: z.string()
    .regex(/^[0-9\-\(\)\s+]+$/, '電話格式不正確')
    .optional()
    .or(z.literal('')),
  
  address: z.string()
    .min(5, '地址至少需要 5 個字')
    .max(200, '地址不可超過 200 個字'),
  
  level: z.enum(['L1', 'L2', 'L3', 'L4', 'L5'], {
    message: '請選擇正確的等級',
  }),
  
  otherSales: z.string()
    .max(50, '其他業務資訊不可超過 50 個字')
    .optional()
    .or(z.literal('')),
  
  nextTime: z.string()
    .optional()
    .or(z.literal(''))
    .nullable(),
});

export const contactSchema = z.object({
  name: z.string()
    .min(2, '聯絡人姓名至少需要 2 個字')
    .max(50, '聯絡人姓名不可超過 50 個字'),
  
  title: z.string()
    .max(50, '職稱不可超過 50 個字')
    .optional()
    .or(z.literal('')),
});

export const developmentLogSchema = z.object({
  logDate: z.string()
    .min(1, '請選擇日期')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return selectedDate <= today;
    }, '日期不可為未來日期'),
  
  method: z.string()
    .min(1, '請選擇聯繫方式'),
  
  notes: z.string()
    .min(10, '紀錄內容至少需要 10 個字')
    .max(500, '紀錄內容不可超過 500 個字'),
});

export const addCustomerSchema = z.object({
  customer: customerSchema,
  contacts: z.array(contactSchema).min(1, '至少需要一個聯絡人'),
  initialLog: developmentLogSchema.optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type DevelopmentLogFormData = z.infer<typeof developmentLogSchema>;
export type AddCustomerFormData = z.infer<typeof addCustomerSchema>;

'use client';

import { useState, useEffect } from 'react';
import Drawer from '../ui/Drawer';
import FormField, { Input, Select } from '../ui/FormField';
import { useFormState } from '@/hooks/useFormState';
import { useFormValidation } from '@/hooks/useFormValidation';
import { customerSchema, type CustomerFormData } from '@/lib/validations/customer';
import { useToast } from '../ui/Toast';
import Icon from '../Icon';
import ContactManager from '../contact/ContactManager';
import LogManager from '../log/LogManager';
import { useCategories } from '@/hooks/useCategories';

interface Customer {
  id: number;
  company: string;
  category: { id: number; name: string };
  phone: string | null;
  address: string;
  level: CustomerFormData['level'];
  otherSales: string | null;
  nextTime: string | null;
  contacts: Array<{ id: number; name: string; title: string | null }>;
  logs: Array<{ id: number; logDate: string; method: string; notes: string }>;
}

interface EditCustomerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSuccess: () => void;
}

const levels = ['L1', 'L2', 'L3', 'L4', 'L5'];

export default function EditCustomerDrawer({
  isOpen,
  onClose,
  customer,
  onSuccess,
}: EditCustomerDrawerProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'contacts' | 'history'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();
  const { items: categoryItems } = useCategories(isOpen);
  const categories = categoryItems.length > 0 ? categoryItems.map((c) => c.name) : ['其他'];

  const { formData, updateField, reset } = useFormState<CustomerFormData>({
    company: '',
    category: '',
    phone: '',
    address: '',
    level: 'L1',
    otherSales: '',
    nextTime: '',
  });

  const { errors, validateField, validate, clearAllErrors } = useFormValidation(customerSchema);

  // 當客戶資料變更時，更新表單
  useEffect(() => {
    if (customer && isOpen) {
      reset({
        company: customer.company,
        category: customer.category.name,
        phone: customer.phone || '',
        address: customer.address,
        level: customer.level,
        otherSales: customer.otherSales || '',
        nextTime: customer.nextTime ? customer.nextTime.split('T')[0] : '',
      });
      clearAllErrors();
      setActiveTab('basic');
    }
  }, [customer, isOpen, reset, clearAllErrors]);

  const handleSave = async () => {
    if (!customer || !validate(formData)) return;

    setIsSaving(true);

    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast('客戶資料已更新', 'success');
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        showToast(error.error || '更新失敗', 'error');
      }
    } catch (error) {
      showToast('更新失敗，請稍後再試', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const renderBasicTab = () => (
    <div className="space-y-5">
      <FormField label="公司名稱" required error={errors.company}>
        <Input
          value={formData.company}
          onChange={(e) => {
            updateField('company', e.target.value);
            validateField('company', e.target.value);
          }}
          error={!!errors.company}
        />
      </FormField>

      <FormField label="產業類別" required error={errors.category}>
        <Select
          value={formData.category}
          onChange={(e) => {
            updateField('category', e.target.value);
            validateField('category', e.target.value);
          }}
          error={!!errors.category}
        >
          <option value="">請選擇</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="等級" required>
        <div className="grid grid-cols-5 gap-2">
          {levels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => updateField('level', level)}
              className={`px-3 py-2 rounded-xl text-sm font-black transition-all ${
                formData.level === level
                  ? 'bg-brand-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="地址" required error={errors.address}>
        <Input
          value={formData.address}
          onChange={(e) => {
            updateField('address', e.target.value);
            validateField('address', e.target.value);
          }}
          error={!!errors.address}
        />
      </FormField>

      <FormField label="電話" error={errors.phone}>
        <Input
          value={formData.phone}
          onChange={(e) => {
            updateField('phone', e.target.value);
            validateField('phone', e.target.value);
          }}
          error={!!errors.phone}
        />
      </FormField>

      <FormField label="其他業務">
        <Input
          value={formData.otherSales}
          onChange={(e) => updateField('otherSales', e.target.value)}
          placeholder="業務代號或姓名"
        />
      </FormField>

      <FormField label="下次聯繫時間">
        <Input
          type="date"
          value={formData.nextTime ?? ''}
          onChange={(e) => updateField('nextTime', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </FormField>
    </div>
  );

  if (!customer) return null;

  const renderContactsTab = () => (
    <ContactManager customerId={customer.id} contacts={customer.contacts} onUpdate={onSuccess} />
  );

  const renderHistoryTab = () => (
    <LogManager customerId={customer.id} logs={customer.logs} onUpdate={onSuccess} />
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="編輯客戶" size="lg">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2 font-black text-sm transition-all ${
            activeTab === 'basic'
              ? 'text-brand-blue border-b-2 border-brand-blue'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          基本資料
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 font-black text-sm transition-all ${
            activeTab === 'contacts'
              ? 'text-brand-blue border-b-2 border-brand-blue'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          聯絡人
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-black text-sm transition-all ${
            activeTab === 'history'
              ? 'text-brand-blue border-b-2 border-brand-blue'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          歷史紀錄
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && renderBasicTab()}
      {activeTab === 'contacts' && renderContactsTab()}
      {activeTab === 'history' && renderHistoryTab()}

      {/* Actions */}
      {activeTab === 'basic' && (
        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-2xl font-black bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black bg-brand-blue text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="save" size={18} />
            {isSaving ? '儲存中...' : '儲存變更'}
          </button>
        </div>
      )}
    </Drawer>
  );
}

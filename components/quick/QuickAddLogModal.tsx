'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import FormField, { Input, TextArea } from '../ui/FormField';
import { useFormState } from '@/hooks/useFormState';
import { useFormValidation } from '@/hooks/useFormValidation';
import { developmentLogSchema } from '@/lib/validations/customer';
import { useToast } from '../ui/Toast';
import Icon from '../Icon';

interface QuickAddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: number;
    company: string;
    nextTime?: string | null;
  } | null;
  onSuccess: () => void;
}

const contactMethods = [
  { value: '電話', icon: 'phone', label: '電話' },
  { value: 'LINE', icon: 'message-circle', label: 'LINE' },
  { value: 'Email', icon: 'mail', label: 'Email' },
  { value: '實體', icon: 'user', label: '實體' },
  { value: '視訊', icon: 'video', label: '視訊' },
];

type Step = 'form' | 'askNextTime';

const quickDateOptions = [
  { label: '明天', days: 1 },
  { label: '3天後', days: 3 },
  { label: '一週後', days: 7 },
  { label: '兩週後', days: 14 },
  { label: '一個月後', days: 30 },
];

export default function QuickAddLogModal({
  isOpen,
  onClose,
  customer,
  onSuccess,
}: QuickAddLogModalProps) {
  const [step, setStep] = useState<Step>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingNextTime, setIsUpdatingNextTime] = useState(false);
  const [customNextTime, setCustomNextTime] = useState('');
  const { showToast } = useToast();

  const { formData, updateField, reset } = useFormState({
    logDate: new Date().toISOString().split('T')[0],
    method: '電話',
    notes: '',
  });

  const { errors, validateField, validate } = useFormValidation(developmentLogSchema);

  const getQuickDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!customer || !validate(formData)) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/customers/${customer.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast('開發紀錄已新增', 'success');
        // 先切換步驟，再通知父組件
        setStep('askNextTime');
      } else {
        const error = await res.json();
        showToast(error.error || '新增失敗', 'error');
      }
    } catch (error) {
      showToast('新增失敗，請稍後再試', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetNextTime = async (date: string | null) => {
    if (!customer) return;

    setIsUpdatingNextTime(true);

    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextTime: date }),
      });

      if (res.ok) {
        if (date) {
          showToast('下次聯繫時間已設定', 'success');
        } else {
          showToast('已清除下次聯繫時間', 'success');
        }
        onSuccess();
        handleClose();
      } else {
        showToast('更新失敗', 'error');
      }
    } catch (error) {
      showToast('更新失敗，請稍後再試', 'error');
    } finally {
      setIsUpdatingNextTime(false);
    }
  };

  const handleSkip = () => {
    // 跳過設定下次聯繫時間，但仍需刷新數據（因為已新增紀錄）
    onSuccess();
    handleClose();
  };

  const handleClose = () => {
    reset();
    setStep('form');
    setCustomNextTime('');
    onClose();
  };

  if (!customer) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      {step === 'form' ? (
        <div className="space-y-5">
          <div className="text-center">
            <h3 className="text-xl font-black text-gray-900">
              快速新增紀錄
            </h3>
            <p className="text-sm text-gray-600 font-medium mt-1">
              {customer.company}
            </p>
          </div>

          <FormField label="日期" error={errors.logDate}>
            <Input
              type="date"
              value={formData.logDate}
              onChange={(e) => {
                updateField('logDate', e.target.value);
                validateField('logDate', e.target.value);
              }}
              max={new Date().toISOString().split('T')[0]}
              error={!!errors.logDate}
            />
          </FormField>

          <FormField label="聯繫方式" required error={errors.method}>
            <div className="flex gap-2 flex-wrap">
              {contactMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => updateField('method', method.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    formData.method === method.value
                      ? 'bg-brand-blue text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </FormField>

          <FormField
            label="紀錄內容"
            required
            error={errors.notes}
            hint={`${formData.notes.length}/500 字`}
          >
            <TextArea
              value={formData.notes}
              onChange={(e) => {
                updateField('notes', e.target.value);
                validateField('notes', e.target.value);
              }}
              placeholder="記錄與客戶的溝通內容..."
              rows={5}
              maxLength={500}
              error={!!errors.notes}
            />
          </FormField>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 rounded-2xl font-black bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black bg-brand-blue text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="check-circle" size={18} />
              {isSubmitting ? '新增中...' : '新增紀錄'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Icon name="check" size={28} className="text-green-600" />
            </div>
            <h3 className="text-xl font-black text-gray-900">
              紀錄已新增
            </h3>
            <p className="text-sm text-gray-600 font-medium mt-1">
              是否要設定下次聯繫時間？
            </p>
            {customer.nextTime && (
              <p className="text-xs text-gray-400 mt-2">
                目前設定：{new Date(customer.nextTime).toLocaleDateString('zh-TW')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-black text-gray-500 uppercase px-1">快速選擇</p>
            <div className="grid grid-cols-3 gap-2">
              {quickDateOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleSetNextTime(getQuickDate(option.days))}
                  disabled={isUpdatingNextTime}
                  className="px-3 py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-brand-blue hover:text-white transition-colors disabled:opacity-50"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-black text-gray-500 uppercase px-1">自訂日期</p>
            <div className="flex gap-2">
              <Input
                type="date"
                value={customNextTime}
                onChange={(e) => setCustomNextTime(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="flex-1"
              />
              {customNextTime && (
                <button
                  onClick={() => handleSetNextTime(customNextTime)}
                  disabled={isUpdatingNextTime}
                  className="px-4 py-2 rounded-xl font-bold bg-brand-blue text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  確認
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex gap-3">
            <button
              onClick={() => {
                if (customer.nextTime) {
                  // 有設定時間，需要清除
                  handleSetNextTime(null);
                } else {
                  // 本來就沒有，直接跳過
                  handleSkip();
                }
              }}
              disabled={isUpdatingNextTime}
              className="flex-1 px-4 py-3 rounded-2xl font-black bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              不設定
            </button>
            {customer.nextTime && (
              <button
                onClick={handleSkip}
                className="flex-1 px-4 py-3 rounded-2xl font-black bg-brand-yellow/20 text-yellow-700 hover:bg-brand-yellow/30 transition-colors"
              >
                保持原設定
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

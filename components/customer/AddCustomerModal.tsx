'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import FormField, { Input, Select, TextArea } from '../ui/FormField';
import Icon from '../Icon';
import { useFormState } from '@/hooks/useFormState';
import { useFormValidation } from '@/hooks/useFormValidation';
import {
  customerSchema,
  contactSchema,
  developmentLogSchema,
  type CustomerFormData,
  type ContactFormData,
  type DevelopmentLogFormData,
} from '@/lib/validations/customer';
import { useToast } from '../ui/Toast';
import { useCategories } from '@/hooks/useCategories';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const levels = ['L1', 'L2', 'L3', 'L4', 'L5'];
const contactMethods = ['電話', 'LINE', 'Email', '實體', '視訊'];

export default function AddCustomerModal({
  isOpen,
  onClose,
  onSuccess,
}: AddCustomerModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const { items: categoryItems } = useCategories(isOpen);
  const categories = categoryItems.length > 0 ? categoryItems.map((c) => c.name) : ['其他'];

  // Step 1: 基本資料
  const { formData: customerData, updateField: updateCustomer, reset: resetCustomer } =
    useFormState<CustomerFormData>({
    company: '',
    category: '',
    phone: '',
    address: '',
    level: 'L1',
    otherSales: '',
    nextTime: '',
  });
  const { errors: customerErrors, validateField: validateCustomerField, validate: validateCustomer } = useFormValidation(customerSchema);

  // Step 2: 聯絡人
  const { formData: contactData, updateField: updateContact, reset: resetContact } =
    useFormState<ContactFormData>({
    name: '',
    title: '',
  });
  const { errors: contactErrors, validateField: validateContactField, validate: validateContact } = useFormValidation(contactSchema);

  // Step 3: 首筆紀錄（可選）
  const { formData: logData, updateField: updateLog, reset: resetLog } =
    useFormState<DevelopmentLogFormData>({
    logDate: new Date().toISOString().split('T')[0],
    method: '電話',
    notes: '',
  });
  const { errors: logErrors, validateField: validateLogField, validate: validateLog } = useFormValidation(developmentLogSchema);

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateCustomer(customerData)) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateContact(contactData)) {
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const payload: any = {
        ...customerData,
        contacts: [contactData],
      };

      // 如果有填寫首筆紀錄
      if (logData.notes) {
        if (validateLog(logData)) {
          payload.initialLog = logData;
        } else {
          setIsSubmitting(false);
          return;
        }
      }

      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast('客戶新增成功！', 'success');
        handleClose();
        onSuccess();
      } else {
        const error = await res.json();
        showToast(error.error || '新增失敗，請稍後再試', 'error');
      }
    } catch (error) {
      showToast('新增失敗，請稍後再試', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    resetCustomer();
    resetContact();
    resetLog();
    onClose();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all ${
              step === currentStep
                ? 'bg-brand-blue text-white scale-110'
                : step < currentStep
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step < currentStep ? '✓' : step}
          </div>
          {step < 3 && (
            <div
              className={`w-16 h-1 mx-2 rounded-full ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-5">
      <FormField label="公司名稱" required error={customerErrors.company}>
        <Input
          value={customerData.company}
          onChange={(e) => {
            updateCustomer('company', e.target.value);
            validateCustomerField('company', e.target.value);
          }}
          placeholder="請輸入公司名稱"
          error={!!customerErrors.company}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="產業類別" required error={customerErrors.category}>
          <Select
            value={customerData.category}
            onChange={(e) => {
              updateCustomer('category', e.target.value);
              validateCustomerField('category', e.target.value);
            }}
            error={!!customerErrors.category}
          >
            <option value="">請選擇</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="等級" required error={customerErrors.level}>
          <Select
            value={customerData.level}
            onChange={(e) => updateCustomer('level', e.target.value)}
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="地址" required error={customerErrors.address}>
        <Input
          value={customerData.address}
          onChange={(e) => {
            updateCustomer('address', e.target.value);
            validateCustomerField('address', e.target.value);
          }}
          placeholder="請輸入公司地址"
          error={!!customerErrors.address}
        />
      </FormField>

      <FormField label="電話" error={customerErrors.phone}>
        <Input
          value={customerData.phone}
          onChange={(e) => {
            updateCustomer('phone', e.target.value);
            validateCustomerField('phone', e.target.value);
          }}
          placeholder="02-1234-5678"
          error={!!customerErrors.phone}
        />
      </FormField>

      <FormField label="其他業務" hint="負責此客戶的其他業務人員">
        <Input
          value={customerData.otherSales}
          onChange={(e) => updateCustomer('otherSales', e.target.value)}
          placeholder="業務代號或姓名"
        />
      </FormField>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-4">
        <p className="text-sm text-blue-800 font-bold">
          👤 請輸入主要聯絡窗口資訊
        </p>
      </div>

      <FormField label="聯絡人姓名" required error={contactErrors.name}>
        <Input
          value={contactData.name}
          onChange={(e) => {
            updateContact('name', e.target.value);
            validateContactField('name', e.target.value);
          }}
          placeholder="請輸入聯絡人姓名"
          error={!!contactErrors.name}
        />
      </FormField>

      <FormField label="職稱" error={contactErrors.title}>
        <Input
          value={contactData.title}
          onChange={(e) => {
            updateContact('title', e.target.value);
            validateContactField('title', e.target.value);
          }}
          placeholder="例如：總經理、採購主任"
          error={!!contactErrors.title}
        />
      </FormField>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-4">
        <p className="text-sm text-yellow-800 font-bold">
          📝 可選：新增首筆開發紀錄（可稍後再新增）
        </p>
      </div>

      <FormField label="日期" error={logErrors.logDate}>
        <Input
          type="date"
          value={logData.logDate}
          onChange={(e) => {
            updateLog('logDate', e.target.value);
            validateLogField('logDate', e.target.value);
          }}
          max={new Date().toISOString().split('T')[0]}
          error={!!logErrors.logDate}
        />
      </FormField>

      <FormField label="聯繫方式" error={logErrors.method}>
        <div className="flex gap-2 flex-wrap">
          {contactMethods.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => updateLog('method', method)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                logData.method === method
                  ? 'bg-brand-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="紀錄內容" error={logErrors.notes} hint={`${logData.notes.length}/500 字`}>
        <TextArea
          value={logData.notes}
          onChange={(e) => {
            updateLog('notes', e.target.value);
            if (e.target.value) validateLogField('notes', e.target.value);
          }}
          placeholder="記錄與客戶的溝通內容..."
          rows={4}
          maxLength={500}
          error={!!logErrors.notes}
        />
      </FormField>

      <FormField label="設定下次聯繫時間">
        <Input
          type="date"
          value={customerData.nextTime}
          onChange={(e) => updateCustomer('nextTime', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </FormField>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="py-2">
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Title */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-black text-gray-900">
            {currentStep === 1 && '基本資料'}
            {currentStep === 2 && '聯絡人資訊'}
            {currentStep === 3 && '首筆紀錄（可選）'}
          </h3>
          <p className="text-sm text-gray-500 font-medium mt-1">
            步驟 {currentStep} / 3
          </p>
        </div>

        {/* Step Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Icon name="arrow-left" size={18} />
              上一步
            </button>
          )}

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black bg-brand-blue text-white hover:bg-blue-700 transition-colors"
            >
              下一步
              <Icon name="arrow-right" size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black bg-brand-yellow text-white hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                '新增中...'
              ) : (
                <>
                  <Icon name="check-circle" size={18} />
                  完成新增
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

'use client';

interface Customer {
  id: number;
  company: string;
  category: { id: number; name: string };
  level: string;
  address: string;
}

interface BatchCustomerCardProps {
  customer: Customer;
  isSelected: boolean;
  onToggle: () => void;
}

export default function BatchCustomerCard({
  customer,
  isSelected,
  onToggle,
}: BatchCustomerCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`bg-white rounded-[40px] p-6 border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-brand-blue ring-2 ring-brand-blue/20 bg-blue-50/50'
          : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <div
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-brand-blue border-brand-blue'
              : 'border-gray-300 bg-white'
          }`}
        >
          {isSelected && (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* Customer Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-50 text-brand-blue text-[10px] px-2 py-0.5 rounded-full font-bold">
              {customer.category.name}
            </span>
            <span className="text-xs font-black text-gray-500">{customer.level}</span>
          </div>
          <h3 className="text-lg font-black text-gray-900">{customer.company}</h3>
          <p className="text-xs text-gray-600 font-medium mt-1">{customer.address}</p>
        </div>
      </div>
    </div>
  );
}

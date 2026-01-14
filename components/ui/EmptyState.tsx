import Icon from '../Icon';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon = 'search', title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-200">
      <Icon name={icon as any} size={64} className="mx-auto text-gray-200 mb-6" />
      <h3 className="text-2xl font-black text-gray-400 mb-2">{title}</h3>
      {description && <p className="text-gray-500 font-medium mb-6">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 rounded-2xl bg-brand-blue text-white font-black hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <Icon name="plus" size={20} />
          {action.label}
        </button>
      )}
    </div>
  );
}

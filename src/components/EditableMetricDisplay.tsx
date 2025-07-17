import React from 'react';

interface EditableMetricDisplayProps {
  label: string;
  value: number;
  formatAs?: 'currency' | 'number';
  className?: string;
  icon?: React.ReactNode; // Optional icon
  title?: string; // Optional title attribute for tooltips
}

const EditableMetricDisplay: React.FC<EditableMetricDisplayProps> = ({ 
  label, 
  value, 
  formatAs = 'number', 
  className,
  icon,
  title
}) => {
  const formattedValue = formatAs === 'currency'
    ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : value.toLocaleString('pt-BR');

  return (
    <div title={title}>
      <div className="flex items-center justify-between mb-1">
        {label && <div className="text-sm text-gray-500">{label}</div>}
        {icon && <div className="text-gray-400">{icon}</div>} 
      </div>
      <div className={className || "text-2xl font-semibold"}>{formattedValue}</div>
    </div>
  );
};

export default EditableMetricDisplay;


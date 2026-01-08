// components/upload/EditingSoftwareSelect.tsx
'use client';

const EDITING_SOFTWARE_OPTIONS = [
  'Adobe After Effects',
  'Adobe Premiere Pro',
  'Final Cut Pro',
  'DaVinci Resolve',
  'CapCut',
  'Alight Motion',
  'Filmora',
  'Vegas Pro',
  'Other'
];

interface EditingSoftwareSelectProps {
  value: string;
  onChange: (software: string) => void;
  customValue: string;
  onCustomChange: (custom: string) => void;
  disabled?: boolean;
}

export function EditingSoftwareSelect({
  value,
  onChange,
  customValue,
  onCustomChange,
  disabled
}: EditingSoftwareSelectProps) {
  return (
    <>
      <div>
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Editing Software
        </label>
        <select
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value !== 'Other') {
              onCustomChange('');
            }
          }}
          disabled={disabled}
          className="w-full px-3 py-2 border rounded text-sm transition-colors"
          style={{
            backgroundColor: 'var(--color-surface-primary)',
            borderColor: 'var(--color-border-default)',
            color: 'var(--color-text-primary)',
            opacity: disabled ? '0.5' : '1'
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = 'none';
            e.currentTarget.style.borderColor = 'var(--color-focus-ring)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-default)';
          }}
        >
          <option value="">Select editing software</option>
          {EDITING_SOFTWARE_OPTIONS.map((software) => (
            <option key={software} value={software}>
              {software}
            </option>
          ))}
        </select>
      </div>

      {value === 'Other' && (
        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Specify Software
          </label>
          <input
            type="text"
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            disabled={disabled}
            placeholder="Enter software name..."
            className="w-full px-3 py-2 border rounded text-sm transition-colors"
            style={{
              backgroundColor: 'var(--color-surface-primary)',
              borderColor: 'var(--color-border-default)',
              color: 'var(--color-text-primary)',
              opacity: disabled ? '0.5' : '1'
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = 'none';
              e.currentTarget.style.borderColor = 'var(--color-focus-ring)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-default)';
            }}
          />
        </div>
      )}
    </>
  );
}
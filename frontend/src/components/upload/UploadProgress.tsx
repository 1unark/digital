// components/upload/UploadProgress.tsx
interface UploadProgressProps {
  progress: number;
  fileName: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export function UploadProgress({ progress, fileName, status, error }: UploadProgressProps) {
  return (
    <div 
      className="w-full max-w-md mx-auto p-3 rounded-lg border"
      style={{
        backgroundColor: 'var(--color-surface-primary)',
        borderColor: 'var(--color-border-muted)'
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span 
          className="text-sm font-medium truncate flex-1 mr-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {fileName}
        </span>
        <span 
          className="text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {progress}%
        </span>
      </div>
      
      <div 
        className="w-full rounded h-1.5 mb-2"
        style={{ backgroundColor: 'var(--color-surface-secondary)' }}
      >
        <div
          className="h-1.5 rounded transition-all duration-300"
          style={{ 
            width: `${progress}%`,
            backgroundColor: 
              status === 'error' ? 'var(--color-danger-text)' :
              status === 'complete' ? 'var(--color-action-primary)' :
              'var(--color-action-primary)'
          }}
        />
      </div>

      <div 
        className="text-xs"
        style={{ 
          color: status === 'error' ? 'var(--color-danger-text)' : 'var(--color-text-muted)'
        }}
      >
        {status === 'uploading' && 'Uploading...'}
        {status === 'processing' && 'Processing video...'}
        {status === 'complete' && 'Upload complete!'}
        {status === 'error' && (error || 'Upload failed')}
      </div>
    </div>
  );
}
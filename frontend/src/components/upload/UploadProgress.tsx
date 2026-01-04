// components/upload/UploadProgress.tsx
interface UploadProgressProps {
  progress: number;
  fileName: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export function UploadProgress({ progress, fileName, status, error }: UploadProgressProps) {
  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-4">
          {fileName}
        </span>
        <span className="text-sm font-semibold text-gray-900">
          {progress}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            status === 'error' ? 'bg-red-500' :
            status === 'complete' ? 'bg-green-500' :
            'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-xs text-gray-600">
        {status === 'uploading' && 'Uploading...'}
        {status === 'processing' && 'Processing video...'}
        {status === 'complete' && 'Upload complete!'}
        {status === 'error' && (
          <span className="text-red-600">{error || 'Upload failed'}</span>
        )}
      </div>
    </div>
  );
}
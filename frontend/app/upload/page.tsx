import { VideoUploader } from '@/components/upload/VideoUploader';

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Upload Video</h1>
      <VideoUploader />
    </div>
  );
}
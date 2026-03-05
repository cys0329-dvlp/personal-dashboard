import { useState, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

interface RecordingUploadModalProps {
  lectureId: string;
  onSave: (data: { title: string; audioData: string; duration: number }) => Promise<void>;
  onClose: () => void;
}

export default function RecordingUploadModal({ lectureId, onSave, onClose }: RecordingUploadModalProps) {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/mp4'];
    if (!validTypes.includes(file.type)) {
      setError('MP3, WAV, WebM, OGG, MP4 형식의 파일만 지원합니다.');
      return;
    }

    // 파일 크기 검증 (50MB 제한)
    if (file.size > 50 * 1024 * 1024) {
      setError('파일 크기는 50MB 이하여야 합니다.');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedFile) return;

    setIsLoading(true);
    try {
      // 파일을 Base64로 변환
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          let audioData = '';
          for (let i = 0; i < uint8Array.length; i++) {
            audioData += String.fromCharCode(uint8Array[i]);
          }
          const base64Data = btoa(audioData);

          // 오디오 길이 추정 (바이트 크기로부터)
          const duration = Math.round(arrayBuffer.byteLength / (selectedFile.type === 'audio/mpeg' ? 16000 : 24000));

          await onSave({
            title: title.trim(),
            audioData: base64Data,
            duration
          });

          setTitle('');
          setSelectedFile(null);
          onClose();
        } catch (err) {
          setError('파일 처리 중 오류가 발생했습니다.');
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } catch (err) {
      setError('파일 업로드 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="warm-card w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'oklch(0.22 0.04 50)' }}>
            녹음 파일 업로드
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 3월 5일 강의"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">파일 선택 *</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-input rounded-lg p-4 text-center cursor-pointer hover:bg-secondary transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {selectedFile ? (
                <div className="text-sm">
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={24} className="text-muted-foreground" />
                  <p className="text-sm font-medium">파일을 클릭하여 선택</p>
                  <p className="text-xs text-muted-foreground">MP3, WAV, WebM, OGG, MP4 (최대 50MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !selectedFile || isLoading}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Upload size={14} />
              {isLoading ? '업로드 중...' : '업로드'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

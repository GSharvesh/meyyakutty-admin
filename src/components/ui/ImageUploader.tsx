'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, ArrowLeft, ArrowRight, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages: number;
  minImages?: number;
  label?: string;
  helperText?: string;
}

interface UploadingFile {
  id: string;
  name: string;
  originalSize: string;
  optimizedSize?: string;
  savings?: number;
  progress: number;
  status: 'processing' | 'converting' | 'saving' | 'complete' | 'error';
  error?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxImages,
  minImages = 1,
  label = 'Images',
  helperText
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceIndexRef = useRef<number | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const optimizeAndConvertImage = (
    file: File,
    onProgress: (progress: number, status: UploadingFile['status']) => void
  ): Promise<{ dataUrl: string; uniqueName: string; optimizedSizeStr: string; savingsPercent: number }> => {
    return new Promise((resolve, reject) => {
      // 1. Generate unique filename: prefix_timestamp_random.webp
      const timestamp = Date.now();
      const random = Math.floor(1000 + Math.random() * 9000);
      const cleanName = file.name
        .substring(0, file.name.lastIndexOf('.'))
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
      const uniqueName = `${cleanName}_${timestamp}_${random}.webp`;

      onProgress(15, 'processing');

      const reader = new FileReader();
      reader.onload = (e) => {
        onProgress(35, 'converting');
        const img = new Image();
        img.onload = () => {
          onProgress(55, 'converting');
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension limit for performance and storage
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            } else {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context failed'));
            return;
          }

          // Drawing strips EXIF metadata
          ctx.drawImage(img, 0, 0, width, height);
          
          onProgress(75, 'saving');

          // Compress to WebP
          const quality = 0.82;
          const dataUrl = canvas.toDataURL('image/webp', quality);
          
          onProgress(95, 'saving');

          // Calculate size difference
          const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
          const optimizedSizeBytes = Math.ceil(base64Length * 0.75);
          const savings = Math.max(0, Math.round(((file.size - optimizedSizeBytes) / file.size) * 100));

          const formattedSize =
            optimizedSizeBytes > 1024 * 1024
              ? `${(optimizedSizeBytes / (1024 * 1024)).toFixed(2)} MB`
              : `${(optimizedSizeBytes / 1024).toFixed(0)} KB`;

          setTimeout(() => {
            onProgress(100, 'complete');
            resolve({
              dataUrl,
              uniqueName,
              optimizedSizeStr: formattedSize,
              savingsPercent: savings
            });
          }, 200);
        };
        img.onerror = () => reject(new Error('Failed to parse image file'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList) => {
    setErrorMessage(null);
    const filesArray = Array.from(files);
    
    // Check validation of files
    const invalidFiles = filesArray.filter(
      (file) => !['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setErrorMessage('Invalid file format. Only JPG, JPEG, PNG, and WEBP are supported.');
      return;
    }

    const currentCount = images.length;
    const incomingCount = filesArray.length;

    if (currentCount + incomingCount > maxImages) {
      setErrorMessage(`Upload limit exceeded. You can only upload up to ${maxImages} image(s) for this module.`);
      return;
    }

    // Process files
    const newUploadingFiles = filesArray.map((file) => {
      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
          : `${(file.size / 1024).toFixed(0)} KB`;

      return {
        id: Math.random().toString(36).substring(2),
        name: file.name,
        originalSize: formattedSize,
        progress: 0,
        status: 'processing' as const
      };
    });

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

    // Optimize and add images sequentially/parallelly
    const optimizedResults: string[] = [];

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const trackingRecord = newUploadingFiles[i];

      try {
        const result = await optimizeAndConvertImage(file, (progress, status) => {
          setUploadingFiles((prev) =>
            prev.map((rec) =>
              rec.id === trackingRecord.id
                ? { ...rec, progress, status }
                : rec
            )
          );
        });

        setUploadingFiles((prev) =>
          prev.map((rec) =>
            rec.id === trackingRecord.id
              ? {
                  ...rec,
                  optimizedSize: result.optimizedSizeStr,
                  savings: result.savingsPercent
                }
              : rec
          )
        );

        optimizedResults.push(result.dataUrl);
      } catch (err: any) {
        setUploadingFiles((prev) =>
          prev.map((rec) =>
            rec.id === trackingRecord.id
              ? { ...rec, status: 'error', error: err.message || 'Optimization failed' }
              : rec
          )
        );
      }
    }

    if (optimizedResults.length > 0) {
      onChange([...images, ...optimizedResults]);
    }

    // Clear completed upload logs from tracking pane after 3 seconds
    setTimeout(() => {
      setUploadingFiles((prev) => prev.filter((rec) => rec.status !== 'complete'));
    }, 3000);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    onChange(updated);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const triggerReplace = (index: number) => {
    replaceIndexRef.current = index;
    replaceInputRef.current?.click();
  };

  const handleReplaceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const idx = replaceIndexRef.current;
    
    if (file && idx !== null) {
      if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
        setErrorMessage('Invalid file format. Only JPG, JPEG, PNG, and WEBP are supported.');
        return;
      }

      const trackingId = Math.random().toString(36).substring(2);
      const originalSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
          : `${(file.size / 1024).toFixed(0)} KB`;

      setUploadingFiles([{ id: trackingId, name: file.name, originalSize, progress: 0, status: 'processing' }]);

      try {
        const result = await optimizeAndConvertImage(file, (progress, status) => {
          setUploadingFiles((prev) =>
            prev.map((rec) =>
              rec.id === trackingId ? { ...rec, progress, status } : rec
            )
          );
        });

        const updated = [...images];
        updated[idx] = result.dataUrl;
        onChange(updated);

        setUploadingFiles((prev) =>
          prev.map((rec) =>
            rec.id === trackingId
              ? {
                  ...rec,
                  optimizedSize: result.optimizedSizeStr,
                  savings: result.savingsPercent
                }
              : rec
          )
        );
      } catch (err: any) {
        setUploadingFiles((prev) =>
          prev.map((rec) =>
            rec.id === trackingId ? { ...rec, status: 'error', error: err.message } : rec
          )
        );
      }

      setTimeout(() => {
        setUploadingFiles([]);
      }, 3000);
    }
    e.target.value = '';
    replaceIndexRef.current = null;
  };

  return (
    <div className="space-y-4 text-left select-none">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          {label} {minImages > 0 && <span className="text-primary">*</span>}
        </label>
        <span className="text-[10px] text-slate-400 font-semibold">
          {images.length} / {maxImages} uploaded
        </span>
      </div>

      {/* Main Drag & Drop Zone */}
      {images.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden ${
            dragActive
              ? 'border-primary bg-red-50/20'
              : 'border-slate-200 hover:border-primary/50 hover:bg-slate-55/10'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            multiple={maxImages - images.length > 1}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
          />
          <input
            type="file"
            ref={replaceInputRef}
            onChange={handleReplaceFileChange}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
          />

          <div className="flex flex-col items-center gap-1.5 text-slate-400">
            <Upload className="w-8 h-8 text-slate-350" />
            <p className="text-xs font-extrabold text-slate-700">
              Drag & drop image(s) here, or <span className="text-primary hover:underline">browse</span>
            </p>
            <p className="text-[10px] text-slate-400 font-semibold">
              Supports JPG, JPEG, PNG, WEBP (Max {maxImages} image{maxImages > 1 ? 's' : ''})
            </p>
          </div>
        </div>
      )}

      {/* Error Message Panel */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-red-50 border border-red-150 rounded-2xl flex items-start gap-2 text-xs text-red-750 font-semibold"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Processing / Optimization Progress Overlay */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2 bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">
            Auto-Optimization Queue
          </span>
          <div className="space-y-3">
            {uploadingFiles.map((file) => (
              <div key={file.id} className="text-xs space-y-1.5 text-left">
                <div className="flex justify-between items-center font-bold text-slate-700">
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span className="text-[10px] uppercase text-primary tracking-wider">
                    {file.status === 'processing' && 'Analyzing Metadata...'}
                    {file.status === 'converting' && 'Converting WebP...'}
                    {file.status === 'saving' && 'Compressing...'}
                    {file.status === 'complete' && 'Complete'}
                    {file.status === 'error' && 'Error'}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      file.status === 'error' ? 'bg-red-500' : 'bg-primary'
                    }`}
                    style={{ width: `${file.progress}%` }}
                  />
                </div>

                {/* Optimizations statistics */}
                {file.status === 'complete' && file.optimizedSize && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>
                      {file.originalSize} &rarr; {file.optimizedSize} ({file.savings}% saved & metadata removed)
                    </span>
                  </div>
                )}
                {file.status === 'error' && (
                  <span className="text-[10px] text-red-500 font-bold block">
                    {file.error || 'Optimization failed'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Previews grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-2xl border border-slate-200 overflow-hidden group bg-slate-50 flex flex-col justify-end shadow-sm"
            >
              <img src={img} className="w-full h-full object-cover absolute inset-0" alt="Uploaded asset preview" />

              {/* Cover badge label */}
              {idx === 0 && maxImages > 1 && (
                <span className="absolute top-2 left-2 px-2 py-0.5 text-[8px] font-extrabold rounded bg-primary text-white tracking-wider shadow-sm uppercase z-10">
                  Cover
                </span>
              )}

              {/* Order index badge (for multi-image reordering visualization) */}
              {maxImages > 1 && (
                <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 text-[9px] font-extrabold rounded-full bg-black/60 text-white z-10 select-none">
                  {idx + 1}
                </span>
              )}

              {/* Control button overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2.5 transition-all duration-200 z-20">
                {/* Reordering Controls (for multi-image) */}
                {maxImages > 1 && (
                  <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveImage(idx, 'left')}
                      className={`p-1 rounded-lg text-white hover:bg-white/20 transition ${idx === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                      title="Move Left"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => setAsCover(idx)}
                        className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-primary text-white hover:bg-primary-hover uppercase tracking-wider"
                      >
                        Cover
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => moveImage(idx, 'right')}
                      className={`p-1 rounded-lg text-white hover:bg-white/20 transition ${idx === images.length - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                      title="Move Right"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => triggerReplace(idx)}
                    className="px-2.5 py-1 rounded-xl bg-white text-slate-800 text-[10px] font-bold hover:bg-slate-100 shadow-sm cursor-pointer"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="px-2.5 py-1 rounded-xl bg-red-650 text-white text-[10px] font-bold hover:bg-red-700 shadow-sm cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {helperText && !errorMessage && (
        <span className="block text-[10px] text-slate-400 font-semibold italic mt-1">
          {helperText}
        </span>
      )}
    </div>
  );
};
export default ImageUploader;

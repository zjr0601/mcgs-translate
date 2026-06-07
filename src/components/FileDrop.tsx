'use client';

import { useCallback, useRef, useState, type DragEvent } from 'react';
import { Card } from '@/components/ui/card';

interface FileDropProps {
  onFile: (content: string, fileName: string) => void;
  accept?: string;
  label: string;
  variant?: 'primary' | 'secondary';
}

export function FileDrop({
  onFile,
  accept = '.xml',
  label,
  variant = 'primary',
}: FileDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        onFile(content, file.name);
      };
      reader.readAsText(file, 'utf-8');
    },
    [onFile]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const isPrimary = variant === 'primary';
  const borderColor = isDragging
    ? 'border-blue-500 bg-blue-50'
    : isPrimary
      ? 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      : 'border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50';

  return (
    <Card
      className={`
        border-2 ${borderColor} rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <div className="text-gray-500">
        <svg
          className="mx-auto h-10 w-10 mb-3 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className={isPrimary ? 'text-base' : 'text-sm'}>{label}</p>
      </div>
    </Card>
  );
}

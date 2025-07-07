'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface MultipleImageUploadProps {
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
  existingImages?: string[];
  onRemoveExisting?: (index: number) => void;
}

export default function MultipleImageUpload({ 
  onImagesChange, 
  maxImages = 6,
  existingImages = [],
  onRemoveExisting
}: MultipleImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      addImages(imageFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addImages(files);
    }
    // Reset input
    e.target.value = '';
  };

  const addImages = (files: File[]) => {
    const totalImages = images.length + existingImages.length;
    const remainingSlots = maxImages - totalImages;
    const filesToAdd = files.slice(0, remainingSlots);

    // Validate file sizes
    const validFiles = filesToAdd.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} é muito grande. Máximo 5MB por imagem.`);
        return false;
      }
      return true;
    });

    const newImages: ImageFile[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7)
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onImagesChange(updatedImages.map(img => img.file));
  };

  const removeImage = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id);
    // Clean up object URLs
    const removedImage = images.find(img => img.id === id);
    if (removedImage) {
      URL.revokeObjectURL(removedImage.preview);
    }
    setImages(updatedImages);
    onImagesChange(updatedImages.map(img => img.file));
  };

  const totalImages = images.length + existingImages.length;
  const canAddMore = totalImages < maxImages;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
            isDragging
              ? 'border-rose-500 bg-rose-50'
              : 'border-gray-300 hover:border-rose-400 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-3">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-rose-600 hover:text-rose-700 font-medium"
              >
                Clique para adicionar imagens
              </button>
              <p className="text-gray-500 mt-1">ou arraste e solte aqui</p>
              <p className="text-gray-400 text-sm">
                {totalImages}/{maxImages} imagens • Máximo 5MB cada
              </p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Images Grid */}
      {(images.length > 0 || existingImages.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Existing Images */}
          {existingImages.map((imageUrl, index) => (
            <div key={`existing-${index}`} className="relative group">
              <Image
                src={imageUrl}
                alt={`Imagem ${index + 1}`}
                width={200}
                height={128}
                className="w-full h-32 object-cover rounded-lg shadow-sm"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                {onRemoveExisting && (
                  <button
                    type="button"
                    onClick={() => onRemoveExisting(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-rose-600 text-white text-xs px-2 py-1 rounded">
                  Principal
                </div>
              )}
            </div>
          ))}

          {/* New Images */}
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <Image
                src={image.preview}
                alt={`Nova imagem ${index + 1}`}
                width={200}
                height={128}
                className="w-full h-32 object-cover rounded-lg shadow-sm"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {existingImages.length === 0 && index === 0 && (
                <div className="absolute top-2 left-2 bg-rose-600 text-white text-xs px-2 py-1 rounded">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      {totalImages === 0 && (
        <p className="text-gray-500 text-sm text-center">
          Adicione pelo menos 1 imagem. A primeira será a imagem principal.
        </p>
      )}
      
      {totalImages >= maxImages && (
        <p className="text-amber-600 text-sm text-center">
          Você atingiu o limite máximo de {maxImages} imagens.
        </p>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';

const ImageGallery = ({ images = [], initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset zoom when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen();
          } else {
            onClose();
          }
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, isFullscreen]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  const downloadImage = async () => {
    try {
      const response = await fetch(images[currentIndex]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors"
            title="Uzaklaştır (-)"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 4}
            className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors"
            title="Yakınlaştır (+)"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Tam Ekran"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button
            onClick={downloadImage}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="İndir"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-2"
            title="Kapat (ESC)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Area */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          title="Önceki (←)"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Image */}
        <img
          src={images[currentIndex]}
          alt={`Resim ${currentIndex + 1}`}
          className="max-h-full max-w-full object-contain select-none"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
          draggable={false}
        />

        {/* Next Button */}
        <button
          onClick={goToNext}
          className="absolute right-4 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          title="Sonraki (→)"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="p-4 bg-black/50">
        <div className="flex gap-2 overflow-x-auto justify-center max-w-full mx-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-red-500 ring-2 ring-red-500/50'
                  : 'border-transparent hover:border-white/50'
              }`}
            >
              <img
                src={image}
                alt={`Küçük resim ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;

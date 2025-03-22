import React from 'react';

interface ImageOverlayProps {
  image: string | null;
  opacity: number;
  onImageUpload: (dataUrl: string) => void;
  onOpacityChange: (opacity: number) => void;
}

const ImageOverlay: React.FC<ImageOverlayProps> = ({ image, opacity, onImageUpload, onOpacityChange }) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onImageUpload(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="border rounded p-2"
        />
        
        {image && (
          <div className="flex items-center gap-2">
            <label>Opacity:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-32"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageOverlay;

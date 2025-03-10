import React from 'react';

const ImageOverlay = ({ image, opacity, onImageUpload, onOpacityChange }) => {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => onImageUpload(e.target.result);
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
              onChange={(e) => onOpacityChange(e.target.value)}
              className="w-32"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageOverlay;

import { useRef, useEffect } from 'react';

export const useImageLoader = ({ overlayImage, centerImage }) => {
  const imageRef = useRef(null);

  useEffect(() => {
    if (overlayImage) {
      const img = new Image();
      img.src = overlayImage;
      img.onload = () => {
        centerImage(img);
        imageRef.current = img;
      };
    } else {
      imageRef.current = null;
    }
  }, [overlayImage, centerImage]);

  return imageRef;
}; 
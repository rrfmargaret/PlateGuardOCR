import { useState, useCallback } from "react";
import { ocrService, type OCRResult } from "@/lib/ocr";

export function useOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeOCR = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      setError(null);
      await ocrService.initialize();
      setIsInitialized(true);
    } catch (err) {
      setError('Failed to initialize OCR engine');
    }
  }, [isInitialized]);

  const processImage = useCallback(async (imageData: string): Promise<OCRResult | null> => {
    if (!isInitialized) {
      await initializeOCR();
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await ocrService.processImage(imageData);
      
      if (!result.text || result.text.length < 3) {
        setError('No license plate detected. Please ensure the plate is clearly visible and well-lit.');
        return null;
      }

      if (result.confidence < 70) {
        setError('Low confidence detection. Please try again with better lighting or positioning.');
        return null;
      }

      return result;
    } catch (err) {
      setError('Failed to process image. Please try again.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isInitialized, initializeOCR]);

  return {
    isProcessing,
    isInitialized,
    error,
    initializeOCR,
    processImage,
  };
}

import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

export class OCRService {
  private worker: Tesseract.Worker | null = null;

  async initialize(): Promise<void> {
    if (this.worker) return;
    
    this.worker = await Tesseract.createWorker('eng');
    await this.worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
    });
  }

  async processImage(imageData: string | File): Promise<OCRResult> {
    if (!this.worker) {
      await this.initialize();
    }

    const result = await this.worker!.recognize(imageData);
    
    // Filter and process results for license plates
    const filteredWords = result.data.words
      .filter(word => word.confidence > 60)
      .filter(word => this.isLikelyPlateNumber(word.text))
      .sort((a, b) => b.confidence - a.confidence);

    const bestText = filteredWords.length > 0 
      ? filteredWords[0].text.replace(/[^A-Z0-9]/g, '')
      : result.data.text.replace(/[^A-Z0-9]/g, '');

    const confidence = filteredWords.length > 0 
      ? filteredWords[0].confidence 
      : result.data.confidence;

    return {
      text: bestText,
      confidence: Math.round(confidence),
      words: filteredWords.map(word => ({
        text: word.text,
        confidence: Math.round(word.confidence),
        bbox: word.bbox
      }))
    };
  }

  private isLikelyPlateNumber(text: string): boolean {
    const cleaned = text.replace(/[^A-Z0-9]/g, '');
    
    // Basic license plate patterns
    const patterns = [
      /^[A-Z]{1,3}[0-9]{1,4}$/, // ABC123
      /^[0-9]{1,3}[A-Z]{1,3}$/, // 123ABC
      /^[A-Z]{2}[0-9]{2}[A-Z]{2}$/, // AB12CD
      /^[A-Z0-9]{5,8}$/, // General alphanumeric
    ];

    return patterns.some(pattern => pattern.test(cleaned)) && cleaned.length >= 3;
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();

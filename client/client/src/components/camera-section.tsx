import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCamera } from "@/hooks/use-camera";
import { useOCR } from "@/hooks/use-ocr";
import { Camera, RotateCw, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraSectionProps {
  onResult: (result: { plateNumber: string; confidence: number; imageData: string }) => void;
}

export default function CameraSection({ onResult }: CameraSectionProps) {
  const [detectionStatus, setDetectionStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [flashEnabled, setFlashEnabled] = useState(false);
  
  const {
    videoRef,
    isActive,
    error: cameraError,
    devices,
    startCamera,
    stopCamera,
    switchCamera,
    captureImage,
  } = useCamera();

  const {
    isProcessing,
    error: ocrError,
    initializeOCR,
    processImage,
  } = useOCR();

  useEffect(() => {
    initializeOCR();
  }, [initializeOCR]);

  const handleStartCamera = async () => {
    setDetectionStatus('idle');
    await startCamera();
  };

  const handleCaptureAndScan = async () => {
    const imageData = captureImage();
    if (!imageData) return;

    setDetectionStatus('detecting');
    
    const result = await processImage(imageData);
    
    if (result) {
      setDetectionStatus('success');
      onResult({
        plateNumber: result.text,
        confidence: result.confidence,
        imageData
      });
      
      // Reset status after showing success
      setTimeout(() => setDetectionStatus('idle'), 2000);
    } else {
      setDetectionStatus('error');
      setTimeout(() => setDetectionStatus('idle'), 3000);
    }
  };

  const getStatusDisplay = () => {
    switch (detectionStatus) {
      case 'detecting':
        return { color: 'bg-warning', text: 'Detecting...' };
      case 'success':
        return { color: 'bg-secondary', text: 'Success!' };
      case 'error':
        return { color: 'bg-error', text: 'Error' };
      default:
        return { color: 'bg-warning', text: isActive ? 'Ready' : 'Camera Off' };
    }
  };

  const statusDisplay = getStatusDisplay();
  const currentError = cameraError || ocrError;

  return (
    <section className="mb-6">
      <Card className="bg-surface rounded-2xl shadow-lg overflow-hidden">
        {/* Camera Preview Area */}
        <div className="relative bg-gray-900 aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />
          
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center text-white">
                <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Camera not active</p>
              </div>
            </div>
          )}

          {/* Overlay for plate detection frame */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-primary-light border-dashed rounded-lg w-4/5 h-3/5 flex items-center justify-center">
              <span className="text-primary-light text-sm font-medium bg-black/50 px-3 py-1 rounded">
                Position license plate here
              </span>
            </div>
          </div>

          {/* Detection Status Indicator */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center space-x-2 bg-black/70 rounded-full px-3 py-2">
              <div className={cn("w-2 h-2 rounded-full", statusDisplay.color)} />
              <span className="text-white text-sm">{statusDisplay.text}</span>
            </div>
          </div>

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="animate-spin w-8 h-8 mx-auto mb-3" />
                <p className="text-sm">Processing image...</p>
              </div>
            </div>
          )}
        </div>

        {/* Camera Controls */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFlashEnabled(!flashEnabled)}
              className="flex items-center space-x-2 text-text-secondary hover:text-text-primary"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Flash</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={switchCamera}
              disabled={devices.length <= 1}
              className="flex items-center space-x-2 text-text-secondary hover:text-text-primary"
            >
              <RotateCw className="w-4 h-4" />
              <span className="text-sm">Switch</span>
            </Button>
          </div>

          {/* Error Display */}
          {currentError && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error">{currentError}</p>
            </div>
          )}

          {/* Capture Button */}
          {!isActive ? (
            <Button
              onClick={handleStartCamera}
              className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-medium text-lg shadow-lg"
            >
              <Camera className="w-5 h-5 mr-3" />
              Start Camera
            </Button>
          ) : (
            <Button
              onClick={handleCaptureAndScan}
              disabled={isProcessing || detectionStatus === 'detecting'}
              className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-medium text-lg shadow-lg"
            >
              <Camera className="w-5 h-5 mr-3" />
              Capture & Scan
            </Button>
          )}
        </div>
      </Card>
    </section>
  );
}

import { useState, useRef, useCallback, useEffect } from "react";

export function useCamera() {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      if (videoDevices.length > 0 && !currentDeviceId) {
        // Prefer back camera on mobile
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear')
        );
        setCurrentDeviceId(backCamera?.deviceId || videoDevices[0].deviceId);
      }
    } catch (err) {
      setError('Failed to enumerate camera devices');
    }
  }, [currentDeviceId]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: currentDeviceId ? { exact: currentDeviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: currentDeviceId ? undefined : { ideal: 'environment' }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
      }
    } catch (err) {
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      setIsActive(false);
    }
  }, [currentDeviceId]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const switchCamera = useCallback(() => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(device => device.deviceId === currentDeviceId);
      const nextIndex = (currentIndex + 1) % devices.length;
      setCurrentDeviceId(devices[nextIndex].deviceId);
    }
  }, [devices, currentDeviceId]);

  const captureImage = useCallback((): string | null => {
    if (!videoRef.current || !isActive) return null;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [isActive]);

  useEffect(() => {
    getDevices();
  }, [getDevices]);

  useEffect(() => {
    if (currentDeviceId && isActive) {
      stopCamera();
      startCamera();
    }
  }, [currentDeviceId, startCamera, stopCamera, isActive]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isActive,
    error,
    devices,
    currentDeviceId,
    startCamera,
    stopCamera,
    switchCamera,
    captureImage,
  };
}

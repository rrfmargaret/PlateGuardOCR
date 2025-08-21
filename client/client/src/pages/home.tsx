import { useState } from "react";
import { Shield, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PlateRecord, InsertPlateRecord } from "@shared/schema";
import CameraSection from "@/components/camera-section";
import ResultsSection from "@/components/results-section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DetectionResult {
  plateNumber: string;
  confidence: number;
  timestamp: Date;
  imageData?: string;
}

interface Stats {
  total: number;
  today: number;
  successRate: number;
}

export default function Home() {
  const [currentResult, setCurrentResult] = useState<DetectionResult | null>(null);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recent records
  const { data: recentRecords = [] } = useQuery<PlateRecord[]>({
    queryKey: ['/api/records/recent'],
    staleTime: 30000,
  });

  // Fetch stats
  const { data: stats = { total: 0, today: 0, successRate: 0 } } = useQuery<Stats>({
    queryKey: ['/api/stats'],
    refetchInterval: 60000,
  });

  // Create record mutation
  const createRecordMutation = useMutation({
    mutationFn: async (data: InsertPlateRecord) => {
      const response = await apiRequest('POST', '/api/records', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/records'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Plate record saved successfully!",
      });
      setCurrentResult(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save record. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Export data mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/export');
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plate_records_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Records exported successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export records.",
        variant: "destructive",
      });
    },
  });

  const handleDetectionResult = (result: { plateNumber: string; confidence: number; imageData: string }) => {
    setCurrentResult({
      plateNumber: result.plateNumber,
      confidence: result.confidence,
      timestamp: new Date(),
      imageData: result.imageData
    });
    setDetectionError(null);
  };

  const handleSaveRecord = (result: DetectionResult) => {
    createRecordMutation.mutate({
      plateNumber: result.plateNumber,
      confidence: result.confidence,
      imageData: result.imageData,
      processed: 1,
    });
  };

  const handleRetryCapture = () => {
    setCurrentResult(null);
    setDetectionError(null);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="min-h-screen bg-background-page">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6" />
              <h1 className="text-xl font-medium">PlateGuard OCR</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <span className="text-sm">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-md pb-20">
        {/* Camera Section */}
        <CameraSection onResult={handleDetectionResult} />

        {/* Results Section */}
        <ResultsSection
          result={currentResult}
          error={detectionError}
          onSave={handleSaveRecord}
          onRetry={handleRetryCapture}
        />

        {/* Quick Stats */}
        <section className="mb-6">
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center shadow">
              <div className="text-2xl font-bold text-primary">{stats.today}</div>
              <div className="text-xs text-text-secondary">Today</div>
            </Card>
            <Card className="p-4 text-center shadow">
              <div className="text-2xl font-bold text-secondary">{stats.successRate}%</div>
              <div className="text-xs text-text-secondary">Success</div>
            </Card>
            <Card className="p-4 text-center shadow">
              <div className="text-2xl font-bold text-warning">{stats.total}</div>
              <div className="text-xs text-text-secondary">Total</div>
            </Card>
          </div>
        </section>

        {/* Recent Records */}
        <section className="mb-6">
          <Card className="bg-surface rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium flex items-center space-x-2">
                <span>Recent Records</span>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/records'}
                className="text-primary hover:text-primary-dark"
              >
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {recentRecords.length === 0 ? (
                <div className="text-center py-6 text-text-secondary">
                  <p>No records yet</p>
                </div>
              ) : (
                recentRecords.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <div className="font-mono font-bold text-text-primary">
                        {record.plateNumber}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {formatTimeAgo(record.timestamp)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-secondary font-medium">
                        {Math.round(record.confidence)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </section>

        {/* Action Buttons */}
        <section className="space-y-3">
          <Button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            variant="outline"
            className="w-full py-4 rounded-xl font-medium shadow"
          >
            Export Records
          </Button>
          
          <Button
            onClick={() => window.location.href = '/settings'}
            variant="outline"
            className="w-full py-4 rounded-xl font-medium shadow"
          >
            Settings & Calibration
          </Button>
        </section>
      </main>

      {/* Floating Action Button for Desktop */}
      <Button
        size="lg"
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg transition-all duration-200 hover:scale-110 hidden md:flex z-50"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}

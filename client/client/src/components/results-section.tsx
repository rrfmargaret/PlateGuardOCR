import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle, AlertTriangle, Save, RotateCw } from "lucide-react";

interface DetectionResult {
  plateNumber: string;
  confidence: number;
  timestamp: Date;
  imageData?: string;
}

interface ResultsSectionProps {
  result: DetectionResult | null;
  error: string | null;
  onSave: (result: DetectionResult) => void;
  onRetry: () => void;
}

export default function ResultsSection({ result, error, onSave, onRetry }: ResultsSectionProps) {
  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <section className="mb-6">
      <Card className="bg-surface rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center space-x-2">
            <Search className="w-5 h-5 text-primary" />
            <span>Detection Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!result && !error ? (
            <div className="text-center py-8 text-text-secondary">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Capture an image to detect license plates</p>
            </div>
          ) : null}

          {result && (
            <div className="border border-secondary/20 rounded-lg p-4 mb-3 bg-secondary/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-mono font-bold text-text-primary">
                  {result.plateNumber}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    <span className="text-sm text-secondary font-medium">
                      {result.confidence}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-text-secondary">
                <span>{formatTimestamp(result.timestamp)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSave(result)}
                  className="text-primary hover:text-primary-dark"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="border border-error/20 rounded-lg p-4 mb-3 bg-error/5">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-error" />
                <span className="font-medium text-error">Detection Failed</span>
              </div>
              <p className="text-sm text-text-secondary mb-3">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="text-primary hover:text-primary-dark"
              >
                <RotateCw className="w-4 h-4 mr-1" />
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

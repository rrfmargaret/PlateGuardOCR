import { Shield, Camera, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export default function Settings() {
  const [autoSave, setAutoSave] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState([70]);
  const [cameraResolution, setCameraResolution] = useState('720p');

  return (
    <div className="min-h-screen bg-background-page">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6" />
              <h1 className="text-xl font-medium">Settings</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-white hover:bg-primary-dark"
            >
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl pb-20">
        {/* Detection Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detection Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Auto-save successful detections</Label>
                <p className="text-sm text-text-secondary">
                  Automatically save plates with confidence above threshold
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>

            <div className="space-y-3">
              <Label>Minimum Confidence Threshold: {confidenceThreshold[0]}%</Label>
              <Slider
                value={confidenceThreshold}
                onValueChange={setConfidenceThreshold}
                max={100}
                min={50}
                step={5}
                className="w-full"
              />
              <p className="text-sm text-text-secondary">
                Only show results above this confidence level
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Camera Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Camera Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Camera Resolution</Label>
              <div className="grid grid-cols-3 gap-2">
                {['480p', '720p', '1080p'].map((resolution) => (
                  <Button
                    key={resolution}
                    variant={cameraResolution === resolution ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCameraResolution(resolution)}
                  >
                    {resolution}
                  </Button>
                ))}
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Test Camera Permissions
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Data Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Export All Records (CSV)
            </Button>
            
            <Button variant="outline" className="w-full">
              Import Records
            </Button>

            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  if (confirm('Are you sure you want to delete all records? This cannot be undone.')) {
                    // TODO: Implement clear all records
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Records
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About PlateGuard OCR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-text-secondary">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>OCR Engine:</strong> Tesseract.js</p>
              <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="pt-4 text-xs text-text-secondary">
              <p>
                PlateGuard OCR is designed for security personnel to efficiently 
                record vehicle license plates in parking areas. The application 
                uses advanced optical character recognition to automatically detect 
                and extract plate numbers from camera captures.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

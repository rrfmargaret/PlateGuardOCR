import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Search, Trash2, Download, Calendar, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PlateRecord } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Records() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'timestamp' | 'plateNumber' | 'confidence'>('timestamp');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all records
  const { data: records = [], isLoading } = useQuery<PlateRecord[]>({
    queryKey: ['/api/records'],
  });

  // Delete record mutation
  const deleteRecordMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/records/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/records'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Record deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive",
      });
    },
  });

  // Filter and sort records
  const filteredRecords = records
    .filter(record => 
      record.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(record.timestamp).toLocaleDateString().includes(searchTerm)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'plateNumber':
          return a.plateNumber.localeCompare(b.plateNumber);
        case 'confidence':
          return b.confidence - a.confidence;
        case 'timestamp':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background-page">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6" />
              <h1 className="text-xl font-medium">Records</h1>
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

      <main className="container mx-auto px-4 py-6 max-w-4xl pb-20">
        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <Input
                  placeholder="Search plates or dates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'timestamp' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('timestamp')}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Date
                </Button>
                <Button
                  variant={sortBy === 'plateNumber' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('plateNumber')}
                >
                  Plate
                </Button>
                <Button
                  variant={sortBy === 'confidence' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('confidence')}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Score
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Records ({filteredRecords.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-text-secondary mt-2">Loading records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No records found</p>
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-mono text-lg font-bold text-text-primary">
                            {record.plateNumber}
                          </span>
                          <span className="text-sm bg-secondary/10 text-secondary px-2 py-1 rounded">
                            {Math.round(record.confidence)}%
                          </span>
                          {record.processed === 0 && (
                            <span className="text-sm bg-error/10 text-error px-2 py-1 rounded">
                              Failed
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {formatTimestamp(record.timestamp)}
                        </div>
                        {record.notes && (
                          <div className="text-sm text-text-secondary mt-1">
                            {record.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-error hover:text-error hover:bg-error/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Record</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the record for plate "{record.plateNumber}"? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteRecordMutation.mutate(record.id)}
                                className="bg-error hover:bg-error/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

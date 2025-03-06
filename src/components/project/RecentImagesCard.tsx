
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Loader2, CheckCircle, Plus } from 'lucide-react';

interface UploadedImage {
  url: string;
  path: string;
  size: number;
  name: string;
  createdAt: Date;
  summary?: string;
}

interface RecentImagesCardProps {
  recentImages: UploadedImage[];
  totalImagesCount: number;
  isImagesLoading: boolean;
  formatFileSize: (bytes: number) => string;
  onViewAllImages: () => void;
}

const RecentImagesCard: React.FC<RecentImagesCardProps> = ({
  recentImages,
  totalImagesCount,
  isImagesLoading,
  formatFileSize,
  onViewAllImages,
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <ImageIcon className="h-5 w-5 mr-2 text-primary" />
          Recent Images
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isImagesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recentImages.length === 0 ? (
          <div className="text-center p-6 border border-dashed rounded-md">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No images uploaded yet</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={onViewAllImages}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Images
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentImages.map((image) => (
              <div key={image.path} className="flex gap-3 p-3 hover:bg-accent/50 rounded-md transition-colors">
                <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" title={image.name}>
                    {image.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(image.size)} • {image.createdAt.toLocaleDateString()}
                  </p>
                  {image.summary && (
                    <div className="mt-1 flex items-center text-xs text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span className="truncate">AI Summary available</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {totalImagesCount > 3 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={onViewAllImages}
              >
                View all {totalImagesCount} images
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentImagesCard;

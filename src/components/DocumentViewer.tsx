import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface DocumentViewerProps {
  documentUrl: string;
  documentName: string;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  documentUrl, 
  documentName, 
  onClose 
}) => {
  const { t } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  // Google Docs Viewer URL for .docx files
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(window.location.origin + documentUrl)}&embedded=true`;

  const handleDownload = () => {
    window.open(documentUrl, '_blank');
  };

  const handleOpenExternal = () => {
    window.open(viewerUrl.replace('&embedded=true', ''), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
      {/* Header */}
      <header className="bg-gradient-accent p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-accent-foreground hover:bg-accent-foreground/20 flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-accent-foreground truncate">
              {documentName}
            </h1>
            <p className="text-xs text-accent-foreground/80">
              {t('पैकेज ऑफ प्रैक्टिसेज', 'Package of Practices')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenExternal}
            className="text-accent-foreground hover:bg-accent-foreground/20"
          >
            <ExternalLink className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="text-accent-foreground hover:bg-accent-foreground/20"
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Document Viewer */}
      <div className="flex-1 relative bg-muted">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground">
              {t('दस्तावेज़ लोड हो रहा है...', 'Loading document...')}
            </p>
          </div>
        )}
        <iframe
          src={viewerUrl}
          className="w-full h-full border-0"
          title={documentName}
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* Footer with fallback option */}
      <div className="bg-card border-t border-border p-3 flex items-center justify-center gap-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          {t('दस्तावेज़ नहीं दिख रहा?', "Document not showing?")}
        </p>
        <Button 
          variant="link" 
          size="sm" 
          className="text-xs h-auto p-0"
          onClick={handleDownload}
        >
          {t('डाउनलोड करें', 'Download')}
        </Button>
      </div>
    </div>
  );
};

export default DocumentViewer;

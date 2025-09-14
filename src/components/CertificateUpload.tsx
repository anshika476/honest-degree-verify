import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { verifyCertificate, CertificateVerificationResult } from "@/lib/certificateService";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "checking" | "verifying" | "analyzing" | "verified" | "rejected";
  processingStep?: string;
  verificationResult?: CertificateVerificationResult;
  file?: File;
}

export const CertificateUpload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = async (fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      processingStep: "Uploading file...",
      file
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Process each file through blockchain verification
    for (const fileItem of newFiles) {
      try {
        // Step 1: Uploading
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: "checking", processingStep: "Checking document format..." }
            : f
        ));
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Format checking
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: "verifying", processingStep: "Generating blockchain hash..." }
            : f
        ));
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Step 3: Blockchain verification
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: "analyzing", processingStep: "Verifying against blockchain database..." }
            : f
        ));

        // Actual blockchain verification
        const verificationResult = await verifyCertificate(fileItem.file!);
        
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { 
                ...f, 
                status: verificationResult.isAuthentic ? "verified" : "rejected",
                processingStep: undefined,
                verificationResult
              }
            : f
        ));

        // Show toast notification
        toast({
          title: verificationResult.isAuthentic ? "Certificate Verified" : "Verification Failed",
          description: verificationResult.details,
          variant: verificationResult.isAuthentic ? "default" : "destructive"
        });

      } catch (error) {
        console.error('Verification error:', error);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { 
                ...f, 
                status: "rejected",
                processingStep: undefined,
                verificationResult: {
                  isAuthentic: false,
                  confidence: 0,
                  details: `Verification failed: ${error.message}`
                }
              }
            : f
        ));

        toast({
          title: "Verification Error",
          description: `Failed to verify ${fileItem.name}: ${error.message}`,
          variant: "destructive"
        });
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string, isAuthentic?: boolean) => {
    switch (status) {
      case "uploading":
      case "checking":
      case "verifying":
      case "analyzing":
        return <Clock className="w-4 h-4 text-gov-warning animate-spin" />;
      case "verified":
        return isAuthentic ? 
          <CheckCircle className="w-4 h-4 text-gov-success" /> : 
          <AlertCircle className="w-4 h-4 text-gov-danger" />;
      case "rejected":
        return <AlertCircle className="w-4 h-4 text-gov-danger" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (file: UploadedFile) => {
    switch (file.status) {
      case "uploading":
        return <Badge variant="outline" className="text-gov-blue border-gov-blue">Uploading...</Badge>;
      case "checking":
        return <Badge variant="outline" className="text-gov-warning border-gov-warning">Checking...</Badge>;
      case "verifying":
        return <Badge variant="outline" className="text-gov-warning border-gov-warning">Verifying...</Badge>;
      case "analyzing":
        return <Badge variant="outline" className="text-gov-warning border-gov-warning">Analyzing...</Badge>;
      case "verified":
        return file.verificationResult?.isAuthentic ? 
          <Badge className="bg-gov-success text-white">Verified Authentic</Badge> :
          <Badge variant="destructive">Verification Failed</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Certificate Upload</span>
          </CardTitle>
          <CardDescription>
            Upload certificates for verification. Supported formats: PDF, JPG, PNG, DOCX
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive 
                ? "border-gov-blue bg-gov-blue/5" 
                : "border-border hover:border-gov-blue hover:bg-gov-blue/5"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Drop files here or click to browse</h3>
            <p className="text-muted-foreground mb-4">
              Maximum file size: 20MB. Multiple files can be uploaded at once.
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-gov-blue to-gov-blue-dark hover:from-gov-blue-dark hover:to-gov-blue"
            >
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Certificates</CardTitle>
            <CardDescription>
              Track the verification status of your uploaded certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-gov-blue" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                      {file.processingStep && (
                        <p className="text-sm text-gov-blue mt-1 animate-pulse">
                          {file.processingStep}
                        </p>
                      )}
                      {file.verificationResult && !file.processingStep && (
                        <div className="text-sm mt-1 space-y-1">
                          <p className="text-muted-foreground">
                            Confidence: {file.verificationResult.confidence}% • {file.verificationResult.details}
                          </p>
                          {file.verificationResult.hash && (
                            <p className="text-xs text-muted-foreground font-mono">
                              Hash: {file.verificationResult.hash.substring(0, 16)}...
                            </p>
                          )}
                          {file.verificationResult.certificateInfo && (
                            <div className="text-xs text-muted-foreground">
                              <p>Issuer: {file.verificationResult.certificateInfo.issuer}</p>
                              <p>Holder: {file.verificationResult.certificateInfo.holder}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(file.status, file.verificationResult?.isAuthentic)}
                    {getStatusBadge(file)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="ml-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, Clock, FileText, TrendingUp, Users, Shield, Eye, X, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface DashboardStats {
  totalVerifications: number;
  verifiedCount: number;
  rejectedCount: number;
  pendingCount: number;
  todayVerifications: number;
}

interface VerificationCheck {
  check: string;
  status: "passed" | "failed" | "warning" | "pending";
  details: string;
}

interface VerificationDetails {
  verificationChecks: VerificationCheck[];
  rejectionReasons?: string[];
  issueDate: string;
  graduateName: string;
  degree: string;
}

interface Verification {
  id: string;
  fileName: string;
  status: "verified" | "rejected" | "pending";
  timestamp: string;
  confidence: number | null;
  institution: string;
  details: VerificationDetails;
}

export const Dashboard = () => {
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  
  // Mock data - in real app this would come from API
  const stats: DashboardStats = {
    totalVerifications: 1247,
    verifiedCount: 985,
    rejectedCount: 187,
    pendingCount: 75,
    todayVerifications: 23
  };

  const recentVerifications: Verification[] = [
    {
      id: "CERT-001",
      fileName: "diploma_john_doe.pdf",
      status: "verified",
      timestamp: "2 minutes ago",
      confidence: 94,
      institution: "University of Technology",
      details: {
        verificationChecks: [
          { check: "Institution Verification", status: "passed", details: "Institution found in official database" },
          { check: "Signature Validation", status: "passed", details: "Digital signature verified" },
          { check: "Format Analysis", status: "passed", details: "Document format matches institution standards" },
          { check: "Security Features", status: "passed", details: "Watermarks and security elements verified" }
        ],
        issueDate: "2023-06-15",
        graduateName: "John Doe",
        degree: "Bachelor of Computer Science"
      }
    },
    {
      id: "CERT-002", 
      fileName: "certificate_jane_smith.jpg",
      status: "rejected",
      timestamp: "15 minutes ago",
      confidence: 32,
      institution: "Unknown Institution",
      details: {
        verificationChecks: [
          { check: "Institution Verification", status: "failed", details: "Institution not found in official database" },
          { check: "Signature Validation", status: "failed", details: "Invalid or missing digital signature" },
          { check: "Format Analysis", status: "failed", details: "Document format does not match known templates" },
          { check: "Security Features", status: "failed", details: "Missing required security watermarks" }
        ],
        rejectionReasons: [
          "Institution 'Elite Academy' not found in official accredited institutions database",
          "Document lacks required security features and watermarks",
          "Signature verification failed - no valid digital signature found",
          "Font and formatting inconsistencies detected",
          "Image quality suggests possible tampering"
        ],
        issueDate: "2023-05-20",
        graduateName: "Jane Smith",
        degree: "Bachelor of Arts"
      }
    },
    {
      id: "CERT-003",
      fileName: "degree_mike_johnson.pdf", 
      status: "pending",
      timestamp: "1 hour ago",
      confidence: null,
      institution: "Technical Institute",
      details: {
        verificationChecks: [
          { check: "Institution Verification", status: "pending", details: "Checking institution database..." },
          { check: "Signature Validation", status: "pending", details: "Analyzing digital signatures..." },
          { check: "Format Analysis", status: "pending", details: "Processing document format..." },
          { check: "Security Features", status: "pending", details: "Scanning security elements..." }
        ],
        issueDate: "2023-08-10",
        graduateName: "Mike Johnson",
        degree: "Certificate in Web Development"
      }
    },
    {
      id: "CERT-004",
      fileName: "transcript_sarah_wilson.pdf",
      status: "rejected",
      timestamp: "2 hours ago", 
      confidence: 15,
      institution: "Metropolitan College",
      details: {
        verificationChecks: [
          { check: "Institution Verification", status: "passed", details: "Institution verified in official database" },
          { check: "Signature Validation", status: "failed", details: "Signature appears to be forged" },
          { check: "Format Analysis", status: "failed", details: "Document template does not match official format" },
          { check: "Security Features", status: "failed", details: "Security features appear to be counterfeit" }
        ],
        rejectionReasons: [
          "Digital signature analysis indicates forgery",
          "Document template significantly differs from official Metropolitan College format", 
          "Security watermarks appear to be artificially added",
          "Metadata analysis shows document was created after claimed issue date",
          "Grade point average formatting inconsistent with institutional standards"
        ],
        issueDate: "2023-07-22",
        graduateName: "Sarah Wilson",
        degree: "Bachelor of Business Administration"
      }
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-gov-success text-white">Verified</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-gov-warning border-gov-warning">Pending</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-gov-success" />;
      case "rejected":
        return <AlertCircle className="w-4 h-4 text-gov-danger" />;
      case "pending":
        return <Clock className="w-4 h-4 text-gov-warning" />;
      default:
        return null;
    }
  };

  const getCheckIcon = (status: "passed" | "failed" | "warning" | "pending") => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-gov-success" />;
      case "failed":
        return <X className="w-4 h-4 text-gov-danger" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-gov-warning" />;
      case "pending":
        return <Clock className="w-4 h-4 text-gov-warning" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVerifications.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.todayVerifications} today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Authentic</CardTitle>
            <CheckCircle className="h-4 w-4 text-gov-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gov-success">{stats.verifiedCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.verifiedCount / stats.totalVerifications) * 100)}% success rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <AlertCircle className="h-4 w-4 text-gov-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gov-danger">{stats.rejectedCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.rejectedCount / stats.totalVerifications) * 100)}% rejection rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-gov-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gov-warning">{stats.pendingCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Verifications</CardTitle>
          <CardDescription>
            Latest certificate verification activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentVerifications.map((verification) => (
              <div key={verification.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(verification.status)}
                  <div className="flex-1">
                    <p className="font-medium">{verification.fileName}</p>
                    <p className="text-sm text-muted-foreground">{verification.timestamp}</p>
                    <p className="text-xs text-muted-foreground">{verification.institution}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {verification.confidence && (
                    <span className="text-sm text-muted-foreground">
                      {verification.confidence}% confidence
                    </span>
                  )}
                  {getStatusBadge(verification.status)}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedVerification(verification)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          {getStatusIcon(verification.status)}
                          <span>Certificate Verification Details</span>
                        </DialogTitle>
                        <DialogDescription>
                          Detailed analysis for {verification.fileName}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {/* Certificate Information */}
                        <div>
                          <h3 className="font-semibold mb-3">Certificate Information</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Graduate Name:</span>
                              <p className="font-medium">{verification.details.graduateName}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Degree:</span>
                              <p className="font-medium">{verification.details.degree}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Institution:</span>
                              <p className="font-medium">{verification.institution}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Issue Date:</span>
                              <p className="font-medium">{verification.details.issueDate}</p>
                            </div>
                          </div>
                        </div>

                        {/* Verification Checks */}
                        <div>
                          <h3 className="font-semibold mb-3">Verification Checks</h3>
                          <div className="space-y-3">
                            {verification.details.verificationChecks.map((check, index) => (
                              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                                {getCheckIcon(check.status)}
                                <div className="flex-1">
                                  <p className="font-medium">{check.check}</p>
                                  <p className="text-sm text-muted-foreground">{check.details}</p>
                                </div>
                                <Badge 
                                  variant={check.status === "passed" ? "default" : check.status === "failed" ? "destructive" : "outline"}
                                  className={
                                    check.status === "passed" ? "bg-gov-success text-white" :
                                    check.status === "warning" ? "text-gov-warning border-gov-warning" : ""
                                  }
                                >
                                  {check.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Rejection Reasons (if rejected) */}
                        {verification.status === "rejected" && verification.details.rejectionReasons && (
                          <div>
                            <h3 className="font-semibold mb-3 text-gov-danger flex items-center space-x-2">
                              <AlertCircle className="w-5 h-5" />
                              <span>Rejection Reasons</span>
                            </h3>
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                              <ul className="space-y-2">
                                {verification.details.rejectionReasons.map((reason, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-sm">
                                    <X className="w-4 h-4 text-gov-danger mt-0.5 flex-shrink-0" />
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Confidence Score */}
                        {verification.confidence !== null && (
                          <div>
                            <h3 className="font-semibold mb-3">Confidence Score</h3>
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all ${
                                    verification.confidence >= 80 ? "bg-gov-success" :
                                    verification.confidence >= 50 ? "bg-gov-warning" : "bg-gov-danger"
                                  }`}
                                  style={{ width: `${verification.confidence}%` }}
                                />
                              </div>
                              <span className="font-medium">{verification.confidence}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Verification Engine</span>
                <Badge className="bg-gov-success text-white">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Connection</span>
                <Badge className="bg-gov-success text-white">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <Badge className="bg-gov-success text-white">Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Quick Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Processing Time</span>
                <span className="text-sm font-medium">2.3 seconds</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Users</span>
                <span className="text-sm font-medium">47</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Uptime</span>
                <span className="text-sm font-medium">99.9%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  EyeOff, 
  Eye, 
  ArrowLeftRight, 
  AlertCircle, 
  Activity,
  Clock,
  Play,
  X
} from 'lucide-react';

type SecurityDashboardProps = {
  className?: string;
}

type HackerActivity = {
  action: string;
  timestamp: number;
  details?: any;
}

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ className }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [detectedHackers, setDetectedHackers] = useState<string[]>([]);
  const [hackerActivities, setHackerActivities] = useState<{[peerId: string]: HackerActivity[]}>({});
  const [defenseMeasures, setDefenseMeasures] = useState({
    intrusionDetection: true,
    autoDefense: false
  });
  
  // Counter-hack states
  const [monitoringEnabled, setMonitoringEnabled] = useState<{[peerId: string]: boolean}>({});
  const [deceptionEnabled, setDeceptionEnabled] = useState<{[peerId: string]: boolean}>({});
  const [counterHackActive, setCounterHackActive] = useState<{[peerId: string]: boolean}>({});
  
  // Mock security system - PeerManager removed
  useEffect(() => {
    // Simulate some mock security events for demonstration
    setTimeout(() => {
      setDetectedHackers(['192.168.1.100']);
      setHackerActivities({
        '192.168.1.100': [
          { action: 'Port scan attempt', timestamp: Date.now() - 30000 },
          { action: 'Login brute force', timestamp: Date.now() - 15000 }
        ]
      });
    }, 2000);
  }, []);

  const toggleIntrustionDetection = (enabled: boolean) => {
    setDefenseMeasures(prev => ({
      ...prev,
      intrusionDetection: enabled
    }));
    
    toast({
      title: `Intrusion Detection ${enabled ? 'Enabled' : 'Disabled'}`,
      description: enabled ? 
        "System will now detect hack attempts from peers" : 
        "System will no longer detect hack attempts - this reduces security!",
      variant: enabled ? 'default' : 'destructive'
    });
  };
  
  const toggleAutoDefense = (enabled: boolean) => {
    setDefenseMeasures(prev => ({
      ...prev,
      autoDefense: enabled
    }));
    
    toast({
      title: `Auto Defense ${enabled ? 'Enabled' : 'Disabled'}`,
      description: enabled ? 
        "System will automatically take defensive measures against hack attempts" : 
        "System will require manual intervention for defense",
      variant: 'default'
    });
  };
  
  const toggleMonitoring = (peerId: string, enabled: boolean) => {
    setMonitoringEnabled(prev => ({
      ...prev,
      [peerId]: enabled
    }));
    
    toast({
      title: `Monitoring ${enabled ? 'Enabled' : 'Disabled'}`,
      description: `Activity monitoring for peer ${peerId} ${enabled ? 'started' : 'stopped'}`,
      variant: 'default'
    });
  };
  
  const toggleDeception = (peerId: string, enabled: boolean) => {
    setDeceptionEnabled(prev => ({
      ...prev,
      [peerId]: enabled
    }));
    
    toast({
      title: `Deception ${enabled ? 'Enabled' : 'Disabled'}`,
      description: `Deception for peer ${peerId} ${enabled ? 'activated' : 'deactivated'}`,
      variant: 'default'
    });
  };
  
  const initiateCounterHack = (peerId: string) => {
    setCounterHackActive(prev => ({
      ...prev,
      [peerId]: true
    }));
    
    toast({
      title: `Counter-Hack Initiated`,
      description: `Counter-hack against peer ${peerId} started`,
      variant: 'default'
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  const getActivityDescription = (activity: HackerActivity) => {
    switch (activity.action) {
      case 'hack_attempt_detected':
        return 'Attempted to hack your system';
      case 'monitoring_started':
        return 'Activity monitoring started';
      case 'requested_peer_list':
        return 'Requested your peer connections list';
      case 'sent_fake_peer_list':
        return 'Received fake peer list (deception active)';
      case 'deception_enabled':
        return 'Deception mechanism activated';
      case 'deception_disabled':
        return 'Deception mechanism deactivated';
      default:
        return activity.action.replace(/_/g, ' ');
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Dashboard
        </CardTitle>
        <CardDescription>
          Monitor network security and manage defensive measures
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="hackers" className="flex-1">
              Detected Hackers
              {detectedHackers.length > 0 && (
                <Badge variant="destructive" className="ml-2">{detectedHackers.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex-1">Activity Logs</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Defense Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-4">
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Security Status</AlertTitle>
                <AlertDescription>
                  Your system is {defenseMeasures.intrusionDetection ? 'protected' : 'vulnerable'} to hack attempts.
                </AlertDescription>
              </Alert>
              
              {detectedHackers.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Active Threat Detected</AlertTitle>
                  <AlertDescription>
                    {detectedHackers.length} peer(s) have attempted to hack your system.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Intrusion Detection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="intrusion-detection">Enabled</Label>
                      <Switch 
                        id="intrusion-detection" 
                        checked={defenseMeasures.intrusionDetection}
                        onCheckedChange={toggleIntrustionDetection}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      Auto Defense
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-defense">Enabled</Label>
                      <Switch 
                        id="auto-defense" 
                        checked={defenseMeasures.autoDefense}
                        onCheckedChange={toggleAutoDefense}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Active Threats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-3xl font-bold">
                      {detectedHackers.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {detectedHackers.length === 0 ? 'No active threats' : 'Detected hackers'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="hackers">
            <div className="space-y-4">
              {detectedHackers.length === 0 ? (
                <div className="p-4 text-center">
                  <ShieldCheck className="h-12 w-12 mx-auto text-green-500 mb-2" />
                  <p>No hackers detected. Your system is secure.</p>
                </div>
              ) : (
                <ScrollArea className="h-[320px]">
                  {detectedHackers.map(peerId => (
                    <Card key={peerId} className="mb-4 border-red-200">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm flex justify-between">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            Hacker: {peerId}
                          </div>
                          <div>
                            <Badge variant="outline" className="bg-red-50">
                              Disconnected
                            </Badge>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center justify-between border p-2 rounded">
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <Label>Monitoring</Label>
                              </div>
                              <Switch 
                                checked={monitoringEnabled[peerId] || false}
                                onCheckedChange={(checked) => toggleMonitoring(peerId, checked)}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between border p-2 rounded">
                              <div className="flex items-center gap-2">
                                <EyeOff className="h-4 w-4" />
                                <Label>Deception</Label>
                              </div>
                              <Switch 
                                checked={deceptionEnabled[peerId] || false}
                                onCheckedChange={(checked) => toggleDeception(peerId, checked)}
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <Button 
                              variant={counterHackActive[peerId] ? "secondary" : "destructive"} 
                              size="sm" 
                              className="w-full"
                              onClick={() => initiateCounterHack(peerId)}
                              disabled={counterHackActive[peerId]}
                            >
                              <ArrowLeftRight className="h-4 w-4 mr-2" />
                              {counterHackActive[peerId] ? 'Counter-Hack Active' : 'Counter-Hack'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="activity">
            <ScrollArea className="h-[320px]">
              {Object.keys(hackerActivities).length === 0 ? (
                <div className="p-4 text-center">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p>No activity logs available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(hackerActivities).map(([peerId, activities]) => (
                    <div key={peerId}>
                      <h3 className="text-sm font-medium mb-2">Peer: {peerId}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Activity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activities.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center">
                                No activities logged
                              </TableCell>
                            </TableRow>
                          ) : (
                            activities.map((activity, i) => (
                              <TableRow key={i}>
                                <TableCell className="text-xs">
                                  {formatTimestamp(activity.timestamp)}
                                </TableCell>
                                <TableCell>
                                  {getActivityDescription(activity)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                      <Separator className="my-4" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Intrusion Detection</h3>
                <p className="text-xs text-muted-foreground">
                  When enabled, the system will detect hack attempts from other peers on the network.
                </p>
                <div className="flex items-center justify-between">
                  <Label htmlFor="intrusion-detection-setting">Enable Intrusion Detection</Label>
                  <Switch 
                    id="intrusion-detection-setting" 
                    checked={defenseMeasures.intrusionDetection}
                    onCheckedChange={toggleIntrustionDetection}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Automatic Defense</h3>
                <p className="text-xs text-muted-foreground">
                  When enabled, the system will automatically take defensive measures against hack attempts without requiring manual intervention.
                </p>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-defense-setting">Enable Auto Defense</Label>
                  <Switch 
                    id="auto-defense-setting" 
                    checked={defenseMeasures.autoDefense}
                    onCheckedChange={toggleAutoDefense}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Defense Capabilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Monitoring</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Log all activities performed by hackers to analyze their behavior and intent.
                    </p>
                  </div>
                  
                  <div className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <EyeOff className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Deception</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Provide false information to hackers to mislead them and protect your real data.
                    </p>
                  </div>
                  
                  <div className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowLeftRight className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Counter-Hack</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Turn the tables by establishing a hack connection back to attackers to monitor their system.
                    </p>
                  </div>
                  
                  <div className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <X className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Disconnect</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Immediately terminate connections with detected hackers to prevent further access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SecurityDashboard;

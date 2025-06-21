export type NatType = 'FullCone' | 'Restricted' | 'Symmetric';
export type DeviceType = 'linux' | 'db' | 'iot' | 'windows' | 'router';
export type Protocol = 'TCP' | 'UDP' | 'HTTP' | 'DNS';

export interface Router {
  id: string;                 // UUID
  publicIp: string;           // e.g. "104.56.78.22"
  natType: NatType;           // FullCone, Restricted, Symmetric
  internetConnected: boolean; // toggle Internet on/off
  deviceIds: string[];        // attached internal devices
  portForwards: PortForward[];
}

export interface Device {
  id: string;
  routerId: string;
  ip: string;                 // private, e.g. "10.0.0.5"
  type: DeviceType;           // "linux"|"db"|"iot"|…
  openPorts: number[];
  services: ServiceMeta[];
  vulnerabilityProfile: Vulnerability[]; 
}

export interface ServiceMeta {
  name: string;
  port: number;
  version: string;
  protocol: Protocol;
}

export interface Packet {
  id: string;
  srcIp: string;
  dstIp: string;
  srcPort: number;
  dstPort: number;
  protocol: Protocol;
  payload: any;
  ttl: number;
}

export interface PortForward {
  externalPort: number;
  internalIp: string;
  internalPort: number;
}

export interface Vulnerability {
  id: string;                 // CVE-like
  description: string;
  exploitDifficulty: number;  // 1–10
  patchAvailable: boolean;
}

// WebSocket message types
export type WebSocketMessage =
  | { type: 'register-router'; routerId: string }
  | { type: 'offer'; from: string; to: string; sdp: string }
  | { type: 'answer'; from: string; to: string; sdp: string }
  | { type: 'ice'; from: string; to: string; candidate: any }
  | { type: 'spawn-npc'; count: number }
  | { type: 'sniff-request'; routerId: string }
  | { type: 'exploit'; routerId: string; vulnId: string }
  | { type: 'ping' }
  | { type: 'pong' }; 
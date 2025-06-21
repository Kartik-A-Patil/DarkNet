import { AvailablePackage } from './types';

// Initial available packages
export const availablePackages: {[name: string]: AvailablePackage} = {
  'node': {
    name: 'node',
    version: '16.14.2',
    description: 'Node.js JavaScript runtime',
    installed: false,
    category: 'development',
    size: 18500,
    dependencies: []
  },
  'python3': {
    name: 'python3',
    version: '3.10.4',
    description: 'Python programming language interpreter',
    installed: false,
    category: 'development',
    size: 12800,
    dependencies: []
  },
  'nmap': {
    name: 'nmap',
    version: '7.92',
    description: 'Network mapper utility for network discovery and security auditing',
    installed: false,
    category: 'network',
    size: 5200,
    dependencies: []
  },
  'wireshark': {
    name: 'wireshark',
    version: '3.6.2',
    description: 'Network protocol analyzer',
    installed: false,
    category: 'network',
    size: 22400,
    dependencies: []
  },
  'metasploit': {
    name: 'metasploit',
    version: '6.1.27',
    description: 'Advanced open-source platform for developing, testing, and executing exploits',
    installed: false,
    category: 'security',
    size: 64800,
    dependencies: ['ruby', 'postgresql']
  },
  'netstat': {
    name: 'netstat',
    version: '2.10',
    description: 'Network statistics utility',
    installed: false,
    category: 'network',
    size: 320,
    dependencies: []
  },
  'hydra': {
    name: 'hydra',
    version: '9.3',
    description: 'Fast network login cracker',
    installed: false,
    category: 'security',
    size: 2800,
    dependencies: []
  },
  'gcc': {
    name: 'gcc',
    version: '11.2.0',
    description: 'GNU C compiler',
    installed: false,
    category: 'development',
    size: 15200,
    dependencies: []
  },
  'vim': {
    name: 'vim',
    version: '8.2',
    description: 'Vi IMproved - enhanced vi editor',
    installed: false,
    category: 'utility',
    size: 2400,
    dependencies: []
  },
  'nano': {
    name: 'nano',
    version: '6.2',
    description: 'Small, friendly text editor',
    installed: false,
    category: 'utility',
    size: 640,
    dependencies: []
  }
};

# DarkNet - Game Documentation

## Overview
**DarkNet** is a browser-based, peer-to-peer multiplayer hacking simulation game. It simulates real-world ethical hacking scenarios within a fictional OS environment called **HackOS**, designed to feel like a full-fledged Linux distribution. Players interact with this OS, perform hacks, secure systems, and engage in real-time multiplayer missions—all from within their browser.

The game aims to blend fun, strategy, and learning in cybersecurity by introducing interactive elements such as file management, terminal scripting, law enforcement tracking, and a virtual black market.

---

## Core Features and Mechanics

### 1. **HackOS (Custom In-Browser OS)**
- A Linux-inspired, windowed desktop environment built with React(vite)
- Contains a file manager, terminal, editor, settings, and installed tools section.
- Supports simulated boot, shutdown, and permission systems.

### 2. **Distributed File System (DFS)**
- Player files are stored and shared across a DHT-like peer-to-peer network.
- Uses IndexedDB for local storage and Firestore as fallback/cloud backup.
- Uses chunking and metadata storage for files to reduce payloads.
- Tracks versions, owners, and replication info per file.

### 3. **Peer-to-Peer Network & Sync Engine**
- Uses WebRTC for P2P data transfer and WebSockets for signaling.
- A Signaling Server also acts as a ghost peer to fill offline node gaps.
- SyncManager manages file state syncing, conflict resolution, and node discovery.
- Redundancy mechanism ensures each file exists on 3–5 nodes.

### 4. **File Sharing and Access Control**
- Players can share files across the network with permission flags.
- Read/Write/Execute permissions modeled on Unix-style chmod.
- File transfer speed depends on node connection quality.

### 5. **Security Tools System**
- Tools (e.g., Port Scanners, Packet Sniffers, Crackers) are installed like packages.
- Tools are modular JavaScript files with exposed methods.
- Package manager UI lets users download, update, or uninstall tools.

### 6. **Exploit System (Advanced)**
- Players craft exploits using code to target weaknesses.
- Vulnerabilities are coded into NPC servers and player machines.
- Players can upload exploits via the terminal or file system.
- Exploits can be sold/traded via Black Market (in-game network).

### 7. **Black Market**
- A decentralized marketplace for exploits, tools, logs, and data.
- Items are listed anonymously.
- Transactions are pseudo-currency based with an escrow smart contract system.

### 8. **Law Enforcement AI System**
- Simulated in-game FBI/Interpol tracks malicious actions.
- Dynamic investigation engine logs player footprints.
- Players can falsify logs, use proxy chains, or bribe virtual agents.
- Reputation and wanted level impact access to black market and server risk.

### 9. **Capture The Flag (CTF) Events**
- Weekly or real-time challenges with objectives like:
  - Gain root on a target
  - Extract a sensitive file
  - Maintain persistence unnoticed
- Live leaderboards and in-game rewards for top performers.

### 10. **Offline File System (Local Layer)**
- IndexedDB stores the full file hierarchy using a custom filesystem schema.
- Only diffs or updated sections are synced across the network.
- UI is connected directly to this system via FileManager API.

---

## System Integration Map

| Component            | Connected With                                  | Role                                                        |
|---------------------|--------------------------------------------------|-------------------------------------------------------------|
| HackOS UI           | FileManager, Terminal, Settings, Tools Installer | Acts as frontend environment                               |
| FileManager         | DFS, IndexedDB, SyncManager                      | Manages local and synced files                             |
| SyncManager         | Peer Discovery, TransferEngine, DFS              | Handles replication, syncing, redundancy                   |
| PeerNetwork         | WebRTC, Signaling Server                         | Enables real-time data transfer and node communication     |
| ExploitManager      | Terminal, Editor, Network                        | Parses and deploys code-based exploits                     |
| Black Market        | PeerNetwork, WalletSystem                        | Buys/sells tools, exploits, and files anonymously          |
| Law Enforcement AI  | System Logger, DFS Logs                          | Traces back hacks, generates alerts                        |
| CTF Engine          | Temporary servers, Scoring system                | Provides challenge-based objectives                        |
| Tool System         | PackageManager, Terminal                         | Allows real tool-like functionality from inside browser    |

---

## Data Redundancy & Fault Tolerance

- Each file is split into chunks and stored on 3–5 different peers.
- SyncManager ensures minimum availability through node health checks.
- If too few peers are available, Firestore acts as the final backup.
- IndexedDB stores both file metadata and chunks locally for offline access.

---

## Final Notes

The project combines a decentralized infrastructure with real-time interactive features to simulate the essence of hacking, exploration, and defense in a fictional world. The modular core structure allows future expansion for AI-powered NPCs, team-based missions, or even WebAssembly-based tools.

This documentation will evolve with development milestones.


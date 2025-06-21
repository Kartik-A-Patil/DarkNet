import React, { useState } from 'react';
import { useAnimations, useHoverAnimation, useLoadingAnimation } from '../../hooks/useAnimations';

const AnimationDemo: React.FC = () => {
  const { fade, text, loading, hacker } = useAnimations();
  const [isLoading, setIsLoading] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  
  const hoverRef = useHoverAnimation('scale');
  const loadingRef = useLoadingAnimation(isLoading, 'pulse');

  const handleFadeDemo = () => {
    const elements = document.querySelectorAll('.fade-demo-item');
    elements.forEach((el, index) => {
      setTimeout(() => {
        fade.fadeIn(el as HTMLElement);
      }, index * 200);
    });
  };

  const handleGlitchDemo = () => {
    const element = document.querySelector('.glitch-demo') as HTMLElement;
    if (element) {
      // Use a simple CSS animation since glitch is part of CSS keyframes
      element.style.animation = 'glitch 300ms ease-in-out';
      setTimeout(() => { element.style.animation = ''; }, 300);
    }
  };

  const handleTypewriterDemo = () => {
    const element = document.querySelector('.typewriter-demo');
    if (element) {
      text.typewriter(element as HTMLElement, "Initializing DarkNet OS...");
    }
  };

  const handleScrambleDemo = () => {
    const element = document.querySelector('.scramble-demo');
    if (element) {
      text.scramble(element as HTMLElement, "System Access Granted");
    }
  };

  const handleMatrixDemo = () => {
    setShowMatrix(!showMatrix);
    if (!showMatrix) {
      setTimeout(() => {
        const elements = document.querySelectorAll('.matrix-char');
        loading.matrix(elements);
      }, 100);
    }
  };

  const toggleLoading = () => {
    setIsLoading(!isLoading);
  };

  return (
    <div className="h-full bg-gray-900 text-white overflow-auto">
      <style>{`
        @keyframes wave {
          0%, 100% { height: 20px; }
          50% { height: 60px; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-40px); }
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes hack {
          0% { text-shadow: 0 0 5px #00ff00; }
          50% { text-shadow: 0 0 20px #00ff00, 0 0 30px #00ff00; }
          100% { text-shadow: 0 0 5px #00ff00; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center text-green-400">
            🎬 Anime.js Animation Demo
          </h1>
        
        {/* Fade Animations */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Fade Animations</h2>
          <button 
            onClick={handleFadeDemo}
            className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Trigger Fade In Up
          </button>
          <div className="grid grid-cols-3 gap-4">
            <div className="fade-demo-item p-4 bg-gray-700 rounded text-center opacity-0">
              Box 1
            </div>
            <div className="fade-demo-item p-4 bg-gray-700 rounded text-center opacity-0">
              Box 2
            </div>
            <div className="fade-demo-item p-4 bg-gray-700 rounded text-center opacity-0">
              Box 3
            </div>
          </div>
        </div>

        {/* Hover Animation */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">Hover Animation</h2>
          <div 
            ref={hoverRef}
            className="inline-block p-4 bg-purple-600 rounded cursor-pointer"
          >
            Hover me!
          </div>
        </div>

        {/* Loading Animation */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">Loading Animation</h2>
          <button 
            onClick={toggleLoading}
            className="mb-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors"
          >
            {isLoading ? 'Stop Loading' : 'Start Loading'}
          </button>
          <div 
            ref={loadingRef}
            className="w-16 h-16 bg-yellow-500 rounded-full mx-auto"
          ></div>
        </div>

        {/* Glitch Animation */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-red-400">Glitch Effect</h2>
          <button 
            onClick={handleGlitchDemo}
            className="mb-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            Trigger Glitch
          </button>
          <div className="glitch-demo text-2xl font-mono text-center text-red-400">
            SYSTEM_ERROR_404
          </div>
        </div>

        {/* Text Animations */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Text Animations</h2>
          <div className="space-x-4 mb-4">
            <button 
              onClick={handleTypewriterDemo}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
            >
              Typewriter
            </button>
            <button 
              onClick={handleScrambleDemo}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
            >
              Scramble
            </button>
          </div>
          <div className="space-y-2">
            <div className="typewriter-demo text-lg font-mono bg-black p-2 rounded border border-green-500">
              [Ready]
            </div>
            <div className="scramble-demo text-lg font-mono bg-black p-2 rounded border border-green-500">
              Access Denied
            </div>
          </div>
        </div>

        {/* Matrix Effect */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Matrix Effect</h2>
          <button 
            onClick={handleMatrixDemo}
            className="mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
          >
            {showMatrix ? 'Stop Matrix' : 'Start Matrix'}
          </button>
          {showMatrix && (
            <div className="bg-black p-4 rounded font-mono text-green-400 h-32 overflow-hidden">
              {Array.from({ length: 20 }, (_, i) => (
                <span key={i} className="matrix-char inline-block mr-2">
                  {String.fromCharCode(0x30A0 + Math.random() * 96)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Hacker-themed Animations */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Hacker Effects</h2>
          <div className="space-x-4 mb-4">
            <button 
              onClick={() => {
                const element = document.querySelector('.access-granted-demo');
                if (element) {
                  hacker.accessGranted(element as HTMLElement);
                }
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
            >
              Access Granted
            </button>
            <button 
              onClick={() => {
                const element = document.querySelector('.access-denied-demo');
                if (element) {
                  hacker.accessDenied(element as HTMLElement);
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
            >
              Access Denied
            </button>
            <button 
              onClick={() => {
                const elements = document.querySelectorAll('.network-scan-item');
                if (elements.length) {
                  hacker.networkScan(elements);
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Network Scan
            </button>
          </div>
          <div className="space-y-2">
            <div className="access-granted-demo text-lg font-mono bg-black p-2 rounded border border-green-500 text-center">
              SYSTEM ACCESS
            </div>
            <div className="access-denied-demo text-lg font-mono bg-black p-2 rounded border border-red-500 text-center">
              ACCESS DENIED
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="network-scan-item p-2 bg-gray-700 rounded text-center text-sm">
                  Node {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-4 bg-gray-800 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">Animation Engine Status</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Engine:</strong> Anime.js v4.0.2
            </div>
            <div>
              <strong>Status:</strong> <span className="text-green-400">✓ Initialized</span>
            </div>
            <div>
              <strong>Features:</strong> Fade, Scale, Glitch, Text
            </div>
            <div>
              <strong>Performance:</strong> <span className="text-green-400">Optimized</span>
            </div>
          </div>
        </div>

        {/* Particle System */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-pink-400">Particle Effects</h2>
          <button 
            onClick={() => {
              const container = document.querySelector('.particle-container');
              if (container) {
                // Create floating particles
                for (let i = 0; i < 20; i++) {
                  const particle = document.createElement('div');
                  particle.className = 'absolute w-2 h-2 bg-pink-400 rounded-full opacity-75';
                  particle.style.left = Math.random() * 100 + '%';
                  particle.style.top = Math.random() * 100 + '%';
                  container.appendChild(particle);
                  
                  // Animate particle
                  fade.fadeIn(particle);
                  setTimeout(() => {
                    fade.fadeOut(particle);
                    setTimeout(() => particle.remove(), 1000);
                  }, 2000);
                }
              }
            }}
            className="mb-4 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded transition-colors"
          >
            Generate Particles
          </button>
          <div className="particle-container relative h-32 bg-black rounded border border-pink-500 overflow-hidden">
          </div>
        </div>

        {/* Rotation & Transform */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-orange-400">Transform Animations</h2>
          <div className="space-x-4 mb-4">
            <button 
              onClick={() => {
                const element = document.querySelector('.rotate-demo') as HTMLElement;
                if (element) {
                  element.style.transform = 'rotate(360deg)';
                  element.style.transition = 'transform 1s ease-in-out';
                  setTimeout(() => {
                    element.style.transform = 'rotate(0deg)';
                  }, 1000);
                }
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded transition-colors"
            >
              Rotate
            </button>
            <button 
              onClick={() => {
                const element = document.querySelector('.scale-demo') as HTMLElement;
                if (element) {
                  element.style.transform = 'scale(1.5)';
                  element.style.transition = 'transform 0.5s ease-in-out';
                  setTimeout(() => {
                    element.style.transform = 'scale(1)';
                  }, 500);
                }
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded transition-colors"
            >
              Scale
            </button>
            <button 
              onClick={() => {
                const element = document.querySelector('.skew-demo') as HTMLElement;
                if (element) {
                  element.style.transform = 'skewX(20deg)';
                  element.style.transition = 'transform 0.5s ease-in-out';
                  setTimeout(() => {
                    element.style.transform = 'skewX(0deg)';
                  }, 500);
                }
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded transition-colors"
            >
              Skew
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="rotate-demo w-16 h-16 bg-orange-500 mx-auto flex items-center justify-center text-xs font-bold">
              ROTATE
            </div>
            <div className="scale-demo w-16 h-16 bg-orange-500 mx-auto flex items-center justify-center text-xs font-bold">
              SCALE
            </div>
            <div className="skew-demo w-16 h-16 bg-orange-500 mx-auto flex items-center justify-center text-xs font-bold">
              SKEW
            </div>
          </div>
        </div>

        {/* Progress Bar Animation */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-indigo-400">Progress Animations</h2>
          <button 
            onClick={() => {
              const bars = document.querySelectorAll('.progress-bar');
              bars.forEach((bar, index) => {
                const progress = bar.querySelector('.progress-fill') as HTMLElement;
                if (progress) {
                  progress.style.width = '0%';
                  progress.style.transition = 'width 2s ease-out';
                  setTimeout(() => {
                    progress.style.width = (Math.random() * 80 + 20) + '%';
                  }, index * 300);
                }
              });
            }}
            className="mb-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
          >
            Animate Progress
          </button>
          <div className="space-y-2">
            {['CPU Usage', 'Memory', 'Network', 'Disk I/O'].map((label, index) => (
              <div key={index} className="progress-bar">
                <div className="text-sm mb-1">{label}</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="progress-fill h-2 bg-indigo-500 rounded-full transition-all duration-1000 ease-out" style={{width: '0%'}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave Animation */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-400">Wave Effects</h2>
          <button 
            onClick={() => {
              const waves = document.querySelectorAll('.wave-bar');
              waves.forEach((wave, index) => {
                const element = wave as HTMLElement;
                element.style.animation = `wave 1s ease-in-out ${index * 0.1}s infinite`;
              });
            }}
            className="mb-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded transition-colors"
          >
            Start Wave
          </button>
          <div className="flex items-end justify-center space-x-1 h-24">
            {Array.from({ length: 12 }, (_, i) => (
              <div 
                key={i} 
                className="wave-bar w-4 bg-teal-400 rounded-t"
                style={{
                  height: '20px',
                  animation: 'none'
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Bouncing Balls */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-amber-400">Physics Simulation</h2>
          <button 
            onClick={() => {
              const container = document.querySelector('.bounce-container');
              if (container) {
                const balls = container.querySelectorAll('.bounce-ball');
                balls.forEach((ball, index) => {
                  const element = ball as HTMLElement;
                  element.style.animation = `bounce 1.5s ease-in-out ${index * 0.2}s infinite`;
                });
              }
            }}
            className="mb-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded transition-colors"
          >
            Start Bouncing
          </button>
          <div className="bounce-container flex justify-center items-end space-x-4 h-32 bg-black rounded border border-amber-500">
            {Array.from({ length: 5 }, (_, i) => (
              <div 
                key={i}
                className="bounce-ball w-8 h-8 rounded-full"
                style={{
                  backgroundColor: `hsl(${45 + i * 20}, 80%, 60%)`,
                  animation: 'none'
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Coding Terminal Simulation */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-lime-400">Terminal Hacking Simulation</h2>
          <button 
            onClick={() => {
              const terminal = document.querySelector('.terminal-output');
              if (terminal) {
                terminal.innerHTML = '';
                const commands = [
                  '> Connecting to target...',
                  '> Scanning ports...',
                  '> Found vulnerability in port 22',
                  '> Exploiting SSH...',
                  '> Access granted!',
                  '> Downloading files...',
                  '> Mission complete!'
                ];
                
                commands.forEach((cmd, index) => {
                  setTimeout(() => {
                    const line = document.createElement('div');
                    line.textContent = cmd;
                    line.className = 'terminal-line opacity-0 text-lime-400';
                    terminal.appendChild(line);
                    fade.fadeIn(line);
                  }, index * 800);
                });
              }
            }}
            className="mb-4 px-4 py-2 bg-lime-600 hover:bg-lime-700 rounded transition-colors"
          >
            Run Hack Simulation
          </button>
          <div className="terminal-output bg-black p-4 rounded font-mono text-sm h-40 overflow-auto border border-lime-500">
            <div className="text-lime-400">Terminal ready...</div>
          </div>
        </div>

        {/* Malware Spread Simulation */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-red-400">Malware Propagation</h2>
          <button 
            onClick={() => {
              const nodes = document.querySelectorAll('.network-node');
              const connections = document.querySelectorAll('.connection-line');
              
              // Reset all nodes
              nodes.forEach(node => {
                const el = node as HTMLElement;
                el.style.backgroundColor = '#10b981';
                el.style.boxShadow = 'none';
                el.style.transform = 'scale(1)';
              });
              
              // Start infection from patient zero
              let infectedCount = 0;
              const infectNode = (index: number) => {
                if (index >= nodes.length) return;
                
                const node = nodes[index] as HTMLElement;
                setTimeout(() => {
                  node.style.transition = 'all 0.5s ease-out';
                  node.style.backgroundColor = '#ef4444';
                  node.style.boxShadow = '0 0 15px #ef4444';
                  node.style.transform = 'scale(1.1)';
                  
                  // Animate connection lines
                  if (index < connections.length) {
                    const line = connections[index] as HTMLElement;
                    line.style.opacity = '1';
                    line.style.backgroundColor = '#ef4444';
                  }
                  
                  infectedCount++;
                  if (infectedCount < 8) {
                    infectNode(index + 1);
                  }
                }, 500);
              };
              
              infectNode(0);
            }}
            className="mb-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            Release Malware
          </button>
          <div className="relative bg-black p-4 rounded border border-red-500 h-48">
            {/* Network nodes */}
            {Array.from({ length: 8 }, (_, i) => (
              <div 
                key={i}
                className="network-node absolute w-8 h-8 bg-green-500 rounded-full border-2 border-green-400"
                style={{
                  left: `${20 + (i % 4) * 20}%`,
                  top: `${20 + Math.floor(i / 4) * 40}%`,
                  transition: 'none',
                  transform: 'scale(1)',
                  boxShadow: 'none'
                }}
              ></div>
            ))}
            {/* Connection lines */}
            {Array.from({ length: 7 }, (_, i) => (
              <div 
                key={i}
                className="connection-line absolute h-0.5 bg-green-400"
                style={{
                  left: `${24 + (i % 4) * 20}%`,
                  top: `${23 + Math.floor(i / 4) * 40}%`,
                  width: i % 4 === 3 ? '60%' : '16%',
                  opacity: '0.3',
                  transition: 'all 0.3s ease'
                }}
              ></div>
            ))}
            <div className="absolute bottom-2 left-2 text-xs text-green-400">
              Network Status: SECURE
            </div>
          </div>
        </div>

        {/* Quantum Encryption Visualizer */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-violet-400">Quantum Encryption</h2>
          <button 
            onClick={() => {
              const qubits = document.querySelectorAll('.qubit');
              const entanglements = document.querySelectorAll('.entanglement');
              
              qubits.forEach((qubit, index) => {
                const el = qubit as HTMLElement;
                setTimeout(() => {
                  // Random quantum state changes
                  const states = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444'];
                  let stateIndex = 0;
                  
                  const quantumInterval = setInterval(() => {
                    el.style.backgroundColor = states[stateIndex];
                    el.style.transform = `scale(${0.8 + Math.random() * 0.4}) rotate(${Math.random() * 360}deg)`;
                    el.style.transition = 'all 0.3s ease';
                    stateIndex = (stateIndex + 1) % states.length;
                  }, 300);
                  
                  setTimeout(() => clearInterval(quantumInterval), 5000);
                }, index * 100);
              });
              
              // Animate entanglement lines
              entanglements.forEach((line, index) => {
                const el = line as HTMLElement;
                setTimeout(() => {
                  el.style.opacity = '1';
                  el.style.animation = 'pulse 1s ease-in-out infinite';
                }, index * 200);
              });
            }}
            className="mb-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded transition-colors"
          >
            Activate Quantum Field
          </button>
          <div className="relative bg-black p-6 rounded border border-violet-500 h-40">
            {/* Qubits */}
            {Array.from({ length: 6 }, (_, i) => (
              <div 
                key={i}
                className="qubit absolute w-6 h-6 bg-violet-500 rounded-full border border-violet-400"
                style={{
                  left: `${15 + (i % 3) * 35}%`,
                  top: `${25 + Math.floor(i / 3) * 50}%`,
                  transition: 'none',
                  transform: 'scale(1) rotate(0deg)'
                }}
              ></div>
            ))}
            {/* Entanglement lines */}
            <div className="entanglement absolute w-px h-16 bg-violet-400" style={{
              left: '25%', top: '35%', opacity: '0', transform: 'rotate(45deg)', transformOrigin: 'top'
            }}></div>
            <div className="entanglement absolute w-px h-16 bg-violet-400" style={{
              left: '55%', top: '35%', opacity: '0', transform: 'rotate(-45deg)', transformOrigin: 'top'
            }}></div>
            <div className="entanglement absolute w-20 h-px bg-violet-400" style={{
              left: '30%', top: '60%', opacity: '0'
            }}></div>
            <div className="absolute bottom-2 right-2 text-xs text-violet-400">
              Quantum State: SUPERPOSITION
            </div>
          </div>
        </div>

        {/* Social Engineering Attack */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">Social Engineering Attack</h2>
          <button 
            onClick={() => {
              const profiles = document.querySelectorAll('.profile-card');
              const trustBar = document.querySelector('.trust-level') as HTMLElement;
              
              // Decrease trust level
              if (trustBar) {
                trustBar.style.width = '100%';
                trustBar.style.backgroundColor = '#10b981';
                trustBar.style.transition = 'all 3s ease-out';
                
                setTimeout(() => {
                  trustBar.style.width = '20%';
                  trustBar.style.backgroundColor = '#ef4444';
                }, 100);
              }
              
              // Animate profile compromise
              profiles.forEach((profile, index) => {
                const el = profile as HTMLElement;
                setTimeout(() => {
                  el.style.transition = 'all 0.5s ease-out';
                  el.style.backgroundColor = '#7f1d1d';
                  el.style.borderColor = '#ef4444';
                  el.style.transform = 'scale(0.95)';
                  
                  const statusEl = el.querySelector('.status') as HTMLElement;
                  if (statusEl) {
                    statusEl.textContent = 'COMPROMISED';
                    statusEl.style.color = '#ef4444';
                  }
                }, index * 800);
              });
            }}
            className="mb-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors"
          >
            Execute Social Attack
          </button>
          <div className="mb-4">
            <div className="text-sm mb-2">Target Trust Level:</div>
            <div className="w-full bg-gray-700 rounded-full h-3 border border-yellow-500">
              <div className="trust-level h-3 bg-green-500 rounded-full transition-all" style={{width: '100%'}}></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {['CEO', 'IT Admin', 'Employee'].map((role, index) => (
              <div 
                key={index}
                className="profile-card p-3 bg-gray-700 rounded border border-gray-600"
                style={{ transition: 'none', transform: 'scale(1)' }}
              >
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2"></div>
                  <div className="text-sm font-semibold">{role}</div>
                  <div className="status text-xs text-green-400">SECURE</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DNA Helix Animation */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">System Breach Animation</h2>
          <button 
            onClick={() => {
              const elements = document.querySelectorAll('.breach-element');
              elements.forEach((element, index) => {
                const el = element as HTMLElement;
                setTimeout(() => {
                  // Use anime.js for smooth scaling and opacity
                  el.style.transform = 'scale(0)';
                  el.style.opacity = '0';
                  el.style.transition = 'all 0.3s ease-out';
                  
                  setTimeout(() => {
                    el.style.transform = 'scale(1.2)';
                    el.style.opacity = '1';
                    el.style.backgroundColor = '#ef4444';
                    
                    setTimeout(() => {
                      el.style.transform = 'scale(1)';
                      el.style.backgroundColor = '#10b981';
                    }, 200);
                  }, 100);
                }, index * 150);
              });
            }}
            className="mb-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
          >
            Initiate System Breach
          </button>
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 16 }, (_, i) => (
              <div 
                key={i}
                className="breach-element w-8 h-8 bg-emerald-500 rounded border border-emerald-400"
                style={{
                  transform: 'scale(1)',
                  opacity: '1',
                  transition: 'none'
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Radar Scan Animation */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">Network Radar Scan</h2>
          <button 
            onClick={() => {
              const radar = document.querySelector('.radar-sweep') as HTMLElement;
              const targets = document.querySelectorAll('.radar-target');
              
              if (radar) {
                radar.style.animation = 'none';
                radar.style.transform = 'rotate(0deg)';
                
                setTimeout(() => {
                  radar.style.animation = 'spin 3s linear infinite';
                }, 50);
                
                // Animate targets appearing
                targets.forEach((target, index) => {
                  const el = target as HTMLElement;
                  setTimeout(() => {
                    el.style.transform = 'scale(0)';
                    el.style.opacity = '0';
                    
                    setTimeout(() => {
                      el.style.transform = 'scale(1)';
                      el.style.opacity = '1';
                      el.style.animation = 'pulse 2s ease-in-out infinite';
                    }, 100);
                  }, index * 500);
                });
              }
            }}
            className="mb-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"
          >
            Start Radar Scan
          </button>
          <div className="relative w-64 h-64 mx-auto bg-black rounded-full border-2 border-cyan-500 overflow-hidden">
            <div className="radar-sweep absolute inset-0 border-t-2 border-cyan-400 rounded-full" style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(6, 182, 212, 0.3) 60deg, transparent 120deg)',
              animation: 'none'
            }}></div>
            {/* Radar targets */}
            <div className="radar-target absolute w-3 h-3 bg-red-400 rounded-full" style={{
              top: '30%', left: '60%', transform: 'scale(1)', opacity: '1', transition: 'all 0.3s ease'
            }}></div>
            <div className="radar-target absolute w-3 h-3 bg-yellow-400 rounded-full" style={{
              top: '70%', left: '25%', transform: 'scale(1)', opacity: '1', transition: 'all 0.3s ease'
            }}></div>
            <div className="radar-target absolute w-3 h-3 bg-green-400 rounded-full" style={{
              top: '45%', left: '80%', transform: 'scale(1)', opacity: '1', transition: 'all 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* Code Injection Animation */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-red-400">Code Injection Attack</h2>
          <button 
            onClick={() => {
              const codeLines = document.querySelectorAll('.injection-line');
              const terminal = document.querySelector('.injection-terminal') as HTMLElement;
              
              // Clear terminal
              terminal.innerHTML = '<div class="text-green-400">$ Initiating injection...</div>';
              
              const maliciousCode = [
                'import sys; os.system("whoami")',
                'SELECT * FROM users WHERE id=1; DROP TABLE users;--',
                '<script>alert("XSS Attack")</script>',
                'eval(base64_decode($_POST["cmd"]))',
                'rm -rf /var/log/* && echo "Access granted"'
              ];
              
              codeLines.forEach((line, index) => {
                const el = line as HTMLElement;
                setTimeout(() => {
                  el.textContent = maliciousCode[index] || 'null';
                  el.style.color = '#ef4444';
                  el.style.animation = 'hack 1s ease-in-out infinite';
                  
                  // Add to terminal
                  const terminalLine = document.createElement('div');
                  terminalLine.textContent = `> ${maliciousCode[index] || 'null'}`;
                  terminalLine.className = 'text-red-400 opacity-0';
                  terminal.appendChild(terminalLine);
                  
                  // Fade in terminal line
                  setTimeout(() => {
                    terminalLine.style.opacity = '1';
                    terminalLine.style.transition = 'opacity 0.3s ease';
                  }, 100);
                }, index * 600);
              });
            }}
            className="mb-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            Execute Injection
          </button>
          <div className="grid grid-cols-1 gap-2 mb-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div 
                key={i}
                className="injection-line p-2 bg-gray-900 rounded font-mono text-sm border border-gray-600"
                style={{ color: '#10b981', animation: 'none' }}
              >
                function authenticate() &#123; return true; &#125;
              </div>
            ))}
          </div>
          <div className="injection-terminal bg-black p-4 rounded font-mono text-sm h-32 overflow-auto border border-red-500">
            <div className="text-green-400">$ Ready for injection...</div>
          </div>
        </div>

        {/* Firewall Breach Visualization */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-orange-400">Firewall Breach</h2>
          <button 
            onClick={() => {
              const firewallBlocks = document.querySelectorAll('.firewall-block');
              const attackPackets = document.querySelectorAll('.attack-packet');
              
              // Animate firewall blocks getting destroyed
              firewallBlocks.forEach((block, index) => {
                const el = block as HTMLElement;
                setTimeout(() => {
                  el.style.transition = 'all 0.5s ease-out';
                  el.style.transform = 'scale(0) rotate(45deg)';
                  el.style.opacity = '0';
                  el.style.backgroundColor = '#ef4444';
                }, index * 200);
              });
              
              // Animate attack packets
              attackPackets.forEach((packet, index) => {
                const el = packet as HTMLElement;
                setTimeout(() => {
                  el.style.transition = 'all 2s ease-out';
                  el.style.transform = 'translateX(300px)';
                  el.style.opacity = '0.3';
                }, index * 100);
              });
            }}
            className="mb-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded transition-colors"
          >
            Breach Firewall
          </button>
          <div className="relative h-32 bg-black rounded border border-orange-500 overflow-hidden">
            {/* Firewall blocks */}
            <div className="absolute right-4 top-2 flex flex-col gap-1">
              {Array.from({ length: 6 }, (_, i) => (
                <div 
                  key={i}
                  className="firewall-block w-8 h-4 bg-orange-500 border border-orange-400"
                  style={{ transition: 'none', transform: 'scale(1)', opacity: '1' }}
                ></div>
              ))}
            </div>
            {/* Attack packets */}
            <div className="absolute left-4 top-8 flex flex-col gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div 
                  key={i}
                  className="attack-packet w-4 h-2 bg-red-500 rounded"
                  style={{ transition: 'none', transform: 'translateX(0)', opacity: '1' }}
                ></div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-orange-400 text-xs pointer-events-none">
              FIREWALL PROTECTION ACTIVE
            </div>
          </div>
        </div>

        {/* Data Mining Visualization */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">Data Mining Operation</h2>
          <button 
            onClick={() => {
              const dataNodes = document.querySelectorAll('.data-node');
              const progressBar = document.querySelector('.mining-progress') as HTMLElement;
              
              // Reset progress
              if (progressBar) {
                progressBar.style.width = '0%';
                progressBar.style.transition = 'width 4s ease-out';
                setTimeout(() => {
                  progressBar.style.width = '100%';
                }, 100);
              }
              
              // Animate data nodes
              dataNodes.forEach((node, index) => {
                const el = node as HTMLElement;
                setTimeout(() => {
                  el.style.transition = 'all 0.5s ease-out';
                  el.style.backgroundColor = '#8b5cf6';
                  el.style.transform = 'scale(1.2)';
                  el.style.boxShadow = '0 0 15px #8b5cf6';
                  
                  setTimeout(() => {
                    el.style.transform = 'scale(1)';
                    el.style.backgroundColor = '#10b981';
                    el.style.boxShadow = '0 0 10px #10b981';
                  }, 300);
                }, index * 200);
              });
            }}
            className="mb-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
          >
            Start Data Mining
          </button>
          <div className="mb-4">
            <div className="text-sm mb-2">Mining Progress:</div>
            <div className="w-full bg-gray-700 rounded-full h-3 border border-purple-500">
              <div className="mining-progress h-3 bg-purple-500 rounded-full transition-all" style={{width: '0%'}}></div>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 18 }, (_, i) => (
              <div 
                key={i}
                className="data-node w-8 h-8 bg-gray-600 rounded border border-purple-400"
                style={{ 
                  transition: 'none', 
                  transform: 'scale(1)', 
                  backgroundColor: '#4b5563',
                  boxShadow: 'none'
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Encryption/Decryption Visualizer */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Encryption Cracker</h2>
          <div className="space-x-4 mb-4">
            <button 
              onClick={() => {
                const textElement = document.querySelector('.crypto-text') as HTMLElement;
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
                const finalText = 'SYSTEM_UNLOCKED';
                
                if (textElement) {
                  let iterations = 0;
                  const maxIterations = 20;
                  
                  const scrambleInterval = setInterval(() => {
                    let scrambled = '';
                    for (let i = 0; i < finalText.length; i++) {
                      if (iterations > i * 2) {
                        scrambled += finalText[i];
                      } else {
                        scrambled += chars[Math.floor(Math.random() * chars.length)];
                      }
                    }
                    textElement.textContent = scrambled;
                    textElement.style.color = iterations < maxIterations ? '#ef4444' : '#10b981';
                    
                    iterations++;
                    if (iterations >= maxIterations) {
                      clearInterval(scrambleInterval);
                      textElement.style.animation = 'hack 2s ease-in-out infinite';
                    }
                  }, 100);
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Crack Encryption
            </button>
            <button 
              onClick={() => {
                const textElement = document.querySelector('.crypto-text') as HTMLElement;
                if (textElement) {
                  textElement.textContent = 'ENCRYPTED_DATA_12X7F9';
                  textElement.style.color = '#6b7280';
                  textElement.style.animation = 'none';
                }
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
            >
              Reset
            </button>
          </div>
          <div className="bg-black p-4 rounded border border-blue-500">
            <div className="crypto-text text-2xl font-mono text-center text-gray-400" style={{ animation: 'none' }}>
              ENCRYPTED_DATA_12X7F9
            </div>
          </div>
        </div>

        {/* Final Stats */}
        <div className="p-4 bg-gray-800 rounded-lg border-2 border-green-500">
          <h2 className="text-xl font-semibold mb-4 text-green-400">🎮 Game Animation Arsenal Complete</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">20+</div>
              <div>Game Animations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">12</div>
              <div>Attack Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">Anime.js</div>
              <div>Powered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">✓</div>
              <div>Game Ready</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400 text-center">
            Hacker Simulations • Network Attacks • Social Engineering • Quantum Encryption • Malware Spread
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationDemo;

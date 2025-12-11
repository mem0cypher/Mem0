import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';
import './VoidSimulation.css';

// First Person Controller Component
function FirstPersonController({ moveSpeed = 0.1, onComputerInteract, setShowInteractPrompt }) {
  const { camera, gl } = useThree();
  
  // Auto-lock pointer when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      gl.domElement.requestPointerLock();
    }, 100);
    return () => clearTimeout(timer);
  }, [gl]);
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    shift: false
  });
  
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const controlsRef = useRef();

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.code) {
        case 'KeyW':
          moveState.current.forward = true;
          break;
        case 'KeyS':
          moveState.current.backward = true;
          break;
        case 'KeyA':
          moveState.current.left = true;
          break;
        case 'KeyD':
          moveState.current.right = true;
          break;
        case 'ShiftLeft':
          moveState.current.shift = true;
          break;
        case 'KeyE':
          // Check if near computer for interaction
          const computerPosition = new THREE.Vector3(0, 1.4, -8.25); // Computer screen position (more precise)
          const playerPosition = camera.position.clone();
          const distance = playerPosition.distanceTo(computerPosition);
          
          // Check if looking at computer
          const cameraDirection = new THREE.Vector3();
          camera.getWorldDirection(cameraDirection);
          const toComputer = computerPosition.clone().sub(playerPosition).normalize();
          const dot = cameraDirection.dot(toComputer);
          
          if (distance < 1.5 && dot > 0.85 && onComputerInteract) {
            onComputerInteract();
          }
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
          moveState.current.forward = false;
          break;
        case 'KeyS':
          moveState.current.backward = false;
          break;
        case 'KeyA':
          moveState.current.left = false;
          break;
        case 'KeyD':
          moveState.current.right = false;
          break;
        case 'ShiftLeft':
          moveState.current.shift = false;
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!controlsRef.current) return;
    
    const speed = moveState.current.shift ? moveSpeed * 2 : moveSpeed;
    
    direction.current.z = Number(moveState.current.forward) - Number(moveState.current.backward);
    direction.current.x = Number(moveState.current.right) - Number(moveState.current.left);
    direction.current.normalize();

    if (moveState.current.forward || moveState.current.backward) {
      velocity.current.z -= direction.current.z * speed;
    }
    if (moveState.current.left || moveState.current.right) {
      velocity.current.x -= direction.current.x * speed;
    }

    controlsRef.current.moveRight(-velocity.current.x);
    controlsRef.current.moveForward(-velocity.current.z);

    velocity.current.x *= 0.9;
    velocity.current.z *= 0.9;
    
    // Check if looking at computer for interaction prompt
    if (setShowInteractPrompt) {
      const computerPosition = new THREE.Vector3(0, 1.4, -8.25); // Computer screen position (more precise)
      const playerPosition = camera.position.clone();
      const distance = playerPosition.distanceTo(computerPosition);
      
      // Check if close enough and looking at computer
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      const toComputer = computerPosition.clone().sub(playerPosition).normalize();
      const dot = cameraDirection.dot(toComputer);
      
      // Show prompt if very close (< 1.5 units) and looking directly at computer screen (dot > 0.85)
      setShowInteractPrompt(distance < 1.5 && dot > 0.85);
    }
  });

  return (
    <PointerLockControls 
      ref={controlsRef}
      camera={camera} 
      domElement={gl.domElement}
    />
  );
}

// Minecraft-style Hand/Arm
function PlayerHand() {
  const handRef = useRef();
  const { camera } = useThree();
  const walkBob = useRef(0);
  
  // Track movement for walking animation
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.code) {
        case 'KeyW':
          moveState.current.forward = true;
          break;
        case 'KeyS':
          moveState.current.backward = true;
          break;
        case 'KeyA':
          moveState.current.left = true;
          break;
        case 'KeyD':
          moveState.current.right = true;
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
          moveState.current.forward = false;
          break;
        case 'KeyS':
          moveState.current.backward = false;
          break;
        case 'KeyA':
          moveState.current.left = false;
          break;
        case 'KeyD':
          moveState.current.right = false;
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  useFrame((state) => {
    if (handRef.current) {
      // Check if moving
      const isMoving = moveState.current.forward || moveState.current.backward || 
                      moveState.current.left || moveState.current.right;
      
      // Update walk bob
      if (isMoving) {
        walkBob.current += 0.15;
      } else {
        walkBob.current *= 0.95; // Slow down when not moving
      }
      
      // Position hand locked to camera viewport (not world position)
      const handOffset = new THREE.Vector3(0.4, -0.3, -0.6); // Right side, lower, closer
      
      // Apply camera rotation to the offset
      handOffset.applyQuaternion(camera.quaternion);
      
      // Set position relative to camera
      handRef.current.position.copy(camera.position).add(handOffset);
      
      // Copy camera rotation exactly
      handRef.current.rotation.copy(camera.rotation);
      
      // Add walking bob animation
      const bobAmount = Math.sin(walkBob.current) * 0.05;
      const swayAmount = Math.cos(walkBob.current * 0.5) * 0.02;
      
      handRef.current.position.y += bobAmount;
      handRef.current.position.x += swayAmount;
      
      // Add slight rotation for walking
      handRef.current.rotation.z += Math.sin(walkBob.current) * 0.1;
    }
  });

  return (
    <group ref={handRef}>
      {/* Forearm */}
      <Box args={[0.15, 0.15, 0.4]} position={[0, 0, 0.2]}>
        <meshStandardMaterial 
          color="#001155" 
          emissive="#000033"
          emissiveIntensity={0.5}
          roughness={0.7}
        />
      </Box>
      {/* Hand */}
      <Box args={[0.18, 0.18, 0.25]} position={[0, 0, -0.1]}>
        <meshStandardMaterial 
          color="#002266" 
          emissive="#000044"
          emissiveIntensity={0.5}
          roughness={0.6}
        />
      </Box>
      {/* Thumb */}
      <Box args={[0.08, 0.12, 0.08]} position={[0.12, 0, -0.05]}>
        <meshStandardMaterial 
          color="#002266" 
          emissive="#000044"
          emissiveIntensity={0.5}
          roughness={0.6}
        />
      </Box>
    </group>
  );
}

// Tree Component with full leafy canopy
function Tree({ position, height = 8, trunkWidth = 0.3, canopySize = 3 }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <Box args={[trunkWidth, height, trunkWidth]} position={[0, height/2, 0]}>
        <meshStandardMaterial 
          color="#001133" 
          emissive="#000022"
          emissiveIntensity={0.3}
        />
      </Box>
      
      {/* Full leafy canopy - sphere-like shape */}
      <Box args={[canopySize, canopySize * 0.8, canopySize]} position={[0, height + canopySize * 0.3, 0]}>
        <meshStandardMaterial 
          color="#003355" 
          emissive="#002244"
          emissiveIntensity={0.5}
        />
      </Box>
      
      {/* Additional leaf layers for fullness */}
      <Box args={[canopySize * 0.8, canopySize * 0.6, canopySize * 0.8]} position={[0, height + canopySize * 0.6, 0]}>
        <meshStandardMaterial 
          color="#003366" 
          emissive="#002255"
          emissiveIntensity={0.5}
        />
      </Box>
      
      <Box args={[canopySize * 0.6, canopySize * 0.4, canopySize * 0.6]} position={[0, height + canopySize * 0.8, 0]}>
        <meshStandardMaterial 
          color="#004477" 
          emissive="#002266"
          emissiveIntensity={0.5}
        />
      </Box>
    </group>
  );
}

// Jagged Mountain Component
function Mountain({ position, width = 20, height = 15 }) {
  return (
    <group position={position}>
      {/* Jagged mountain base - multiple peaks */}
      <Box args={[width * 0.4, height, width/2]} position={[-width * 0.2, height/2, 0]}>
        <meshStandardMaterial 
          color="#001122" 
          emissive="#000011"
          emissiveIntensity={0.2}
        />
      </Box>
      
      <Box args={[width * 0.3, height * 1.2, width/2]} position={[0, height * 0.6, 0]}>
        <meshStandardMaterial 
          color="#001122" 
          emissive="#000011"
          emissiveIntensity={0.2}
        />
      </Box>
      
      <Box args={[width * 0.35, height * 0.8, width/2]} position={[width * 0.25, height * 0.4, 0]}>
        <meshStandardMaterial 
          color="#001122" 
          emissive="#000011"
          emissiveIntensity={0.2}
        />
      </Box>
      
      {/* Jagged peaks */}
      <Box args={[width * 0.15, height * 0.4, width * 0.2]} position={[-width * 0.2, height * 1.2, 0]}>
        <meshStandardMaterial 
          color="#002233" 
          emissive="#001122"
          emissiveIntensity={0.3}
        />
      </Box>
      
      <Box args={[width * 0.12, height * 0.6, width * 0.2]} position={[0, height * 1.5, 0]}>
        <meshStandardMaterial 
          color="#002233" 
          emissive="#001122"
          emissiveIntensity={0.3}
        />
      </Box>
      
      <Box args={[width * 0.1, height * 0.3, width * 0.2]} position={[width * 0.25, height * 1.1, 0]}>
        <meshStandardMaterial 
          color="#002233" 
          emissive="#001122"
          emissiveIntensity={0.3}
        />
      </Box>
      
      {/* Snow caps on peaks */}
      <Box args={[width * 0.08, height * 0.2, width * 0.15]} position={[-width * 0.2, height * 1.4, 0]}>
        <meshStandardMaterial 
          color="#004466" 
          emissive="#003355"
          emissiveIntensity={0.6}
        />
      </Box>
      
      <Box args={[width * 0.06, height * 0.3, width * 0.15]} position={[0, height * 1.8, 0]}>
        <meshStandardMaterial 
          color="#004466" 
          emissive="#003355"
          emissiveIntensity={0.6}
        />
      </Box>
      
      <Box args={[width * 0.05, height * 0.15, width * 0.15]} position={[width * 0.25, height * 1.25, 0]}>
        <meshStandardMaterial 
          color="#004466" 
          emissive="#003355"
          emissiveIntensity={0.6}
        />
      </Box>
    </group>
  );
}

// Floating Desk Setup in Void
function SpawnStructure() {
  return (
    <group position={[0, 0, -8]}>
      {/* Computer desk setup */}
      <group position={[0, 0, -1]}>
        {/* Desk surface */}
        <Box args={[2, 0.1, 1]} position={[0, 1, 0]}>
          <meshStandardMaterial 
            color="#003388" 
            emissive="#001155"
            emissiveIntensity={0.5}
          />
        </Box>
        
        {/* Desk legs */}
        <Box args={[0.1, 1, 0.1]} position={[-0.9, 0.5, -0.4]}>
          <meshStandardMaterial color="#002266" />
        </Box>
        <Box args={[0.1, 1, 0.1]} position={[0.9, 0.5, -0.4]}>
          <meshStandardMaterial color="#002266" />
        </Box>
        <Box args={[0.1, 1, 0.1]} position={[-0.9, 0.5, 0.4]}>
          <meshStandardMaterial color="#002266" />
        </Box>
        <Box args={[0.1, 1, 0.1]} position={[0.9, 0.5, 0.4]}>
          <meshStandardMaterial color="#002266" />
        </Box>
        
        {/* Computer monitor */}
        <Box args={[0.8, 0.6, 0.1]} position={[0, 1.4, -0.3]}>
          <meshStandardMaterial 
            color="#001144" 
            emissive="#000022"
            emissiveIntensity={0.3}
          />
        </Box>
        
        {/* Computer screen */}
        <Box args={[0.7, 0.5, 0.05]} position={[0, 1.4, -0.25]}>
          <meshStandardMaterial 
            color="#004488" 
            emissive="#002244"
            emissiveIntensity={0.8}
          />
        </Box>
        
        {/* Monitor stand */}
        <Box args={[0.1, 0.2, 0.1]} position={[0, 1.1, -0.3]}>
          <meshStandardMaterial color="#002266" />
        </Box>
        
        {/* Keyboard */}
        <Box args={[0.5, 0.05, 0.2]} position={[0, 1.05, 0.1]}>
          <meshStandardMaterial 
            color="#002255" 
            emissive="#001133"
            emissiveIntensity={0.4}
          />
        </Box>
        
        {/* Mouse */}
        <Box args={[0.08, 0.03, 0.12]} position={[0.3, 1.05, 0.1]}>
          <meshStandardMaterial 
            color="#002255" 
            emissive="#001133"
            emissiveIntensity={0.4}
          />
        </Box>
      </group>
      
      {/* Chair */}
      <group position={[0, 0, 0.4]}>
        {/* Chair seat */}
        <Box args={[0.5, 0.1, 0.5]} position={[0, 0.6, 0]}>
          <meshStandardMaterial 
            color="#003366" 
            emissive="#001144"
            emissiveIntensity={0.4}
          />
        </Box>
        
        {/* Chair back - flipped 180 degrees */}
        <Box args={[0.5, 0.8, 0.1]} position={[0, 1, 0.2]}>
          <meshStandardMaterial 
            color="#003366" 
            emissive="#001144"
            emissiveIntensity={0.4}
          />
        </Box>
        
        {/* Chair legs */}
        <Box args={[0.05, 0.6, 0.05]} position={[-0.2, 0.3, -0.2]}>
          <meshStandardMaterial color="#002244" />
        </Box>
        <Box args={[0.05, 0.6, 0.05]} position={[0.2, 0.3, -0.2]}>
          <meshStandardMaterial color="#002244" />
        </Box>
        <Box args={[0.05, 0.6, 0.05]} position={[-0.2, 0.3, 0.2]}>
          <meshStandardMaterial color="#002244" />
        </Box>
        <Box args={[0.05, 0.6, 0.05]} position={[0.2, 0.3, 0.2]}>
          <meshStandardMaterial color="#002244" />
        </Box>
      </group>
    </group>
  );
}

// Flickering Orb Component
function FlickeringOrb({ position }) {
  const orbRef = useRef();
  
  useFrame((state) => {
    if (orbRef.current) {
      // Flickering effect
      const flicker = Math.sin(state.clock.elapsedTime * 3 + position[0]) * 0.3 + 0.7;
      orbRef.current.material.emissiveIntensity = flicker;
      
      // Gentle floating motion
      orbRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.5;
    }
  });

  return (
    <group>
      <Box ref={orbRef} args={[0.15, 0.15, 0.15]} position={position}>
        <meshStandardMaterial 
          color="#88CCFF" 
          emissive="#4499CC"
          emissiveIntensity={0.8}
          transparent
          opacity={0.8}
        />
      </Box>
      {/* Light emitted by orb */}
      <pointLight 
        position={position} 
        intensity={0.3} 
        color="#88CCFF" 
        distance={8}
      />
    </group>
  );
}

// Retro Operating System - Windows-style desktop
function RetroOS({ onExit }) {
  const [openWindows, setOpenWindows] = useState([]);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Track mouse movement for custom cursor
  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const osElement = document.querySelector('.retro-os');
    if (osElement) {
      osElement.addEventListener('mousemove', handleMouseMove);
      return () => osElement.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Sample projects/programs
  const desktopIcons = [
    { id: 'portfolio', name: 'Portfolio.exe', icon: '💼', type: 'program' },
    { id: 'projects', name: 'Projects', icon: '📁', type: 'folder' },
    { id: 'about', name: 'About.txt', icon: '📄', type: 'document' },
    { id: 'contact', name: 'Contact', icon: '📧', type: 'program' },
    { id: 'void', name: 'VoidSim.exe', icon: '🌌', type: 'program' },
  ];

  const startMenuItems = [
    { id: 'programs', name: 'Programs', icon: '📂' },
    { id: 'documents', name: 'Documents', icon: '📄' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'shutdown', name: 'Shutdown', icon: '🔌' },
  ];

  const openProgram = (program) => {
    if (!openWindows.find(w => w.id === program.id)) {
      setOpenWindows(prev => [...prev, {
        ...program,
        x: Math.random() * 200 + 50,
        y: Math.random() * 100 + 50,
        width: 500,
        height: 400,
        minimized: false
      }]);
    }
    setStartMenuOpen(false);
  };

  const closeWindow = (windowId) => {
    setOpenWindows(prev => prev.filter(w => w.id !== windowId));
  };

  const minimizeWindow = (windowId) => {
    setOpenWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, minimized: !w.minimized } : w
    ));
  };

  return (
    <div className="retro-os">
      {/* Custom Cursor */}
      <div 
        className="retro-cursor"
        style={{
          left: cursorPos.x,
          top: cursorPos.y
        }}
      />
      
      {/* Desktop */}
      <div className="desktop">
        {/* Desktop Icons */}
        <div className="desktop-icons">
          {desktopIcons.map((icon, index) => (
            <div 
              key={icon.id}
              className="desktop-icon"
              style={{
                left: `${20 + (index % 3) * 80}px`,
                top: `${20 + Math.floor(index / 3) * 80}px`
              }}
              onDoubleClick={() => openProgram(icon)}
            >
              <div className="icon-image">{icon.icon}</div>
              <div className="icon-label">{icon.name}</div>
            </div>
          ))}
        </div>

        {/* Open Windows */}
        {openWindows.map(window => (
          <RetroWindow
            key={window.id}
            window={window}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
          />
        ))}
      </div>

      {/* Taskbar */}
      <div className="taskbar">
        {/* Start Button */}
        <div 
          className={`start-button ${startMenuOpen ? 'active' : ''}`}
          onClick={() => setStartMenuOpen(!startMenuOpen)}
        >
          <span className="start-icon">⊞</span>
          <span>Start</span>
        </div>

        {/* Running Programs */}
        <div className="taskbar-programs">
          {openWindows.map(window => (
            <div 
              key={window.id}
              className={`taskbar-item ${window.minimized ? 'minimized' : ''}`}
              onClick={() => minimizeWindow(window.id)}
            >
              <span className="taskbar-icon">{window.icon}</span>
              <span className="taskbar-label">{window.name}</span>
            </div>
          ))}
        </div>

        {/* System Tray */}
        <div className="system-tray">
          <div className="tray-time">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Start Menu */}
      {startMenuOpen && (
        <div className="start-menu">
          <div className="start-menu-header">
            <div className="start-menu-title">mem0 OS</div>
            <div className="start-menu-version">v3.7.1</div>
          </div>
          <div className="start-menu-items">
            {startMenuItems.map(item => (
              <div 
                key={item.id}
                className="start-menu-item"
                onClick={() => {
                  if (item.id === 'shutdown') {
                    onExit();
                  } else {
                    openProgram(item);
                  }
                }}
              >
                <span className="start-item-icon">{item.icon}</span>
                <span className="start-item-name">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Retro Window Component
function RetroWindow({ window, onClose, onMinimize }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  if (window.minimized) return null;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - window.x,
      y: e.clientY - window.y
    });
  };

  return (
    <div 
      className="retro-window"
      style={{
        left: window.x,
        top: window.y,
        width: window.width,
        height: window.height
      }}
    >
      {/* Title Bar */}
      <div 
        className="window-titlebar"
        onMouseDown={handleMouseDown}
      >
        <div className="window-title">
          <span className="window-icon">{window.icon}</span>
          <span>{window.name}</span>
        </div>
        <div className="window-controls">
          <button className="window-btn minimize" onClick={onMinimize}>_</button>
          <button className="window-btn maximize">□</button>
          <button className="window-btn close" onClick={onClose}>×</button>
        </div>
      </div>

      {/* Window Content */}
      <div className="window-content">
        <WindowContent program={window} />
      </div>
    </div>
  );
}

// Window Content Component
function WindowContent({ program }) {
  switch (program.id) {
    case 'portfolio':
      return (
        <div className="program-content">
          <h2>Portfolio Application</h2>
          <p>Welcome to my digital portfolio!</p>
          <div className="program-buttons">
            <button className="retro-button">View Projects</button>
            <button className="retro-button">About Me</button>
            <button className="retro-button">Contact</button>
          </div>
        </div>
      );
    
    case 'projects':
      return (
        <div className="program-content">
          <h2>Projects Folder</h2>
          <div className="file-list">
            <div className="file-item">📄 Project_Alpha.exe</div>
            <div className="file-item">📄 Project_Beta.exe</div>
            <div className="file-item">📄 Project_Gamma.exe</div>
            <div className="file-item">📁 Archive</div>
          </div>
        </div>
      );
    
    case 'about':
      return (
        <div className="program-content">
          <h2>About.txt</h2>
          <div className="text-content">
            <p>System: mem0 OS v3.7.1</p>
            <p>Developer: mem0</p>
            <p>Status: Active</p>
            <p>Location: The Void</p>
            <p>Purpose: Digital portfolio and creative workspace</p>
          </div>
        </div>
      );
    
    default:
      return (
        <div className="program-content">
          <h2>{program.name}</h2>
          <p>Program content will be loaded here...</p>
        </div>
      );
  }
}

// Nested Game View - Game within the computer screen
function NestedGameView({ onExit }) {
  return (
    <div className="nested-reality">
      <div className="nested-header">
        <div className="nested-title">REMOTE CONTROL MODE</div>
        <div className="nested-status">CONTROLLING SELF</div>
      </div>
      
      <div className="nested-game-container">
        <Canvas
          className="nested-canvas"
          camera={{ position: [0, 1.6, 0], fov: 75, near: 0.1, far: 50 }}
          style={{ background: '#000022' }}
        >
          <NestedAlleyScene />
        </Canvas>
        
        {/* Nested game crosshair */}
        <div className="nested-crosshair">
          <div className="nested-crosshair-h"></div>
          <div className="nested-crosshair-v"></div>
        </div>
      </div>
      
      <div className="nested-footer">
        <div className="nested-controls">WASD: Move | Mouse: Look | SPACE: Exit to void</div>
      </div>
    </div>
  );
}

// Nested Alley Scene - The game world inside the computer
function NestedAlleyScene() {
  const { camera } = useThree();
  const [playerPos, setPlayerPos] = useState([0, 1.6, 0]);
  
  // Movement state for nested game
  const nestedMoveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  });
  
  const nestedVelocity = useRef({ x: 0, z: 0 });
  const nestedDirection = useRef({ x: 0, z: 0 });

  useEffect(() => {
    camera.position.set(0, 1.6, 0);
    camera.rotation.order = 'YXZ';
  }, [camera]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.code) {
        case 'KeyW':
          nestedMoveState.current.forward = true;
          break;
        case 'KeyS':
          nestedMoveState.current.backward = true;
          break;
        case 'KeyA':
          nestedMoveState.current.left = true;
          break;
        case 'KeyD':
          nestedMoveState.current.right = true;
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
          nestedMoveState.current.forward = false;
          break;
        case 'KeyS':
          nestedMoveState.current.backward = false;
          break;
        case 'KeyA':
          nestedMoveState.current.left = false;
          break;
        case 'KeyD':
          nestedMoveState.current.right = false;
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const speed = 0.05;
    
    nestedDirection.current.z = Number(nestedMoveState.current.forward) - Number(nestedMoveState.current.backward);
    nestedDirection.current.x = Number(nestedMoveState.current.right) - Number(nestedMoveState.current.left);

    if (nestedMoveState.current.forward || nestedMoveState.current.backward) {
      nestedVelocity.current.z -= nestedDirection.current.z * speed;
    }
    if (nestedMoveState.current.left || nestedMoveState.current.right) {
      nestedVelocity.current.x -= nestedDirection.current.x * speed;
    }

    // Apply movement with collision detection
    const newX = camera.position.x - nestedVelocity.current.x;
    const newZ = camera.position.z - nestedVelocity.current.z;
    
    // Simple collision bounds for alley
    if (newX > -8 && newX < 8) {
      camera.position.x = newX;
    }
    if (newZ > -15 && newZ < 15) {
      camera.position.z = newZ;
    }

    nestedVelocity.current.x *= 0.9;
    nestedVelocity.current.z *= 0.9;
    
    setPlayerPos([camera.position.x, camera.position.y, camera.position.z]);
  });

  return (
    <>
      {/* Lighting for alley */}
      <ambientLight intensity={0.3} color="#004488" />
      <pointLight position={[0, 8, 0]} intensity={0.8} color="#0088FF" />
      <pointLight position={[-5, 5, -10]} intensity={0.4} color="#0066AA" />
      <pointLight position={[5, 5, -10]} intensity={0.4} color="#0066AA" />
      
      {/* Alley Environment */}
      {/* Floor */}
      <Plane args={[20, 30]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#001155" 
          emissive="#000033"
          emissiveIntensity={0.3}
        />
      </Plane>
      
      {/* Left Wall */}
      <Box args={[0.5, 8, 30]} position={[-8, 4, 0]}>
        <meshStandardMaterial 
          color="#002277" 
          emissive="#000044"
          emissiveIntensity={0.2}
        />
      </Box>
      
      {/* Right Wall */}
      <Box args={[0.5, 8, 30]} position={[8, 4, 0]}>
        <meshStandardMaterial 
          color="#002277" 
          emissive="#000044"
          emissiveIntensity={0.2}
        />
      </Box>
      
      {/* Back Wall */}
      <Box args={[16, 8, 0.5]} position={[0, 4, -15]}>
        <meshStandardMaterial 
          color="#002277" 
          emissive="#000044"
          emissiveIntensity={0.2}
        />
      </Box>
      
      {/* Front Wall */}
      <Box args={[16, 8, 0.5]} position={[0, 4, 15]}>
        <meshStandardMaterial 
          color="#002277" 
          emissive="#000044"
          emissiveIntensity={0.2}
        />
      </Box>
      
      {/* Floating desk in alley */}
      <group position={[0, 0, -8]}>
        <Box args={[2, 0.1, 1]} position={[0, 1, 0]}>
          <meshStandardMaterial 
            color="#003388" 
            emissive="#001155"
            emissiveIntensity={0.5}
          />
        </Box>
        
        {/* Computer on desk */}
        <Box args={[0.8, 0.6, 0.1]} position={[0, 1.4, -0.3]}>
          <meshStandardMaterial 
            color="#001144" 
            emissive="#000022"
            emissiveIntensity={0.3}
          />
        </Box>
        
        <Box args={[0.7, 0.5, 0.05]} position={[0, 1.4, -0.25]}>
          <meshStandardMaterial 
            color="#004488" 
            emissive="#002244"
            emissiveIntensity={0.8}
          />
        </Box>
      </group>
      
      {/* Floating orbs in alley */}
      <FlickeringOrb position={[-6, 6, -5]} />
      <FlickeringOrb position={[6, 7, -8]} />
      <FlickeringOrb position={[-3, 5, 5]} />
      <FlickeringOrb position={[4, 8, 8]} />
      <FlickeringOrb position={[0, 9, -12]} />
      <FlickeringOrb position={[-7, 4, 0]} />
      <FlickeringOrb position={[7, 6, -3]} />
      
      {/* Player Hand in nested game */}
      <NestedPlayerHand playerPos={playerPos} />
    </>
  );
}

// Player hand for nested game
function NestedPlayerHand({ playerPos }) {
  const handRef = useRef();
  const { camera } = useThree();
  const walkBob = useRef(0);
  
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.code) {
        case 'KeyW':
          moveState.current.forward = true;
          break;
        case 'KeyS':
          moveState.current.backward = true;
          break;
        case 'KeyA':
          moveState.current.left = true;
          break;
        case 'KeyD':
          moveState.current.right = true;
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
          moveState.current.forward = false;
          break;
        case 'KeyS':
          moveState.current.backward = false;
          break;
        case 'KeyA':
          moveState.current.left = false;
          break;
        case 'KeyD':
          moveState.current.right = false;
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  useFrame((state) => {
    if (handRef.current) {
      const isMoving = moveState.current.forward || moveState.current.backward || 
                      moveState.current.left || moveState.current.right;
      
      if (isMoving) {
        walkBob.current += 0.15;
      } else {
        walkBob.current *= 0.95;
      }
      
      const handOffset = new THREE.Vector3(0.4, -0.3, -0.6);
      handOffset.applyQuaternion(camera.quaternion);
      
      handRef.current.position.copy(camera.position).add(handOffset);
      handRef.current.rotation.copy(camera.rotation);
      
      const bobAmount = Math.sin(walkBob.current) * 0.05;
      const swayAmount = Math.cos(walkBob.current * 0.5) * 0.02;
      
      handRef.current.position.y += bobAmount;
      handRef.current.position.x += swayAmount;
      handRef.current.rotation.z += Math.sin(walkBob.current) * 0.1;
    }
  });

  return (
    <group ref={handRef}>
      <Box args={[0.15, 0.15, 0.4]} position={[0, 0, 0.2]}>
        <meshStandardMaterial 
          color="#001155" 
          emissive="#000033"
          emissiveIntensity={0.5}
          roughness={0.7}
        />
      </Box>
      <Box args={[0.18, 0.18, 0.25]} position={[0, 0, -0.1]}>
        <meshStandardMaterial 
          color="#002266" 
          emissive="#000044"
          emissiveIntensity={0.5}
          roughness={0.6}
        />
      </Box>
    </group>
  );
}

// Computer Interface Component
function ComputerInterface({ isVisible, onExit }) {
  const [terminalState, setTerminalState] = useState('boot'); // 'boot', 'password', 'authenticated', 'nested-game'
  const [passwordInput, setPasswordInput] = useState('');
  const [bootComplete, setBootComplete] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space' && isVisible && terminalState !== 'password') {
        onExit();
      }
      
      if (terminalState === 'password') {
        if (event.code === 'Enter') {
          if (passwordInput === 'candy') {
            setTerminalState('nested-game');
          } else {
            setPasswordInput('');
            // Could add error message here
          }
        } else if (event.code === 'Backspace') {
          setPasswordInput(prev => prev.slice(0, -1));
        } else if (event.key.length === 1) {
          setPasswordInput(prev => prev + event.key);
        }
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isVisible, onExit, terminalState, passwordInput]);

  // Boot sequence timer
  useEffect(() => {
    if (isVisible && terminalState === 'boot') {
      const timer = setTimeout(() => {
        setBootComplete(true);
        setTimeout(() => {
          setTerminalState('password');
        }, 1000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, terminalState]);

  if (!isVisible) return null;

  return (
    <div className="computer-interface">
      <div className="computer-screen">
        {terminalState === 'boot' && (
          <div className="boot-sequence">
            <div className="boot-header">VOID SYSTEM v3.7.1</div>
            <div className="boot-content">
              <div className="boot-line">Initializing quantum processors...</div>
              <div className="boot-line">Loading neural pathways...</div>
              <div className="boot-line">Establishing void connection...</div>
              <div className="boot-line">Calibrating reality matrix...</div>
              {bootComplete && (
                <>
                  <div className="boot-line success">✓ System ready</div>
                  <div className="boot-line">Requesting authentication...</div>
                </>
              )}
            </div>
          </div>
        )}

        {terminalState === 'password' && (
          <div className="password-prompt">
            <div className="password-header">VOID ACCESS TERMINAL</div>
            <div className="password-content">
              <div className="password-line">Enter access code:</div>
              <div className="password-input">
                <span className="prompt">&gt; </span>
                <span className="password-text">{'*'.repeat(passwordInput.length)}</span>
                <span className="cursor-blink">_</span>
              </div>
              {passwordInput && passwordInput !== 'candy' && (
                <div className="password-hint">Hint: Something sweet...</div>
              )}
            </div>
          </div>
        )}

        {terminalState === 'nested-game' && (
          <RetroOS onExit={onExit} />
        )}
      </div>
    </div>
  );
}

// Night Sky Component
function NightSky() {
  return (
    <>
      {/* Stars scattered across the sky */}
      {Array.from({ length: 100 }, (_, i) => (
        <Box 
          key={i}
          args={[0.08, 0.08, 0.08]} 
          position={[
            (Math.random() - 0.5) * 200,
            Math.random() * 30 + 15,
            (Math.random() - 0.5) * 200 - 20
          ]}
        >
          <meshStandardMaterial 
            color="#FFFFFF" 
            emissive="#AACCFF"
            emissiveIntensity={Math.random() * 0.5 + 0.3}
          />
        </Box>
      ))}
      
      {/* Many floating flickering orbs everywhere */}
      <FlickeringOrb position={[-15, 12, -10]} />
      <FlickeringOrb position={[20, 15, -5]} />
      <FlickeringOrb position={[-8, 18, 8]} />
      <FlickeringOrb position={[12, 14, 15]} />
      <FlickeringOrb position={[-25, 16, -20]} />
      <FlickeringOrb position={[18, 13, -25]} />
      <FlickeringOrb position={[0, 17, 20]} />
      <FlickeringOrb position={[-12, 19, -15]} />
      <FlickeringOrb position={[25, 11, 5]} />
      <FlickeringOrb position={[-18, 14, 12]} />
      
      {/* More orbs scattered around */}
      <FlickeringOrb position={[30, 10, -30]} />
      <FlickeringOrb position={[-30, 12, 25]} />
      <FlickeringOrb position={[5, 20, -35]} />
      <FlickeringOrb position={[-22, 8, -8]} />
      <FlickeringOrb position={[35, 16, 10]} />
      <FlickeringOrb position={[-10, 22, 30]} />
      <FlickeringOrb position={[15, 9, -18]} />
      <FlickeringOrb position={[-35, 15, -5]} />
      <FlickeringOrb position={[8, 25, 22]} />
      <FlickeringOrb position={[-5, 11, -40]} />
      
      {/* Even more orbs for dense coverage */}
      <FlickeringOrb position={[40, 13, -15]} />
      <FlickeringOrb position={[-40, 18, 15]} />
      <FlickeringOrb position={[22, 7, 35]} />
      <FlickeringOrb position={[-28, 21, -25]} />
      <FlickeringOrb position={[10, 14, -45]} />
      <FlickeringOrb position={[-15, 9, 40]} />
      <FlickeringOrb position={[33, 19, -8]} />
      <FlickeringOrb position={[-33, 12, 18]} />
      <FlickeringOrb position={[7, 16, -28]} />
      <FlickeringOrb position={[-7, 23, 12]} />
      
      {/* Close orbs around the desk area */}
      <FlickeringOrb position={[6, 8, -12]} />
      <FlickeringOrb position={[-6, 10, -6]} />
      <FlickeringOrb position={[4, 12, -15]} />
      <FlickeringOrb position={[-4, 9, -3]} />
      <FlickeringOrb position={[8, 15, -20]} />
      
      {/* Additional orbs for more magic */}
      <FlickeringOrb position={[45, 14, -22]} />
      <FlickeringOrb position={[-45, 17, 28]} />
      <FlickeringOrb position={[12, 26, -50]} />
      <FlickeringOrb position={[-38, 6, -12]} />
      <FlickeringOrb position={[28, 20, 45]} />
      <FlickeringOrb position={[-16, 13, -38]} />
      <FlickeringOrb position={[50, 8, 8]} />
      <FlickeringOrb position={[-25, 24, 35]} />
      <FlickeringOrb position={[14, 11, -55]} />
      <FlickeringOrb position={[-50, 19, -18]} />
      
      {/* More close ambient orbs */}
      <FlickeringOrb position={[9, 6, -8]} />
      <FlickeringOrb position={[-9, 13, -10]} />
      <FlickeringOrb position={[3, 18, -5]} />
      <FlickeringOrb position={[-2, 7, -18]} />
      <FlickeringOrb position={[11, 21, -12]} />
    </>
  );
}

// Forest Environment with Trees and Mountains
function ForestEnvironment() {
  return (
    <>
      {/* Trees moved further from spawn area */}
      <Tree position={[-20, 0, -5]} height={10} canopySize={4} />
      <Tree position={[-18, 0, -18]} height={8} canopySize={3} />
      <Tree position={[-15, 0, 15]} height={9} canopySize={3.5} />
      <Tree position={[20, 0, -12]} height={11} canopySize={4.5} />
      <Tree position={[18, 0, 8]} height={8} canopySize={3} />
      <Tree position={[15, 0, -25]} height={9} canopySize={3.5} />
      <Tree position={[-25, 0, -30]} height={12} canopySize={5} />
      <Tree position={[25, 0, -28]} height={10} canopySize={4} />
      
      {/* Small trees moved to perimeter */}
      <Tree position={[-12, 0, -2]} height={4} canopySize={2} />
      <Tree position={[13, 0, -3]} height={3} canopySize={1.5} />
      <Tree position={[-10, 0, 18]} height={5} canopySize={2.5} />
      <Tree position={[12, 0, 20]} height={4} canopySize={2} />
      <Tree position={[-16, 0, -10]} height={6} canopySize={2.5} />
      <Tree position={[17, 0, -6]} height={5} canopySize={2} />
      <Tree position={[-18, 0, 8]} height={7} canopySize={3} />
      <Tree position={[19, 0, 12]} height={6} canopySize={2.5} />
      
      {/* Medium trees moved further out */}
      <Tree position={[-28, 0, -12]} height={8} canopySize={3.5} />
      <Tree position={[26, 0, -18]} height={9} canopySize={4} />
      <Tree position={[-24, 0, 18]} height={7} canopySize={3} />
      <Tree position={[28, 0, 15]} height={8} canopySize={3.5} />
      <Tree position={[-22, 0, -25]} height={9} canopySize={4} />
      <Tree position={[24, 0, -22]} height={8} canopySize={3.5} />
      
      {/* More distant trees */}
      <Tree position={[-25, 0, -30]} height={7} canopySize={3} />
      <Tree position={[25, 0, -35]} height={8} canopySize={3.5} />
      <Tree position={[-30, 0, 10]} height={9} canopySize={4} />
      <Tree position={[30, 0, 5]} height={10} canopySize={4.5} />
      <Tree position={[0, 0, 25]} height={8} canopySize={3.5} />
      <Tree position={[-10, 0, 30]} height={9} canopySize={4} />
      <Tree position={[10, 0, 30]} height={7} canopySize={3} />
      
      {/* Dense forest areas */}
      <Tree position={[-35, 0, -20]} height={11} canopySize={4.5} />
      <Tree position={[-32, 0, -25]} height={9} canopySize={4} />
      <Tree position={[-28, 0, -22]} height={10} canopySize={4.5} />
      <Tree position={[35, 0, -18]} height={12} canopySize={5} />
      <Tree position={[32, 0, -22]} height={8} canopySize={3.5} />
      <Tree position={[28, 0, -28]} height={9} canopySize={4} />
      
      
      {/* Far background trees */}
      <Tree position={[-40, 0, -40]} height={6} canopySize={2.5} />
      <Tree position={[40, 0, -45]} height={7} canopySize={3} />
      <Tree position={[-45, 0, 20]} height={8} canopySize={3.5} />
      <Tree position={[45, 0, 15]} height={9} canopySize={4} />
      <Tree position={[0, 0, 40]} height={7} canopySize={3} />
      <Tree position={[-20, 0, 45]} height={8} canopySize={3.5} />
      <Tree position={[20, 0, 45]} height={6} canopySize={2.5} />
      
      {/* Mountain backdrop */}
      <Mountain position={[0, 0, -60]} width={40} height={20} />
      <Mountain position={[-35, 0, -55]} width={25} height={15} />
      <Mountain position={[35, 0, -55]} width={30} height={18} />
      <Mountain position={[-60, 0, -50]} width={20} height={12} />
      <Mountain position={[60, 0, -50]} width={25} height={16} />
      
      {/* Snow particles */}
      {Array.from({ length: 50 }, (_, i) => (
        <Box 
          key={i}
          args={[0.05, 0.05, 0.05]} 
          position={[
            (Math.random() - 0.5) * 100,
            Math.random() * 15 + 5,
            (Math.random() - 0.5) * 100
          ]}
        >
          <meshStandardMaterial 
            color="#AACCFF" 
            emissive="#6699CC"
            emissiveIntensity={0.3}
            transparent
            opacity={0.6}
          />
        </Box>
      ))}
    </>
  );
}

// Open Void Environment
function VoidRoom() {
  return (
    <>
      {/* Snowy ground plane */}
      <Plane 
        args={[200, 200]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -2, 0]}
      >
        <meshStandardMaterial 
          color="#002244" 
          emissive="#001133"
          emissiveIntensity={0.4}
          roughness={0.8}
        />
      </Plane>
    </>
  );
}

// Main Game Scene
function VoidGameScene({ onComputerInteract, setShowInteractPrompt }) {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(-1.5, 1.6, -6); // Spawn to the left of the desk
    camera.rotation.order = 'YXZ';
    camera.rotation.y = Math.PI - (30 * Math.PI / 180); // Turn 180 degrees - 30 degrees
  }, [camera]);

  return (
    <>
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.3} color="#002288" />
      <pointLight position={[0, 8, 0]} intensity={1.2} color="#0066FF" />
      <pointLight position={[10, 5, 10]} intensity={0.8} color="#0044AA" />
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#0044AA" />
      <spotLight 
        position={[0, 15, 0]} 
        angle={Math.PI / 3} 
        penumbra={0.5} 
        intensity={1.5} 
        color="#0088FF"
        castShadow
      />
      <fog attach="fog" args={['#000022', 10, 40]} />
      
      {/* Room Environment */}
      <VoidRoom />
      
      {/* Player Hand */}
      <PlayerHand />
      
      {/* First Person Controls */}
      <FirstPersonController 
        moveSpeed={0.003} 
        onComputerInteract={onComputerInteract}
        setShowInteractPrompt={setShowInteractPrompt}
      />
      
      {/* Spawn Structure - Small Building */}
      <SpawnStructure />
      
      
      {/* Night Sky with Stars, Moon, and Orbs */}
      <NightSky />
    </>
  );
}

// Main VoidSimulation Component
function VoidSimulation({ isVisible, onClose }) {
  const [isLocked, setIsLocked] = useState(false);
  const [showComputer, setShowComputer] = useState(false);
  const [showInteractPrompt, setShowInteractPrompt] = useState(false);

  useEffect(() => {
    const handlePointerLock = () => {
      setIsLocked(document.pointerLockElement !== null);
    };

    document.addEventListener('pointerlockchange', handlePointerLock);
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLock);
    };
  }, []);

  const handleComputerInteract = () => {
    setShowComputer(true);
    // Exit pointer lock when using computer
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  };

  const handleComputerExit = () => {
    setShowComputer(false);
    // Re-enter pointer lock when exiting computer
    setTimeout(() => {
      const canvas = document.querySelector('.void-canvas canvas');
      if (canvas) {
        canvas.requestPointerLock();
      }
    }, 100);
  };

  if (!isVisible) return null;

  return (
    <div className="void-simulation-overlay">
      <div className="void-crosshair"></div>
      
      <Canvas
        className="void-canvas"
        camera={{ position: [0, 1.6, -8], fov: 75, near: 0.1, far: 100 }}
        style={{ background: '#000011' }}
      >
        <VoidGameScene 
          onComputerInteract={handleComputerInteract}
          setShowInteractPrompt={setShowInteractPrompt}
        />
      </Canvas>
      
      {/* VHS Static Overlay */}
      <div className="vhs-static"></div>
      
      {/* Interaction Prompt */}
      {showInteractPrompt && !showComputer && (
        <div className="interaction-prompt">
          <div className="interact-text">Press E to use computer</div>
        </div>
      )}
      
      {/* Computer Interface */}
      <ComputerInterface 
        isVisible={showComputer} 
        onExit={handleComputerExit} 
      />
    </div>
  );
}

export default VoidSimulation;

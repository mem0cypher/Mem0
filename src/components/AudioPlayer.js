import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useTheme } from '../context/ThemeContext';
import './AudioPlayer.css';

const playlist = [
  { src: '/audio/background-music.mp3', title: 'Silicon Tare - Travis Scott', artwork: '/images/artwork/silicon-tare.png' },
  { src: '/audio/Travis Scott - DUMBO (Official Audio).mp3', title: 'DUMBO - Travis Scott', artwork: '/images/artwork/dumbo.png' },
  { src: '/audio/Feels So Strange.mov', title: 'Feels So Strange - Weekly', artwork: '/images/artwork/feels-so-strange.png' },
  { src: '/audio/CHRYSTAL - The Days (Notion Remix).mp3', title: 'The Days - CHRYSTAL (Notion Remix)', artwork: '/images/artwork/crystal-days.png' }
];

const AudioPlayer = forwardRef(({ showControls = true, forceAutoplay = false }, ref) => {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isReverbReady, setIsReverbReady] = useState(false);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);
  
  const audioContextRef = useRef(null);
  const audioElRef = useRef(null);
  const sourceRef = useRef(null);
  const gainNodeRef = useRef(null);
  const filterNodeRef = useRef(null);
  const reverbNodeRef = useRef(null);
  const dryGainRef = useRef(null);
  const wetGainRef = useRef(null);
  const lastThemeRef = useRef(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    ensurePlaying: () => {
      if (audioElRef.current && !isPlaying && audioContextRef.current) {
        // Make sure AudioContext is resumed
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().then(() => {
            audioElRef.current.play().catch(err => console.log('Could not autoplay:', err));
          });
        } else {
          audioElRef.current.play().catch(err => console.log('Could not autoplay:', err));
        }
        setIsPlaying(true);
      }
    }
  }));

  const handleTrackEnd = () => {
    playNext();
  };

  const playTrack = (index) => {
    if (audioElRef.current) {
      audioElRef.current.src = playlist[index].src;
      const playPromise = audioElRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.error("Error playing track:", error);
          setIsPlaying(false);
        });
      }
    }
  };

  const playNext = () => {
    const newIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(newIndex);
    playTrack(newIndex);
  };

  const playPrev = () => {
    const newIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrackIndex(newIndex);
    playTrack(newIndex);
  };
  
  // Function to create a reverb effect
  const createReverb = async (context, duration = 2, decay = 2) => {
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const impulse = context.createBuffer(2, length, sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);
    
    for (let i = 0; i < length; i++) {
      const n = i / length;
      // Decay curve for reverb
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
    }
    
    const convolver = context.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  };

  // Function to disconnect all audio nodes
  const disconnectAllNodes = () => {
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
    }
    if (filterNodeRef.current) {
      filterNodeRef.current.disconnect();
    }
    if (reverbNodeRef.current) {
      reverbNodeRef.current.disconnect();
    }
    if (dryGainRef.current) {
      dryGainRef.current.disconnect();
    }
    if (wetGainRef.current) {
      wetGainRef.current.disconnect();
    }
  };

  // Setup audio context and nodes
  useEffect(() => {
    // Create audio context and nodes
    if (!audioContextRef.current) {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = context;

      const audioEl = new Audio();
      audioEl.crossOrigin = 'anonymous';
      audioEl.addEventListener('ended', handleTrackEnd);
      audioElRef.current = audioEl;
      
      // Set initial source without playing
      audioEl.src = playlist[currentTrackIndex].src;

      const source = context.createMediaElementSource(audioEl);
      sourceRef.current = source;
      
      const gainNode = context.createGain();
      gainNodeRef.current = gainNode;
      
      const filterNode = context.createBiquadFilter();
      filterNode.type = 'bandpass';
      filterNode.frequency.value = 1500;
      filterNode.Q.value = 5;
      filterNodeRef.current = filterNode;
      
      const dryGain = context.createGain();
      dryGainRef.current = dryGain;
      
      const wetGain = context.createGain();
      wetGainRef.current = wetGain;

      // Create reverb node with shorter duration and decay for closer sound
      createReverb(context, 1.2, 1.5).then(reverb => {
        reverbNodeRef.current = reverb;
        setIsReverbReady(true);
      });

      // Only connect the source to gain initially
      source.connect(gainNode);
    }

    return () => {
      if (audioElRef.current) {
        audioElRef.current.removeEventListener('ended', handleTrackEnd);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Try to autoplay when everything is ready
  useEffect(() => {
    if ((isReverbReady && !autoplayAttempted) || forceAutoplay) {
      setAutoplayAttempted(true);
      
      // Try to resume audio context first (needed for Chrome)
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          console.log('AudioContext resumed successfully');
          
          // After AudioContext is resumed, try to play
          if (audioElRef.current) {
            const playPromise = audioElRef.current.play();
            if (playPromise !== undefined) {
              playPromise.then(() => {
                console.log('Autoplay started successfully');
                setIsPlaying(true);
              }).catch(error => {
                console.log('Autoplay prevented by browser:', error);
                // We'll leave the button visible for the user to click
              });
            }
          }
        }).catch(error => {
          console.error('Failed to resume AudioContext:', error);
        });
      } else if (audioElRef.current) {
        // If AudioContext is already running, just try to play
        const playPromise = audioElRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Autoplay started successfully');
            setIsPlaying(true);
          }).catch(error => {
            console.log('Autoplay prevented by browser:', error);
          });
        }
      }
    }
  }, [isReverbReady, autoplayAttempted, forceAutoplay]);

  // Update audio routing when theme changes
  useEffect(() => {
    if (!audioContextRef.current || !gainNodeRef.current || !isReverbReady) return;
    
    // Store the current theme to prevent unnecessary reconnections
    if (lastThemeRef.current === theme.name) return;
    lastThemeRef.current = theme.name;
    
    // Disconnect all existing connections first
    disconnectAllNodes();
    
    const gainNode = gainNodeRef.current;
    const filterNode = filterNodeRef.current;
    const reverbNode = reverbNodeRef.current;
    const dryGain = dryGainRef.current;
    const wetGain = wetGainRef.current;
    
    if (theme.name === 'sk8') {
      // Radio effect for sk8 theme with full volume
      gainNode.gain.value = 1.0; // 100% volume
      gainNode.connect(filterNode);
      filterNode.connect(audioContextRef.current.destination);
    } else {
      // Closer reverb effect for mem0 theme with reduced volume
      gainNode.gain.value = 0.5; // 50% volume
      
      if (reverbNode) {
        // Set up dry/wet mix
        dryGain.gain.value = 0.7;
        wetGain.gain.value = 0.3;
        
        // Connect the signal paths
        gainNode.connect(dryGain);
        dryGain.connect(audioContextRef.current.destination);
        
        gainNode.connect(reverbNode);
        reverbNode.connect(wetGain);
        wetGain.connect(audioContextRef.current.destination);
      } else {
        // Fallback if reverb is not ready yet
        gainNode.connect(audioContextRef.current.destination);
      }
    }
  }, [theme, isReverbReady]);

  const togglePlay = () => {
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioElRef.current.pause();
      setIsPlaying(false);
    } else {
      playTrack(currentTrackIndex);
    }
  };

  // Only render the player controls if showControls is true
  if (!showControls) {
    return null; // Return nothing if controls shouldn't be shown
  }

  const currentTrack = playlist[currentTrackIndex];

  return (
    <div className="audio-player-container">
      <img src={currentTrack.artwork} alt={`Artwork for ${currentTrack.title}`} className="artwork-img" />
      <div className="player-right-panel">
        <div className="track-info">
          <span>{currentTrack.title}</span>
        </div>
        <div className="player-controls">
          <button onClick={playPrev} className="control-btn prev-btn">
            <span className="btn-icon">◀◀</span>
          </button>
          <button onClick={togglePlay} className="play-pause-btn">
            {isPlaying ? <span className="btn-icon">❚❚</span> : <span className="btn-icon">▶</span>}
          </button>
          <button onClick={playNext} className="control-btn next-btn">
            <span className="btn-icon">▶▶</span>
          </button>
        </div>
      </div>
    </div>
  );
});

export default AudioPlayer; 
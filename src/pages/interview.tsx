'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';

const retellClient = new RetellWebClient();

export default function Interview() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [agentTranscript, setAgentTranscript] = useState('');
  const [showDevMenu, setShowDevMenu] = useState(false);

  useEffect(() => {
    if (!isCallActive) return;

    // Listen for agent speaking state
    const handleAgentStartSpeaking = () => {
      console.log('Agent started speaking');
      setIsAgentSpeaking(true);
    };

    const handleAgentStopSpeaking = () => {
      console.log('Agent stopped speaking');
      setIsAgentSpeaking(false);
    };

    // Listen for agent message updates
    const handleAgentMessage = (message: any) => {
      console.log('Agent message:', message);
      
      // Extract agent message from transcript array
      if (message.transcript && Array.isArray(message.transcript)) {
        // Find the most recent agent message
        const agentMessages = message.transcript
          .filter((msg: any) => msg.role === 'agent')
          .map((msg: any) => msg.content)
          .join('');
        
        console.log('Extracted agent text:', agentMessages);
        setAgentTranscript(agentMessages);
      }
    };

    retellClient.on('agent_start_talking', handleAgentStartSpeaking);
    retellClient.on('agent_stop_talking', handleAgentStopSpeaking);
    retellClient.on('update', handleAgentMessage);

    return () => {
      retellClient.off('agent_start_talking', handleAgentStartSpeaking);
      retellClient.off('agent_stop_talking', handleAgentStopSpeaking);
      retellClient.off('update', handleAgentMessage);
    };
  }, [isCallActive]);

  const handleStartInterview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call your backend to create a web call
      const response = await fetch('/api/retell/create-web-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create web call`);
      }

      const data = await response.json();
      console.log('Web call created:', data);
      
      const { access_token } = data;

      if (!access_token) {
        throw new Error('No access token received from server');
      }

      console.log('Starting Retell call with token...');
      
      // Start the Retell web call
      const call = await retellClient.startCall({
        accessToken: access_token,
      });

      console.log('Call started successfully:', call);
      setIsCallActive(true);
      setAgentTranscript("Hello! I'm ready to chat. Click me to end the call.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error starting interview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndCall = () => {
    retellClient.stopCall();
    setIsCallActive(false);
    setIsAgentSpeaking(false);
    setAgentTranscript('');
  };

  const toggleCall = () => {
    if (isCallActive) {
      handleEndCall();
    } else {
      handleStartInterview();
    }
  };

  const statusText = !isCallActive 
    ? (isLoading ? "Connecting..." : "") 
    : "";

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
      
      <div className="z-10 flex flex-col items-center justify-center orb-container w-full max-w-4xl px-4">
        
        {/* The Interaction Orb */}
        <div className="relative group cursor-pointer" onClick={toggleCall} role="button" tabIndex={0}>
          {/* Outer glow rings */}
          <div className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-500
            ${isCallActive 
              ? (isAgentSpeaking ? 'bg-fuchsia-600/40 scale-150' : 'bg-blue-600/30 scale-125') 
              : 'bg-purple-600/20 scale-100 group-hover:bg-purple-600/30 group-hover:scale-110'
            }`} 
          />
          
          {/* Main Orb */}
          <div className={`w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-300
            orb
            ${!isCallActive ? 'orb-idle' : ''}
            ${isCallActive && !isAgentSpeaking ? 'orb-active-listening' : ''}
            ${isCallActive && isAgentSpeaking ? 'orb-speaking' : ''}
          `}>
             {/* Audio Visualizer - Shows when speaking */}
             {isCallActive && isAgentSpeaking && (
               <div className="relative z-10 flex items-end gap-1.5 h-12">
                 <div className="w-1 bg-white/90 rounded-full audio-bar" style={{ animationDelay: '0s' }} />
                 <div className="w-1 bg-white/90 rounded-full audio-bar" style={{ animationDelay: '0.1s' }} />
                 <div className="w-1 bg-white/90 rounded-full audio-bar" style={{ animationDelay: '0.2s' }} />
                 <div className="w-1 bg-white/90 rounded-full audio-bar" style={{ animationDelay: '0.15s' }} />
                 <div className="w-1 bg-white/90 rounded-full audio-bar" style={{ animationDelay: '0.05s' }} />
               </div>
             )}
             
             {/* Center Status Text (Optional, minimal) */}
             {(!isCallActive || isLoading) && (
               <div className="relative z-10 flex flex-col items-center gap-2 pointer-events-none">
                 <span className="font-bold text-lg tracking-widest uppercase text-white/80">
                   {isLoading ? 'Loading...' : 'Start'}
                 </span>
                 {!isLoading && (
                   <span className="text-sm text-white/60 font-light">
                     Tap the Orb to Speak
                   </span>
                 )}
               </div>
             )}
          </div>
        </div>

        {/* Status Indicator Text */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center space-y-2">
            <p className="text-xl md:text-2xl font-light tracking-wide text-gray-300 transition-all">
                {statusText}
            </p>
            {error && (
                <p className="text-red-400 text-sm">{error}</p>
            )}
        </div>

        {/* Transcript Area - Floating Movie Subtitles style */}
        <div className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 w-full px-4 transition-all duration-500 flex justify-center 
            ${isCallActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {agentTranscript && (
                <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl p-6 md:p-8 max-w-2xl w-full text-center shadow-2xl">
                    <p className="text-lg md:text-2xl text-white/90 font-medium leading-relaxed font-sans">
                        "{agentTranscript}"
                    </p>
                </div>
            )}
        </div>
      </div>

      {/* Dev Menu Button - Outside main container */}
      <div className="fixed bottom-4 right-4 z-50">
        <button 
            onClick={() => setShowDevMenu(!showDevMenu)}
            className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition"
        >
            🐞
        </button>
        
        {showDevMenu && (
            <div className="absolute bottom-12 right-0 bg-gray-900 border border-gray-700 p-4 rounded-lg shadow-xl w-64 flex flex-col gap-2">
                <h3 className="text-sm font-bold text-gray-400 mb-2">Dev Controls</h3>
                
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => setIsCallActive(!isCallActive)}
                        className={`text-xs p-2 rounded ${isCallActive ? 'bg-green-600' : 'bg-gray-700'}`}
                    >
                        Toggle Call
                    </button>
                    
                     <button 
                        onClick={() => setIsAgentSpeaking(!isAgentSpeaking)}
                        disabled={!isCallActive}
                        className={`text-xs p-2 rounded ${isAgentSpeaking ? 'bg-red-600' : 'bg-gray-700'} disabled:opacity-50`}
                    >
                        Toggle Speaking
                    </button>
                </div>

                <button 
                    onClick={() => setAgentTranscript("This is a simulated message from the orb entity. It is testing the subtitle system.")}
                     className="text-xs p-2 rounded bg-blue-900 hover:bg-blue-800 text-left"
                >
                    Simulate Text Long
                </button>
                
                 <button 
                    onClick={() => setAgentTranscript("Hello there.")}
                     className="text-xs p-2 rounded bg-blue-900 hover:bg-blue-800 text-left"
                >
                    Simulate Text Short
                </button>
                
                <button 
                    onClick={() => setAgentTranscript("")}
                     className="text-xs p-2 rounded bg-gray-700 hover:bg-gray-600 text-left"
                >
                    Clear Text
                </button>
            </div>
        )}
      </div>
    </main>
  );
}

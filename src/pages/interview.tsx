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
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-white">
      {/* Bluish hazy gradient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[100px]" />

      {isCallActive ? (
        // Active Call Screen
        <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center px-4">
          <div className="flex flex-col items-center gap-6 flex-1 justify-center">
            <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl">
              Call Active
            </h1>
            
            {/* Green Status Indicator */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-6 h-6 bg-green-500 rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-lg font-medium text-green-400">
                Connected
              </span>
            </div>

            {/* Agent Speaking Indicator */}
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="text-sm font-medium text-gray-400">
                AI Agent Status
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-full border-2" style={{
                borderColor: isAgentSpeaking ? '#ef4444' : '#22c55e',
                backgroundColor: isAgentSpeaking ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
              }}>
                <div className="relative">
                  <div 
                    className="w-5 h-5 rounded-full animate-pulse"
                    style={{
                      backgroundColor: isAgentSpeaking ? '#ef4444' : '#22c55e',
                    }}
                  />
                  {isAgentSpeaking && (
                    <div 
                      className="absolute inset-0 w-5 h-5 rounded-full animate-ping opacity-75"
                      style={{
                        backgroundColor: '#ef4444',
                      }}
                    />
                  )}
                </div>
                <span 
                  className="text-lg font-semibold"
                  style={{
                    color: isAgentSpeaking ? '#ef4444' : '#22c55e',
                  }}
                >
                  {isAgentSpeaking ? 'Speaking' : 'Listening'}
                </span>
              </div>
            </div>

            <p className="text-xl text-gray-300 leading-relaxed">
              Your interview is now in progress. Please listen carefully to the questions and respond naturally.
            </p>
          </div>

          {/* Transcript Display - Movie Subtitle Style */}
          <div className="w-full max-w-4xl mb-8">
            {agentTranscript && (
              <div className="bg-black/80 backdrop-blur-sm rounded-lg px-8 py-6 border border-blue-500/30">
                <p className="text-center text-lg leading-relaxed text-white font-medium">
                  {agentTranscript}
                </p>
              </div>
            )}
          </div>

          {/* End Call Button */}
          <div className="mb-8">
            <button 
              onClick={handleEndCall}
              className="group relative overflow-hidden rounded-full border border-red-500/50 bg-red-500/10 px-10 py-4 transition-all duration-300 hover:border-red-500 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
            >
              <span className="relative z-10 text-lg font-medium text-red-400">
                End Call
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-red-500/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </button>
          </div>
        </div>
      ) : (
        // Pre-Call Screen
        <div className="relative z-10 flex flex-col items-center gap-10 max-w-2xl px-4 text-center">
          <h1 className="text-6xl font-bold tracking-tight text-white md:text-7xl">
            Your Future Awaits
          </h1>
          
          <p className="text-xl text-gray-300 leading-relaxed">
            Welcome to your personalized interview experience. Let's discover what the future holds for you through insightful questions and meaningful conversation.
          </p>

          <div className="flex flex-col gap-4 mt-8">
            <button 
              onClick={handleStartInterview}
              disabled={isLoading}
              className="group relative overflow-hidden rounded-full border border-white/10 bg-white/5 px-10 py-4 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 text-lg font-medium text-white">
                {isLoading ? 'Starting Interview...' : 'Start Interview'}
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </button>

            {error && (
              <div className="rounded-lg bg-red-500/20 border border-red-500/50 px-4 py-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            <button 
              onClick={() => router.back()}
              className="group relative overflow-hidden rounded-full border border-white/10 bg-white/5 px-10 py-4 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            >
              <span className="relative z-10 text-lg font-medium text-white">
                Go Back
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

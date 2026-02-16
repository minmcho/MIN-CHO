
import React, { useState, useEffect, useRef } from 'react';
import { getGeminiClient } from '../services/gemini';
import { Modality, LiveServerMessage } from '@google/genai';
import { encode, decode, decodeAudioData } from '../lib/audio-utils';

const InterviewLab: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active'>('idle');
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isMutedRef = useRef(false);
  
  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasMicPermission(true);
    } catch (error) {
      console.error("Microphone access denied", error);
      alert("Microphone access is required. Please enable it in browser settings.");
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;
  };

  const startSession = async () => {
    if (!hasMicPermission) return;
    
    setStatus('connecting');
    
    // Explicitly create/resume Audio Contexts on user interaction
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    
    await inputAudioContext.resume();
    await outputAudioContext.resume();
    audioContextRef.current = outputAudioContext;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = getGeminiClient();
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('active');
            setIsActive(true);
            
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (event) => {
              // Respect the mute state directly in the stream processor
              if (isMutedRef.current) return;
              
              const inputData = event.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscript(prev => [...prev, { role: 'bot', text }]);
            } else if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscript(prev => [...prev, { role: 'user', text }]);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioContext.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Gemini Live Error:', e);
            setStatus('idle');
            setIsActive(false);
          },
          onclose: () => {
            setStatus('idle');
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } }
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: "You are an expert STEM hiring manager. Conduct a technical mock interview. Start by introducing yourself and asking the candidate to summarize their background."
        }
      });
      
      sessionRef.current = await sessionPromise;
      
    } catch (error) {
      console.error("Session start failed", error);
      setStatus('idle');
    }
  };

  const endSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    setIsActive(false);
    setStatus('idle');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Interview Simulation Lab</h2>
          <p className="text-slate-500">Live AI voice conversation with advanced STEM logic.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex gap-3">
            {/* Unified Microphone Toggle */}
            {hasMicPermission && (
              <button
                onClick={toggleMute}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm border ${
                  isMuted 
                    ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:shadow-rose-100' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:shadow-indigo-100'
                }`}
              >
                {isMuted ? 'Mic Disabled' : 'Mic Enabled'}
                <span className="text-xl">{isMuted ? '🔇' : '🎤'}</span>
              </button>
            )}

            {!isActive ? (
              <>
                {!hasMicPermission && (
                  <button
                    onClick={requestMicPermission}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-emerald-200"
                  >
                    Allow Microphone 🎙️
                  </button>
                )}
                <button
                  onClick={startSession}
                  disabled={status === 'connecting' || !hasMicPermission}
                  className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${
                    !hasMicPermission 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
                  }`}
                >
                  {status === 'connecting' ? 'Calibrating...' : 'Start Interview'}
                  <span className="text-xl">🚀</span>
                </button>
              </>
            ) : (
              <button
                onClick={endSession}
                className="bg-rose-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-rose-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-rose-200"
              >
                End Session
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-900 rounded-3xl p-8 relative shadow-2xl border-4 border-slate-800">
        {!isActive && status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
            {!hasMicPermission ? (
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                   <span className="text-4xl text-emerald-400">🎙️</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Microphone Access Required</h3>
                <p className="text-slate-400 max-w-sm mb-6 mx-auto">
                  To begin your STEM mock interview, we need access to your microphone for real-time voice analysis.
                </p>
                <button
                  onClick={requestMicPermission}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/40"
                >
                  Grant Access Now
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
                   <span className="text-4xl text-indigo-400">⚡</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Microphone Ready</h3>
                <p className="text-slate-400 max-w-sm mx-auto mb-6">
                  You're all set. You can toggle your mic input in the top bar before starting.
                </p>
                {isMuted && (
                  <div className="inline-block px-4 py-2 bg-rose-500/20 text-rose-300 rounded-full text-xs font-bold uppercase tracking-widest border border-rose-500/30">
                    Input currently muted
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {status === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="flex gap-2 mb-4">
              <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-4 h-4 bg-indigo-300 rounded-full animate-bounce delay-200"></div>
            </div>
            <p className="text-indigo-400 font-bold uppercase tracking-widest text-sm">Establishing Secure AI Link...</p>
          </div>
        )}

        <div className="space-y-6">
          {transcript.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-6 py-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}>
                <p className="text-xs opacity-50 mb-1 font-bold uppercase tracking-wider">
                  {msg.role === 'user' ? 'You' : 'Hiring Manager'}
                </p>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isActive && <div id="auto-scroll-anchor" className="h-4" />}
        </div>

        {isActive && (
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur flex justify-center">
            <div className={`flex items-center gap-4 px-6 py-3 rounded-full border transition-colors ${
              isMuted 
                ? 'bg-rose-500/20 border-rose-500/30' 
                : 'bg-indigo-500/20 border-indigo-500/30'
            }`}>
              <div className="flex gap-1">
                <div className={`w-1 h-4 rounded-full ${isMuted ? 'bg-rose-500' : 'bg-indigo-500 animate-pulse'}`}></div>
                <div className={`w-1 h-6 rounded-full ${isMuted ? 'bg-rose-400' : 'bg-indigo-400 animate-pulse delay-75'}`}></div>
                <div className={`w-1 h-3 rounded-full ${isMuted ? 'bg-rose-300' : 'bg-indigo-300 animate-pulse delay-150'}`}></div>
                <div className={`w-1 h-5 rounded-full ${isMuted ? 'bg-rose-400' : 'bg-indigo-400 animate-pulse delay-100'}`}></div>
              </div>
              <span className={`text-sm font-bold uppercase tracking-widest ${
                isMuted ? 'text-rose-400' : 'text-indigo-300'
              }`}>
                {isMuted ? 'Microphone Muted' : 'Mic Live'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewLab;

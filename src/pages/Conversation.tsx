import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PhoneOff, MessageSquare, X, AlertCircle } from 'lucide-react';
import { useConversation } from '@elevenlabs/react';
import { Scenario, ConversationStatus, TranscriptEntry, UserProfile, LANGUAGES } from '@/lib/types';
import { mockScenarios } from '@/lib/mock-data';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { generateFeedback } from '@/lib/gemini';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string;

const orbColors: Record<ConversationStatus, string> = {
  idle: 'hsl(240 10% 40%)',
  connecting: 'hsl(240 10% 50%)',
  listening: 'hsl(0 0% 95%)',
  agent_speaking: 'hsl(244 98% 69%)',
  processing: 'hsl(244 50% 60%)',
  ended: 'hsl(240 10% 30%)',
  error: 'hsl(0 72% 71%)',
};

const statusLabel: Record<ConversationStatus, string> = {
  idle: '',
  connecting: 'Connecting...',
  listening: 'Listening',
  agent_speaking: '',
  processing: 'Thinking...',
  ended: 'Conversation ended',
  error: 'Connection lost',
};

const Conversation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scenario: Scenario = location.state?.scenario || mockScenarios[0];
  const profile: UserProfile | null = location.state?.profile || null;
  const startTimeRef = useRef(Date.now());

  const [status, setStatus] = useState<ConversationStatus>('idle');
  const [showTranscript, setShowTranscript] = useState(false);
  const [showMicError, setShowMicError] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const { attachStream, startUtterance, finishUtterance, assessments } = useAudioRecorder(profile?.target_language || 'es');

  const addTranscript = useCallback((role: 'user' | 'agent', text: string) => {
    setTranscript(prev => [...prev, { role, text, timestamp: Date.now() }]);
  }, []);

  const conversation = useConversation({
    onConnect: () => {
      setStatus('listening');
    },
    onDisconnect: () => {
      setStatus('ended');
    },
    onMessage: ({ message, source }) => {
      if (source === 'user') {
        addTranscript('user', message);
      } else if (source === 'ai') {
        addTranscript('agent', message);
      }
    },
    onModeChange: ({ mode }) => {
      if (mode === 'speaking') {
        setStatus('agent_speaking');
        // User finished speaking — stop recording and send for assessment
        finishUtterance();
      } else if (mode === 'listening') {
        setStatus('listening');
        // User is about to speak — start recording
        startUtterance();
      }
    },
    onError: (message) => {
      console.error('ElevenLabs error:', message);
      if (
        typeof message === 'string' &&
        (message.toLowerCase().includes('microphone') ||
          message.toLowerCase().includes('permission') ||
          message.toLowerCase().includes('notallowed'))
      ) {
        setShowMicError(true);
      }
      setStatus('error');
    },
  });

  // Start the session on mount
  useEffect(() => {
    const start = async () => {
      setStatus('connecting');
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        setShowMicError(true);
        setStatus('error');
        return;
      }

      // Attach mic stream to the audio recorder for pronunciation analysis
      attachStream(stream);

      try {
        const targetLang = LANGUAGES.find(l => l.code === profile?.target_language)?.name ?? 'Spanish';

        await conversation.startSession({
          agentId: AGENT_ID,
          connectionType: 'webrtc',
          overrides: {
            agent: {
              prompt: {
                prompt: [
                  `## Scenario Context`,
                  `Character name: ${scenario.character.name}`,
                  `Character role: ${scenario.character.role}`,
                  `Personality: ${scenario.character.personality}`,
                  `Scene: ${scenario.scene}`,
                  `Language: ${targetLang}`,
                  `Student level: ${profile?.level ?? 'Intermediate'}`,
                  scenario.tips?.length ? `Conversation tips for the student: ${scenario.tips.join('; ')}` : '',
                ].filter(Boolean).join('\n'),
              },
              firstMessage: scenario.scene,
            },
          },
        });
      } catch (err) {
        console.error('Failed to start ElevenLabs session:', err);
        setStatus('error');
      }
    };

    start();

    return () => {
      conversation.endSession().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const endConversation = useCallback(async () => {
    setStatus('ended');
    await conversation.endSession().catch(() => {});

    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

    // Compute aggregate pronunciation score from all assessments
    const allWords = assessments.flatMap(a => a.words);
    const pronunciationScore =
      allWords.length > 0
        ? Math.round(allWords.reduce((sum, w) => sum + w.probability, 0) / allWords.length * 100)
        : 0;

    const targetLanguage = profile?.target_language || 'es';

    try {
      const feedback = await generateFeedback(transcript, scenario, targetLanguage, duration);
      navigate('/feedback', {
        state: {
          scenario,
          profile,
          feedback: {
            ...feedback,
            pronunciation: assessments,
            pronunciationScore,
          },
        },
      });
    } catch (err) {
      console.error('Failed to generate feedback:', err);
      navigate('/feedback', {
        state: {
          scenario,
          profile,
          feedback: {
            fluencyScore: 0,
            corrections: [],
            vocabulary: [],
            summary: 'Could not generate feedback. Please try again.',
            focusTip: '',
            duration,
            scenarioName: scenario.title,
            language: targetLanguage,
            date: new Date().toISOString(),
            pronunciation: assessments,
            pronunciationScore,
          },
        },
      });
    }
  }, [conversation, navigate, scenario, assessments, transcript, profile]);

  // Derive orb animation status
  const orbStatus =
    conversation.isSpeaking && status !== 'ended' && status !== 'error'
      ? 'agent_speaking'
      : status;

  const latestAssessment = assessments.length > 0 ? assessments[assessments.length - 1] : null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between relative overflow-hidden">
      {/* Mic permission overlay */}
      <AnimatePresence>
        {showMicError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-background/90 flex items-center justify-center p-6"
          >
            <div className="text-center space-y-4 max-w-sm">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-lg font-semibold text-foreground">Microphone access needed</h2>
              <p className="text-sm text-muted-foreground">
                We need microphone access to have a voice conversation. Please enable it in your
                browser settings.
              </p>
              <Button variant="secondary" onClick={() => setShowMicError(false)}>
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="w-full text-center pt-12 pb-4 px-4">
        <p className="text-sm font-semibold text-foreground">{scenario.character.name}</p>
        <p className="text-xs text-muted-foreground">{scenario.title}</p>
      </div>

      {/* Orb */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <motion.div
            className="w-32 h-32 rounded-full"
            style={{ backgroundColor: orbColors[orbStatus] }}
            animate={
              orbStatus === 'agent_speaking' || orbStatus === 'listening'
                ? { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }
                : orbStatus === 'processing'
                  ? { scale: [0.95, 1.05, 0.95], opacity: [0.5, 0.8, 0.5] }
                  : orbStatus === 'connecting'
                    ? { scale: [0.98, 1.02, 0.98], opacity: [0.3, 0.5, 0.3] }
                    : orbStatus === 'error'
                      ? {
                          scale: [1, 1.05, 1],
                          backgroundColor: [
                            'hsl(0 72% 71%)',
                            'hsl(0 72% 50%)',
                            'hsl(0 72% 71%)',
                          ],
                        }
                      : {}
            }
            transition={{
              duration: orbStatus === 'processing' ? 4 : 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Glow */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-30"
            style={{ backgroundColor: orbColors[orbStatus] }}
          />
        </div>
      </div>

      {/* Status label */}
      <p className="text-xs text-muted-foreground pb-1">
        {orbStatus === 'agent_speaking' ? scenario.character.name : statusLabel[orbStatus]}
      </p>

      {/* Pronunciation hint dots — shows latest assessment's word confidence */}
      <AnimatePresence>
        {latestAssessment && orbStatus !== 'ended' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-1 justify-center pb-2"
          >
            {latestAssessment.words.slice(0, 10).map((w, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  w.tier === 'high'
                    ? 'bg-green-400'
                    : w.tier === 'medium'
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                }`}
                title={`${w.word}: ${Math.round(w.probability * 100)}%`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <div className="w-full max-w-lg px-4 pb-8 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          onClick={() => setShowTranscript(!showTranscript)}
        >
          {showTranscript ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={endConversation}
        >
          <PhoneOff className="h-4 w-4 mr-1" /> End
        </Button>
      </div>

      {/* Transcript panel */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[40vh] bg-card/95 backdrop-blur-lg border-t border-border rounded-t-2xl"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Transcript</p>
              <button onClick={() => setShowTranscript(false)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <ScrollArea className="h-[calc(40vh-56px)] p-4">
              <div className="space-y-3">
                {transcript.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center pt-4">
                    Transcript will appear here as you speak.
                  </p>
                )}
                {transcript.map((entry, i) => (
                  <div
                    key={i}
                    className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                        entry.role === 'user'
                          ? 'bg-primary/20 text-foreground'
                          : 'bg-secondary text-foreground'
                      }`}
                    >
                      {entry.text}
                    </div>
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Conversation;

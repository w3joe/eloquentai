import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, RotateCcw, Plus, Check, Clock, Calendar } from 'lucide-react';
import { FeedbackData, Scenario, UserProfile } from '@/lib/types';
import { mockFeedback, mockScenarios } from '@/lib/mock-data';
import { saveSession, getProfile as getStoredProfile } from '@/lib/storage';

const CircularProgress = ({ score, label = 'fluency' }: { score: number; label?: string }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r={radius} fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
};

const Feedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const feedback: FeedbackData = location.state?.feedback || mockFeedback;
  const scenario: Scenario = location.state?.scenario || mockScenarios[0];
  const profile: UserProfile | null = location.state?.profile || getStoredProfile();
  const [savedWords, setSavedWords] = useState<Set<number>>(new Set());
  const savedRef = useRef(false);

  useEffect(() => {
    if (!savedRef.current && location.state?.feedback) {
      saveSession(feedback);
      savedRef.current = true;
    }
  }, [feedback, location.state?.feedback]);

  const toggleSave = (index: number) => {
    setSavedWords(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-8">
      <div className="max-w-lg mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 space-y-4">
          <h1 className="text-xl font-bold text-foreground text-center">Here's how you did</h1>
          <div className="flex justify-center gap-6">
            <CircularProgress score={feedback.fluencyScore} label="fluency" />
            {feedback.pronunciationScore != null && feedback.pronunciationScore > 0 && (
              <CircularProgress score={feedback.pronunciationScore} label="pronunciation" />
            )}
          </div>
        </motion.div>

        <Tabs defaultValue="corrections">
          <TabsList className="w-full bg-secondary border-0">
            <TabsTrigger value="corrections" className="flex-1 text-xs">Corrections</TabsTrigger>
            <TabsTrigger value="vocabulary" className="flex-1 text-xs">Vocabulary</TabsTrigger>
            <TabsTrigger value="summary" className="flex-1 text-xs">Summary</TabsTrigger>
            <TabsTrigger value="pronunciation" className="flex-1 text-xs">Pronunciation</TabsTrigger>
          </TabsList>

          <TabsContent value="corrections" className="space-y-3 mt-4">
            {feedback.corrections.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-0 bg-card">
                  <CardContent className="p-4 space-y-2">
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="bg-destructive/20 text-destructive px-1 rounded">{c.original}</span>
                      </p>
                      <p className="text-sm">
                        <span className="bg-success/20 text-success px-1 rounded">{c.correction}</span>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.explanation}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="vocabulary" className="space-y-3 mt-4">
            {feedback.vocabulary.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-0 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground text-sm">{v.word}</p>
                        <p className="text-xs text-muted-foreground">{v.translation}</p>
                        <p className="text-xs text-muted-foreground/70 italic">"{v.example}"</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`shrink-0 text-xs ${savedWords.has(i) ? 'text-success' : 'text-primary'}`}
                        onClick={() => toggleSave(i)}
                      >
                        {savedWords.has(i) ? <><Check className="h-3 w-3 mr-1" /> Saved</> : <><Plus className="h-3 w-3 mr-1" /> Save</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="summary" className="mt-4 space-y-4">
            <Card className="border-0 bg-card">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm text-foreground leading-relaxed">{feedback.summary}</p>
                <div className="bg-primary/10 rounded-lg p-3">
                  <p className="text-xs font-semibold text-primary mb-1">Focus for next session</p>
                  <p className="text-xs text-foreground/80">{feedback.focusTip}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDuration(feedback.duration)}</span>
                  <span>{feedback.language}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(feedback.date).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pronunciation" className="space-y-3 mt-4">
            {feedback.pronunciation && feedback.pronunciation.length > 0 ? (
              feedback.pronunciation.map((assessment, ai) => (
                <motion.div key={ai} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ai * 0.1 }}>
                  <Card className="border-0 bg-card">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Utterance {ai + 1}</p>
                        <p className="text-xs text-muted-foreground">{assessment.overall_score}/100</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {assessment.words.map((w, wi) => (
                          <Badge
                            key={wi}
                            variant="secondary"
                            className={`text-xs ${
                              w.tier === 'high'
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                : w.tier === 'medium'
                                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            }`}
                          >
                            {w.word}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center pt-4">
                No pronunciation data available.
              </p>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1 gap-2" onClick={() => navigate('/briefing', { state: { scenario, profile } })}>
            <RotateCcw className="h-4 w-4" /> Practice Again
          </Button>
          <Button className="flex-1 gap-2" onClick={() => navigate('/home')}>
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PronunciationAssessment, LANGUAGES } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { assessPronunciation } from '@/lib/azure-speech';

const PronunciationTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState(location.state?.language || 'en');
  const [isListening, setIsListening] = useState(false);
  const [assessments, setAssessments] = useState<PronunciationAssessment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startAssessment = useCallback(async () => {
    setIsListening(true);
    setError(null);
    try {
      const result = await assessPronunciation(language);
      setAssessments(prev => [result, ...prev]);
    } catch (err) {
      console.error('Assessment failed:', err);
      setError(err instanceof Error ? err.message : 'Assessment failed');
    } finally {
      setIsListening(false);
    }
  }, [language]);

  const tierColor = (tier: string) => {
    if (tier === 'high') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (tier === 'medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-8">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="pt-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Pronunciation Test</h1>
            <p className="text-xs text-muted-foreground">Speak naturally — Azure will score your pronunciation word by word</p>
          </div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-28 bg-secondary border-0 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(l => (
                <SelectItem key={l.code} value={l.code}>{l.flag} {l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Record button */}
        <div className="flex flex-col items-center gap-4 py-6">
          {isListening ? (
            <motion.div
              className="w-24 h-24 rounded-full bg-primary/80 flex items-center justify-center shadow-lg shadow-primary/30"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
            </motion.div>
          ) : (
            <motion.button
              onClick={startAssessment}
              className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
              whileTap={{ scale: 0.95 }}
            >
              <Mic className="h-8 w-8 text-primary-foreground" />
            </motion.button>
          )}
          <p className="text-xs text-muted-foreground">
            {isListening ? 'Listening... speak now, pause when done' : 'Tap to start'}
          </p>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400" /> High (80+)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400" /> Medium (60+)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400" /> Low (&lt;60)</span>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <AnimatePresence>
            {assessments.map((assessment, ai) => (
              <motion.div
                key={ai}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-0 bg-card">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">"{assessment.transcript}"</p>
                      <Badge variant="secondary" className={`text-xs ${
                        assessment.overall_score >= 80 ? 'bg-green-500/20 text-green-400'
                        : assessment.overall_score >= 60 ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                      }`}>
                        {assessment.overall_score}/100
                      </Badge>
                    </div>

                    {/* Score breakdown */}
                    <div className="flex gap-3 text-[11px] text-muted-foreground">
                      <span>Accuracy: {assessment.accuracyScore}</span>
                      <span>Fluency: {assessment.fluencyScore}</span>
                      <span>Completeness: {assessment.completenessScore}</span>
                    </div>

                    {/* Words */}
                    <div className="flex flex-wrap gap-2">
                      {assessment.words.map((w, wi) => (
                        <div key={wi} className="flex flex-col items-center gap-0.5">
                          <Badge
                            variant="secondary"
                            className={`text-sm px-2 py-1 ${tierColor(w.tier)}`}
                          >
                            {w.word}
                          </Badge>
                          <span className={`text-[10px] ${
                            w.tier === 'high' ? 'text-green-400'
                            : w.tier === 'medium' ? 'text-yellow-400'
                            : 'text-red-400'
                          }`}>
                            {w.accuracyScore}%
                          </span>
                          {w.errorType !== 'None' && (
                            <span className="text-[9px] text-red-400">{w.errorType}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Phoneme detail for mispronounced words */}
                    {assessment.words.some(w => w.errorType !== 'None' && w.phonemes?.length) && (
                      <div className="pt-2 border-t border-border space-y-1">
                        <p className="text-[10px] text-muted-foreground font-medium">Phoneme detail</p>
                        {assessment.words
                          .filter(w => w.errorType !== 'None' && w.phonemes?.length)
                          .map((w, wi) => (
                            <div key={wi} className="flex items-center gap-2 text-[11px]">
                              <span className="text-red-400 font-medium">{w.word}:</span>
                              <div className="flex gap-1">
                                {w.phonemes!.map((p, pi) => (
                                  <span key={pi} className={`px-1 rounded ${
                                    p.accuracyScore >= 80 ? 'text-green-400' : p.accuracyScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                                  }`}>
                                    /{p.phoneme}/ {p.accuracyScore}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {assessments.length === 0 && !isListening && (
            <p className="text-center text-sm text-muted-foreground pt-4">
              Tap the mic and speak a sentence to see pronunciation scores.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PronunciationTest;

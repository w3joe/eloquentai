import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Home, History as HistoryIcon, User } from 'lucide-react';
import { getSessions } from '@/lib/storage';

const History = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sessions = getSessions();

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400';
    if (score >= 50) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 max-w-lg mx-auto w-full p-4 pb-24 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 space-y-1"
        >
          <h1 className="text-2xl font-bold text-foreground">History</h1>
          <p className="text-muted-foreground">Your past practice sessions</p>
        </motion.div>

        {sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 space-y-2"
          >
            <HistoryIcon className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-sm">No sessions yet</p>
            <p className="text-muted-foreground/60 text-xs">Complete a conversation to see your history here</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="border-0 bg-card cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => navigate('/feedback', { state: { feedback: session } })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm truncate">{session.scenarioName}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{session.language}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatDuration(session.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {new Date(session.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className={`shrink-0 ml-3 ${scoreColor(session.fluencyScore)}`}>
                        {session.fluencyScore}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border">
        <div className="max-w-lg mx-auto flex justify-around py-3">
          {[
            { icon: Home, label: 'Home', path: '/home', active: false },
            { icon: HistoryIcon, label: 'History', path: '/history', active: true },
            { icon: User, label: 'Profile', path: '/profile', active: false },
          ].map(({ icon: Icon, label, path, active }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default History;

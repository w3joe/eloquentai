import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, History, User, LogOut, BookOpen, Trophy, Clock } from 'lucide-react';
import { getProfile, getSessions, clearAll } from '@/lib/storage';
import { LANGUAGES } from '@/lib/types';

const Profile = () => {
  const navigate = useNavigate();
  const profile = getProfile();
  const sessions = getSessions();

  const langLabel = (code: string) => {
    const lang = LANGUAGES.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.name}` : code;
  };

  const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.fluencyScore, 0) / sessions.length)
    : 0;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  };

  const handleReset = () => {
    clearAll();
    navigate('/onboarding');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 max-w-lg mx-auto w-full p-4 pb-24 flex items-center justify-center">
          <div className="text-center space-y-4">
            <User className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-sm">No profile found</p>
            <Button onClick={() => navigate('/onboarding')}>Set up profile</Button>
          </div>
        </main>
        <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border">
          <div className="max-w-lg mx-auto flex justify-around py-3">
            {[
              { icon: Home, label: 'Home', path: '/home', active: false },
              { icon: History, label: 'History', path: '/history', active: false },
              { icon: User, label: 'Profile', path: '/profile', active: true },
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
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 max-w-lg mx-auto w-full p-4 pb-24 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 text-center space-y-2"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <span className="text-2xl font-bold text-primary">
              {profile.display_name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground">{profile.display_name}</h1>
          <p className="text-sm text-muted-foreground">{profile.profession || 'Language learner'}</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card className="border-0 bg-card">
            <CardContent className="p-3 text-center">
              <BookOpen className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{sessions.length}</p>
              <p className="text-[10px] text-muted-foreground">Sessions</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-card">
            <CardContent className="p-3 text-center">
              <Trophy className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{avgScore}</p>
              <p className="text-[10px] text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-card">
            <CardContent className="p-3 text-center">
              <Clock className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{formatTime(totalTime)}</p>
              <p className="text-[10px] text-muted-foreground">Practice</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-card">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target language</span>
                <span className="text-foreground font-medium">{langLabel(profile.target_language)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Native language</span>
                <span className="text-foreground font-medium">{langLabel(profile.native_language)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Level</span>
                <Badge variant="secondary" className="text-xs">{profile.level}</Badge>
              </div>
              {profile.interests.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Interests</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((interest, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{interest}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.bio && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Bio</span>
                  <p className="text-sm text-foreground">{profile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <Button
          variant="destructive"
          className="w-full gap-2"
          onClick={handleReset}
        >
          <LogOut className="h-4 w-4" /> Reset Profile
        </Button>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border">
        <div className="max-w-lg mx-auto flex justify-around py-3">
          {[
            { icon: Home, label: 'Home', path: '/home', active: false },
            { icon: History, label: 'History', path: '/history', active: false },
            { icon: User, label: 'Profile', path: '/profile', active: true },
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

export default Profile;

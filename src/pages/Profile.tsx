import { useState } from 'react';
import { ArrowLeft, User, Mail, LogOut, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('Food Lover');

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-card-foreground">Profile</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="p-2"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Profile Card */}
          <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary-foreground" />
              </div>
              {isEditing ? (
                <div className="space-y-2 w-full">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="text-center"
                  />
                </div>
              ) : (
                <h2 className="text-xl font-semibold text-card-foreground">{displayName}</h2>
              )}
            </div>

            {/* User Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-xl">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="text-card-foreground">{user?.email}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {isEditing ? (
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSave}
                    className="gradient-primary text-primary-foreground border-0 flex-1"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={signOut}
                  variant="outline"
                  className="w-full flex items-center space-x-2 text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
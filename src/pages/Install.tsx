import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Check, Smartphone, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold">Install SwipeN'Bite</h1>
          
          {isInstalled ? (
            <>
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <p className="text-lg font-medium">App already installed!</p>
              </div>
              <p className="text-muted-foreground">
                SwipeN'Bite is installed on your device and ready to use offline.
              </p>
              <Link to="/">
                <Button className="w-full gap-2">
                  <Home className="w-4 h-4" />
                  Go to Home
                </Button>
              </Link>
            </>
          ) : isInstallable ? (
            <>
              <p className="text-muted-foreground">
                Install SwipeN'Bite on your device for the best experience. Access your favorite restaurants offline!
              </p>
              
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    1
                  </div>
                  <p className="text-sm">Works offline - Access menus and favorites without internet</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    2
                  </div>
                  <p className="text-sm">Faster loading - Instant access like a native app</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    3
                  </div>
                  <p className="text-sm">Home screen icon - Launch directly from your device</p>
                </div>
              </div>

              <Button onClick={handleInstallClick} className="w-full gap-2" size="lg">
                <Download className="w-5 h-5" />
                Install App
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                To install SwipeN'Bite on your device:
              </p>
              
              <div className="space-y-4 text-left">
                <div>
                  <h3 className="font-semibold mb-2">On iPhone/iPad (Safari):</h3>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Tap the Share button at the bottom</li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" in the top right</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">On Android (Chrome):</h3>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Tap the menu (three dots) in the top right</li>
                    <li>Tap "Add to Home screen"</li>
                    <li>Tap "Add"</li>
                  </ol>
                </div>
              </div>

              <Link to="/">
                <Button variant="outline" className="w-full gap-2">
                  <Home className="w-4 h-4" />
                  Go to Home
                </Button>
              </Link>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the deferredPrompt so it can only be used once.
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-yellow-500 text-black flex items-center justify-between mx-4 mb-4 rounded-lg shadow-lg">
      <div className="flex-1 font-medium">Instalar LexIA</div>
      <div className="flex gap-2">
        <button 
          onClick={() => setShowBanner(false)} 
          className="px-3 py-1 text-sm bg-black/10 hover:bg-black/20 rounded font-medium transition-colors"
        >
          Agora Não
        </button>
        <button 
          onClick={handleInstallClick} 
          className="px-4 py-1 text-sm bg-black text-yellow-500 hover:bg-zinc-900 rounded font-medium transition-colors"
        >
          Instalar
        </button>
      </div>
    </div>
  );
}

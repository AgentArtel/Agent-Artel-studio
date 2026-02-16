import React from 'react';

interface PlayGameProps {
  onNavigate?: (page: string) => void;
}

export const PlayGame: React.FC<PlayGameProps> = () => {
  return (
    <div className="h-screen w-full flex flex-col bg-dark">
      <iframe
        src="https://codecamp-artel-mmorpg-production.up.railway.app"
        className="flex-1 w-full border-0"
        title="OpenClaw MMORPG"
        allow="fullscreen; autoplay; clipboard-write"
        allowFullScreen
      />
    </div>
  );
};

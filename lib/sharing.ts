import { env } from './env';

export interface ShareData {
  type: 'game_win' | 'achievement' | 'leaderboard' | 'challenge';
  gameId?: number;
  prize?: string;
  accuracy?: number;
  gamesPlayed?: number;
  totalWinnings?: string;
  position?: number;
  achievement?: string;
}

export function generateShareText(data: ShareData): string {
  const appUrl = env.NEXT_PUBLIC_URL;

  switch (data.type) {
    case 'game_win':
      return `🎉 Guess What?! I just won ${data.prize} ETH in this game! Craaazy! Play with me here: ${appUrl}`;

    case 'achievement':
      return `🏆 Unlocked "${
        data.achievement
      }" in Guess What?! My accuracy: ${data.accuracy?.toFixed(
        1
      )}%. Challenge me: ${appUrl}`;

    case 'leaderboard':
      return `📈 I'm #${data.position} on the Guess What? leaderboard! ${
        data.gamesPlayed
      } games, ${data.accuracy?.toFixed(
        1
      )}% win rate. Can you beat me? ${appUrl}`;

    case 'challenge':
      return `🧠 Think you're smart? Try to guess the word connecting these two words in Guess What?! ${appUrl}`;

    default:
      return `🧠 Playing Guess What? - the word game for smart people! Can you guess the connecting word? ${appUrl}`;
  }
}

export function generateShareUrl(data: ShareData): string {
  const appUrl = env.NEXT_PUBLIC_URL;

  switch (data.type) {
    case 'game_win':
      return `${appUrl}/game?win=${data.gameId}&prize=${data.prize}`;

    case 'achievement':
      return `${appUrl}/achievement?badge=${data.achievement}`;

    case 'leaderboard':
      return `${appUrl}/leaderboard?position=${data.position}`;

    case 'challenge':
      return `${appUrl}/game?challenge=true`;

    default:
      return appUrl;
  }
}

export function generateOgImageUrl(data: ShareData): string {
  const appUrl = env.NEXT_PUBLIC_URL;

  switch (data.type) {
    case 'game_win':
      return `${appUrl}/api/og/game-win?gameId=${data.gameId}&prize=${data.prize}&player=${data.gameId}`;

    case 'achievement':
      return `${appUrl}/api/og/achievement?badge=${data.achievement}&accuracy=${data.accuracy}`;

    case 'leaderboard':
      return `${appUrl}/api/og/leaderboard?position=${data.position}&games=${data.gamesPlayed}`;

    default:
      return `${appUrl}/images/feed.png`;
  }
}

export async function shareToWarpcast(data: ShareData): Promise<void> {
  const shareText = generateShareText(data);
  const shareUrl = generateShareUrl(data);

  // Create the share URL with the text and link
  const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
    shareText
  )}`;

  // Open in new tab/window
  window.open(warpcastUrl, '_blank', 'noopener,noreferrer');
}

export function createShareButton(
  data: ShareData,
  className: string = 'w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200'
) {
  return {
    onClick: () => shareToWarpcast(data),
    className,
    children: '🎉 Share to Warpcast',
  };
}

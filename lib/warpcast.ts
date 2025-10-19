import { env } from '@/lib/env';

/**
 * Get the farcaster manifest for the frame, generate yours from Warpcast Mobile
 *  On your phone to Settings > Developer > Domains > insert website hostname > Generate domain manifest
 * @returns The farcaster manifest for the frame
 */
export async function getFarcasterManifest() {
  let frameName = 'Guess What?';
  let noindex = false;
  const appUrl = env.NEXT_PUBLIC_URL;
  if (appUrl.includes('localhost')) {
    frameName += ' Local';
    noindex = true;
  } else if (appUrl.includes('ngrok')) {
    frameName += ' NGROK';
    noindex = true;
  } else if (appUrl.includes('https://dev.')) {
    frameName += ' Dev';
    noindex = true;
  }
  return {
    accountAssociation: {
      header: env.NEXT_PUBLIC_FARCASTER_HEADER,
      payload: env.NEXT_PUBLIC_FARCASTER_PAYLOAD,
      signature: env.NEXT_PUBLIC_FARCASTER_SIGNATURE,
    },
    frame: {
      version: '1',
      name: frameName,
      iconUrl: `${appUrl}/images/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/images/feed.png`,
      buttonTitle: `Launch App`,
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: '#FFFFFF',
      webhookUrl: `${appUrl}/api/webhook`,
      // Metadata https://github.com/farcasterxyz/miniapps/discussions/191
      subtitle: 'Only for smart people!', // 30 characters, no emojis or special characters, short description under app name
      description:
        'In this game you will need to guess the word in the middle that has something to do with the other two words.', // 170 characters, no emojis or special characters, promotional message displayed on Mini App Page
      primaryCategory: 'social',
      tags: ['mini-app', 'game', 'brain', 'challenge', 'fun'], // up to 5 tags, filtering/search tags
      tagline: "Guess What? You'll Love It!", // 30 characters, marketing tagline should be punchy and descriptive
      ogTitle: `${frameName}`, // 30 characters, app name + short tag, Title case, no emojis
      ogDescription: 'You will have fun to guess words and test your brain!', // 100 characters, summarize core benefits in 1-2 lines
      screenshotUrls: [
        // 1284 x 2778, visual previews of the app, max 3 screenshots
        `${appUrl}/images/feed.png`,
      ],
      heroImageUrl: `${appUrl}/images/feed.png`, // 1200 x 630px (1.91:1), promotional display image on top of the mini app store
      ogImageUrl: `${appUrl}/images/feed.png`, // 1200 x 630px (1.91:1), promotional image, same as app hero image
      noindex: noindex,
    },
    baseBuilder: {
      ownerAddress: '0x970E0306d80732f0e5D641e91E04e00cB72e49FF',
    },
  };
}

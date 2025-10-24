import { env } from '@/lib/env';
import { loadGoogleFont, loadImage } from '@/lib/og-utils';
import { ImageResponse } from 'next/og';

// Force dynamic rendering to ensure fresh image generation on each request
export const dynamic = 'force-dynamic';

// Define the dimensions for the generated OpenGraph image
const size = {
  width: 1200,
  height: 630,
};

/**
 * GET handler for generating dynamic OpenGraph images for game wins
 * @param request - The incoming HTTP request
 * @returns ImageResponse - A dynamically generated image for OpenGraph
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const prize = searchParams.get('prize');
    const playerAddress = searchParams.get('player');

    // Get the application's base URL from environment variables
    const appUrl = env.NEXT_PUBLIC_URL;

    // Load the logo image from the public directory
    const logoImage = await loadImage(`${appUrl}/images/icon.png`);

    // Load and prepare the custom font
    const fontData = await loadGoogleFont(
      'Inter:wght@400;600;700;800',
      'Guess What? Won ETH'
    );

    // Generate and return the image response with the composed elements
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '60px',
            gap: '30px',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            }}
          />

          {/* Logo */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              backgroundImage: `url(data:image/png;base64,${Buffer.from(
                logoImage
              ).toString('base64')})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '20px',
            }}
          >
            {/* Title */}
            <div
              style={{
                fontSize: '64px',
                fontWeight: '800',
                color: 'white',
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                lineHeight: '1.1',
              }}
            >
              🎉 You Won!
            </div>

            {/* Prize Amount */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: '700',
                color: '#FFD700',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                background: 'rgba(255,255,255,0.1)',
                padding: '20px 40px',
                borderRadius: '20px',
                border: '2px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {prize} ETH
            </div>

            {/* Game Info */}
            <div
              style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Game #{gameId} • Guess What?
            </div>

            {/* Call to Action */}
            <div
              style={{
                fontSize: '20px',
                fontWeight: '400',
                color: 'rgba(255,255,255,0.8)',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                marginTop: '20px',
              }}
            >
              Can you beat this score?
            </div>
          </div>

          {/* Bottom Branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              fontSize: '18px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.7)',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Built on Base
          </div>
        </div>
      ),
      {
        ...size,
        // Configure the custom font for use in the image
        fonts: [
          {
            name: 'Inter',
            data: fontData,
            style: 'normal',
          },
        ],
      }
    );
  } catch (e) {
    console.error('Failed to generate game win image:', e);
    return new Response(`Failed to generate game win image`, {
      status: 500,
    });
  }
}

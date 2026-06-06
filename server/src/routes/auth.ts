import { Router } from 'express';
import axios from 'axios';
import { adminAuth, adminDb } from '../lib/firebase-admin';

const router = Router();

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

router.get('/discord', (req, res) => {
  if (!DISCORD_CLIENT_ID || !DISCORD_REDIRECT_URI) {
    return res.status(500).json({ error: 'Discord Client ID or Redirect URI is missing from configuration.' });
  }

  const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    DISCORD_REDIRECT_URI
  )}&response_type=code&scope=identify%20email`;

  return res.redirect(oauthUrl);
});

router.get('/discord/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code from Discord redirect.' });
  }

  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI) {
    return res.status(500).json({ error: 'OAuth configurations are missing.' });
  }

  try {
    // 1. Exchange code for Discord Token
    const params = new URLSearchParams();
    params.append('client_id', DISCORD_CLIENT_ID);
    params.append('client_secret', DISCORD_CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code as string);
    params.append('redirect_uri', DISCORD_REDIRECT_URI);

    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = tokenResponse.data.access_token;

    // 2. Fetch user information
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const discordUser = userResponse.data;
    const { id: discordId, username, email, avatar: avatarHash } = discordUser;

    // Construct avatar CDN URL
    let avatarUrl = null;
    if (avatarHash) {
      avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png`;
    } else {
      // Default avatar based on discriminator or id
      const defaultAvatarNum = (BigInt(discordId) >> 22n) % 6n;
      avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNum}.png`;
    }

    const uid = `discord:${discordId}`;

    // 3. Mint custom Firebase Auth token
    const customToken = await adminAuth.createCustomToken(uid);

    // 4. Update user profile in Realtime DB (safeguarding existing role)
    const userRef = adminDb.ref(`users/${uid}`);
    const existing = await userRef.once('value');
    const updatedAt = Date.now();

    await userRef.update({
      uid,
      discordId,
      username,
      email: email || null,
      avatar: avatarUrl,
      updatedAt,
      ...(!existing.exists() && { role: 'USER', createdAt: Date.now() }),
    });

    // 5. Redirect client with the token
    return res.redirect(`${CLIENT_URL}/auth/callback#token=${customToken}`);
  } catch (error: any) {
    console.error('Error during Discord OAuthCallback:', error?.response?.data || error);
    return res.redirect(`${CLIENT_URL}/auth/callback#error=oauth_failure`);
  }
});

export default router;

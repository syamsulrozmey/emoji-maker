# 🚀 Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get Replicate API Token

1. Go to [https://replicate.com](https://replicate.com)
2. Sign up or log in to your account
3. Navigate to [Account Settings → API Tokens](https://replicate.com/account/api-tokens)
4. Click "Create token" or copy your existing token
5. Copy the token (it starts with `r8_`)

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

2. Open `.env.local` and add your token:

```env
REPLICATE_API_TOKEN=r8_your_actual_token_here
```

⚠️ **Important**: Never commit your `.env.local` file to version control!

## Step 4: Run the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Step 5: Generate Your First Emoji! 🎉

1. Enter a prompt like "Astro cat surfing"
2. Click "Generate custom emoji"
3. Wait a few seconds for the AI to create your emoji
4. Hover over the emoji to download or like it

## Troubleshooting

### "Failed to generate emoji" error

- **Check your API token**: Make sure it's correctly set in `.env.local`
- **Check token validity**: Verify the token hasn't expired on Replicate
- **Restart dev server**: After changing `.env.local`, restart with `npm run dev`

### Emojis not persisting

- **Check localStorage**: Make sure your browser allows localStorage
- **Clear browser cache**: Try clearing cache if emojis appear corrupted

### Build errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

## Production Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variable `REPLICATE_API_TOKEN` in project settings
4. Deploy!

### Environment Variables for Production

Make sure to set these in your production environment:

- `REPLICATE_API_TOKEN`: Your Replicate API token

## Optional: Add Your Own Features

### Add Supabase for persistent storage:
```bash
npm install @supabase/supabase-js
```

### Add Clerk for authentication:
```bash
npm install @clerk/nextjs
```

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review [Replicate SDXL Emoji docs](https://replicate.com/fofr/sdxl-emoji)
- Check [Next.js documentation](https://nextjs.org/docs)

Happy emoji making! 🎨✨


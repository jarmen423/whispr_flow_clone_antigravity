# Whispr Flow Mobile PWA

Standalone mobile PWA for voice dictation to Chromebook via Firebase.

## Deploy to Vercel

### Option 1: Deploy from mobile-pwa subdirectory

```bash
cd mobile-pwa
npx vercel --prod
```

### Option 2: Deploy from root with subfolder

```bash
npx vercel --prod --cwd mobile-pwa
```

### Environment Variables

Set these in Vercel Dashboard (Project Settings → Environment Variables):

| Name | Value | Source |
|------|-------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase API Key | firebase-config.json |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com | firebase-config.json |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | https://...firebaseio.com | firebase-config.json |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | your-project-id | firebase-config.json |

Or run locally with env vars:
```bash
cd mobile-pwa
export NEXT_PUBLIC_FIREBASE_API_KEY=your_key
export NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_url
bun install
bun run dev
```

## File Structure

```
mobile-pwa/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main PWA page
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   └── ios-install-prompt.tsx # iOS install prompt
│   ├── components/ui/            # shadcn/ui components
│   └── lib/
│       └── utils.ts              # Utility functions
├── public/                       # Static assets
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Usage

1. Deploy to Vercel
2. Open the deployed URL on your phone
3. Add to home screen (iOS Safari → Share → Add to Home Screen)
4. Enter your Groq API key
5. Device ID is auto-generated or enter manually
6. Record audio → Text appears on Chromebook via Firebase

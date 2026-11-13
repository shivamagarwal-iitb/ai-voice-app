# Setup — iPhone-first AI Voice App

## 1. Supabase
Create a Supabase project at https://supabase.com/dashboard. In SQL Editor, execute `supabase/schema.sql`. Turn on your desired authentication provider in Supabase Auth.

## 2. OpenAI
Create a separate project at https://platform.openai.com/ and generate a project API key. Configure billing and a sensible project spending limit. Do not paste the key into ChatGPT, GitHub, or any EXPO_PUBLIC variable.

## 3. Backend
Deploy the `server/` directory as a Node.js web service (for example on Render). Build command: `npm install`; start command: `npm start`. Configure the variables in `server/.env.example` as **secret environment variables** in the hosting dashboard. The backend currently implements authenticated search, AI classification, and short-lived Realtime client secret issuance. It does not yet connect voice sessions to memory mutation tools.

## 4. App
The current Expo app is a local-first prototype. Supabase login and cloud sync UI have not yet been wired into it. Expo Go can preview basic UI and audio recording, but full low-latency realtime audio may require a custom development build.

## Security
The backend validates Supabase bearer tokens. Database row-level security restricts each user's records. Never commit credentials or personal notes. For production, tighten CORS, add request size and cost controls, and review all AI actions before enabling writes.

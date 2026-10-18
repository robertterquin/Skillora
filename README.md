# Skillora — The Deliberate Learning Engine

<div align="center">
  <img src="public/logo.svg" alt="Skillora Learning Owl" width="80" height="80" />
  <h3>Master Anything, Large or Small</h3>
  <p>An intentional, minimalist micro-learning SaaS inspired by Swiss modernist editorial design.</p>
</div>

---

## Overview

**Skillora** breaks down music, languages, tactile crafts, everyday hobbies, and digital workflows into structured, manageable steps with realistic time horizons, vetted external platforms, and interactive AI-powered deliberate practice.

### Key Pillars
- **Minimalist Aesthetic**: High-signal, typography-driven editorial design with zero unicode emojis, one icon set (Lucide via `AppIcon`), and a warm linen canvas (`#F7F5F0`).
- **Strict Information Architecture**:
  - **Ask Archimedes (`/library`)**: A chat with Archimedes, the interactive learning owl. Speak via microphone or chat to summon any skill in the universe; the Owl deconstructs it and dispatches it straight to My Studio.
  - **Studio (`/dashboard`)**: Your personal repertoire housing all your summoned skills, complete with real-time Category (Music, Languages, Crafts, Tech), Duration, and Search filters, streak tracking, daily 15-minute workouts, and 3D flashcards.
- **Interactive 3D Flashcard Hub**:
  - Tactile 3D card flips with custom visual diagram aids (Cyrillic alphabet tiles, Guitar P-I-M-A finger anchor guide, 15° knife sharpening coin gauge, tactile home row keycaps, 1:2 espresso extraction dial).
  - Native Web Speech audio pronunciation (Russian `ru-RU`, English `en-US`).
  - Dual mode switcher: Flashcards (active recall) vs. Checklist (sequential step execution).
- **5 Deep OpenAI Learning Integrations**:
  1. **On-Demand Skill Deconstructor**: Type any craft or discipline in the world; OpenAI synthesizes an authentic step-by-step curriculum in seconds and adds it to your studio.
  2. **The Practice Room Technique Coach**: Diagnoses biomechanical friction and provides a physical muscle memory anchor and a 3-minute corrective drill.
  3. **Whisper Voice Pronunciation Grader**: Microphone voice recording transcribed with Whisper and graded with phonetics coaching feedback.
  4. **Mnemonic & Mental Model Generator**: Vivid mental hooks and bodily anchors to memorize foreign scripts or tricky motor patterns.
  5. **Daily 15-Minute Studio Workout Routine**: Analyzes your active enrolled skills to design a timed daily cross-training session.

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Iconography**: [Lucide](https://lucide.dev/) via the `AppIcon` wrapper (`src/components/ui/AppIcon.tsx`)
- **Avatars**: [DiceBear Notionists](https://www.dicebear.com/) via `@dicebear/core` & `@dicebear/collection`
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security and triggers)
- **AI Engine**: [OpenAI](https://openai.com/) (GPT-4o-mini & Whisper-1)

---

## Design System

Tokens live in `tailwind.config.ts`. Use them instead of raw Tailwind colours (`stone-*`, `rose-*`, etc.) or hex values.

| Purpose | Tokens |
|---|---|
| Page & surfaces | `canvas`, `surface`, `surface-subtle`, `surface-muted`, `surface-border`, `paper` |
| Text | `ink`, `ink-secondary`, `ink-muted`, `ink-subtle` (all pass WCAG AA on canvas and white) |
| Brand accent | `accent-vermilion` (+ `-hover`, `-light`, `-border`) |
| States | `success`, `warning`, `danger`, `info` — each with `hover`, `strong`, `light`, `soft`, `border` |
| Dark surfaces | `night` (+ `raised`, `line`, `hover`, `text`, `muted`, `subtle`) |
| Categories | `deck-music`, `deck-languages`, `deck-life`, `deck-tech` |

Rules of thumb:
- Smallest text is `text-xs` (12px). Don't add smaller sizes.
- Use the shared components in `src/components/ui`: `Button` / `buttonClasses`, `IconButton`, `SegmentedControl`, `Input` + `Field`, `EmptyState`, `Badge`, `Card`, `Modal`.
- Naming: **Studio** (dashboard), **Ask Archimedes** (AI chat), **Certificates** (earned credentials), **Assessment** (the final exam).

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/robertterquin/Skillora.git
cd Skillora
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env` and fill in your Supabase and OpenAI keys:
```bash
cp .env.example .env
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. Database Setup
Run these in your **Supabase Dashboard → SQL Editor**, in this order (each is safe to re-run):
1. [`schema.sql`](supabase/schema.sql): core tables, profile trigger, read access
2. [`seed.sql`](supabase/seed.sql): categories and the built-in skill catalog
3. [`allow_skill_creation_and_enrollment.sql`](supabase/allow_skill_creation_and_enrollment.sql): enrollment rules
4. [`create_user_certifications.sql`](supabase/create_user_certifications.sql), [`create_user_practice_stats.sql`](supabase/create_user_practice_stats.sql), [`create_owl_consultations.sql`](supabase/create_owl_consultations.sql)
5. [`secure_skills.sql`](supabase/secure_skills.sql): skill owners and owner-only writes (**required** after `schema.sql`)
6. [`harden_functions.sql`](supabase/harden_functions.sql): locks down the sign-up trigger function
7. [`create_user_step_notes.sql`](supabase/create_user_step_notes.sql), [`create_reminder_preferences.sql`](supabase/create_reminder_preferences.sql), [`create_resource_feedback.sql`](supabase/create_resource_feedback.sql)
8. [`share_certificates.sql`](supabase/share_certificates.sql): shareable certificate links
9. [`create_progress_photos.sql`](supabase/create_progress_photos.sql): private photo storage bucket and table
10. [`optimize_rls_policies.sql`](supabase/optimize_rls_policies.sql): faster row-level-security checks (`(select auth.uid())`)
11. [`create_ai_usage.sql`](supabase/create_ai_usage.sql): daily AI request counter behind the per-learner limit (`AI_DAILY_LIMIT`, default 100)

With the Supabase CLI linked to the project you can run any of them with
`supabase db query --linked -f supabase/<file>.sql`.

### Email reminders and weekly recap (optional)
Learners turn these on in **Settings**. A Supabase edge function sends them through [Resend](https://resend.com) every 15 minutes:
1. In Resend, verify your sending domain and create an API key.
2. Deploy the function: `supabase functions deploy reminders`
3. Set its secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=re_... EMAIL_FROM="Skillora <hello@your-domain>" SITE_URL=https://your-site CRON_SECRET=<long random string>
   ```
4. Enable the `pg_cron` and `pg_net` extensions (Database → Extensions), fill in `<project-ref>` and `<cron-secret>` in [`supabase/schedule_reminders.sql`](supabase/schedule_reminders.sql), and run it.

Reminders are skipped on days the learner has already practised. Every email has a one-click unsubscribe link (`/unsubscribe`), which uses `SUPABASE_SERVICE_ROLE_KEY` on the Next.js server.

### 5. Run development server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## License
MIT

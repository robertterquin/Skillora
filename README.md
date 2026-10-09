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
- **Minimalist Aesthetic**: High-signal, typography-driven Swiss design with zero unicode emojis, unified Solar Linear iconography, and warm linen canvas (`#FAFAFA`).
- **Strict Information Architecture**:
  - **The Learning Owl Oracle (`/library`)**: The Skill Library is anchored by a large, interactive Learning Owl character. Speak via microphone or chat to summon any skill in the universe; the Owl deconstructs it and dispatches it straight to My Studio.
  - **My Studio Workshop (`/dashboard`)**: Your personal repertoire housing all your summoned skills, complete with real-time Category (Music, Languages, Crafts, Tech), Duration, and Search filters, streak tracking, daily 15-minute workouts, and 3D flashcards.
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
- **Iconography**: [Solar Linear Icons](https://icon-sets.iconify.design/?query=solar) via `@iconify/react`
- **Avatars**: [DiceBear Big Smile](https://www.dicebear.com/) via `@dicebear/core` & `@dicebear/collection`
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security and triggers)
- **AI Engine**: [OpenAI](https://openai.com/) (GPT-4o-mini & Whisper-1)

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
Run the SQL migration in your **Supabase Dashboard $\rightarrow$ SQL Editor**:
1. Execute [`supabase/schema.sql`](supabase/schema.sql) (creates tables, RLS policies, and user profile sync trigger).
2. Execute [`supabase/seed.sql`](supabase/seed.sql) (seeds initial disciplines, sequential steps, and vetted platform links).

### 5. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## License
MIT

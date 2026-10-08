# ProdCraft — All-in-One Product Management Platform

An end-to-end platform for Product Managers featuring:
1. **PM Community Hub**: Insight sharing, framework discussions, upvotes, and categorization.
2. **AI PM Term Tutor**: Instant concept & framework explainer (RICE, NSM, Kano, PLG, CAC/LTV) with interview tips and real-world examples.
3. **Verified PM Job Board**: Filterable by seniority (APM to VP), domain (AI, SaaS, Fintech), salary, and workplace mode.
4. **PM Fit Diagnostic Assessment**: 5-dimension situational judgment test that calculates fit score, PM archetype, and personalized skill breakdown.

---

## 🛠️ How to Connect This Project to Your IDE

### 1. In Antigravity IDE
1. Go to the top menu: **File → Open Folder...**
2. Select the directory:
   ```
   /Users/rj/.gemini/antigravity/scratch/pm-platform
   ```
3. Set this folder as your active workspace to use inline agent lenses, chat, and autocomplete directly in this codebase.

### 2. In VS Code or Cursor
Open your terminal and run:
```bash
code /Users/rj/.gemini/antigravity/scratch/pm-platform
# or for Cursor:
cursor /Users/rj/.gemini/antigravity/scratch/pm-platform
```

---

## 🚀 Running the Platform

1. Navigate to the project directory:
   ```bash
   cd /Users/rj/.gemini/antigravity/scratch/pm-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set up your OpenAI API key for live GPT-4o-mini generation:
   ```bash
   cp .env.example .env.local
   # Add your key: OPENAI_API_KEY=sk-...
   ```
   *(Note: The platform includes an intelligent offline PM knowledge fallback if no key is provided, so you can test immediately without any API key.)*

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
pm-platform/
├── src/
│   ├── app/
│   │   ├── api/ai-tutor/route.ts  # Next.js API route for OpenAI PM Tutor
│   │   ├── globals.css            # Tailwind CSS directives
│   │   ├── layout.tsx             # Root layout with fonts & metadata
│   │   └── page.tsx               # Main dashboard with tabbed navigation
│   ├── components/
│   │   ├── Navbar.tsx             # Navigation header
│   │   ├── CommunityFeed.tsx      # Community discussions, posts, upvotes
│   │   ├── AiPmTutor.tsx          # Glossary, search, formula & interview tips
│   │   ├── JobBoard.tsx           # Product manager job board with filters
│   │   └── AssessmentQuiz.tsx     # Situational judgment test & diagnostic engine
│   ├── data/
│   │   └── mockData.ts            # Preloaded seed posts, concepts, jobs & questions
│   └── types/
│       └── index.ts               # Core TypeScript interfaces
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

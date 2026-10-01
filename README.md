# MyriMaven · Career Exploration Sandbox

> **Explore careers. Find your path. With an AI guide that explains why.**

MyriMaven is an AI-guided career exploration sandbox built for students and career seekers. It matches authentic strengths, interests, and work preferences to real-world roles without pigeonholing users into rigid boxes.

---

## 🌟 Key Features

* **AI Career Matching**: Analyzes curiosity areas, strengths (1–5 scale), and work styles to suggest high-leverage roles.
* **Transparent Match Scores**: Clear explanations for why careers fit (and honest tradeoffs / watch outs) rather than opaque black-box scores.
* **What-If Exploration Sandbox**: Real-time simulation engine that lets you toggle priorities (Work-Life Balance, Helping Others, High Income, Stability) and watch the career landscape reshuffle with live delta indicators (`+18%`, `-12%`, `NEW MATCH`).
* **Maya, Your AI Guide**: Always-accessible conversational drawer to ask honest questions about daily routines, workplace culture, stress points, and comparisons.
* **Side-by-Side Comparison**: Multi-role comparative matrix across skills, environments, tradeoffs, and educational paths.
* **14-Screen Interactive Prototype Switcher**: A quick bottom switcher bar to preview all 14 Banani UI mockup flows instantly.

---

## 🚀 Getting Started Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.18 or higher recommended)
* `npm` (comes with Node.js)

### Installation

1. Clone or extract this repository to your computer:
   ```bash
   git clone https://github.com/YOUR_USERNAME/myrimaven-app.git
   cd myrimaven-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🏗️ Project Architecture

```
myrimaven-app/
├── public/                 # Static assets & icons
├── src/
│   ├── app/
│   │   ├── globals.css     # Design system & tokens (vanilla CSS, no Tailwind)
│   │   ├── layout.tsx      # Root HTML layout and metadata
│   │   └── page.tsx        # Main application page & view orchestration
│   ├── components/
│   │   ├── Navbar.tsx             # Navigation bar with branding & quick links
│   │   ├── Footer.tsx             # Footer component
│   │   ├── MayaDrawer.tsx         # AI Guide floating trigger & chat drawer
│   │   ├── PrototypeNav.tsx       # 14-screen interactive switcher bar
│   │   ├── LandingView.tsx        # Screen 01: Hero & feature highlights
│   │   ├── OnboardingView.tsx     # Screens 02–07: Step-by-step onboarding
│   │   ├── RecommendationsView.tsx# Screen 08: Personalized match report
│   │   ├── CareerDetailView.tsx   # Screen 09: In-depth role breakdown
│   │   ├── ExploreView.tsx        # Screen 10: Career directory & filters
│   │   ├── SavedView.tsx          # Screen 11: Saved shortlist management
│   │   ├── CompareView.tsx        # Screen 12: Side-by-side comparison matrix
│   │   ├── DashboardView.tsx      # Screen 13: Student progress dashboard
│   │   └── WhatIfView.tsx         # Screen 14: What-If priority sandbox
│   ├── context/
│   │   └── CareerContext.tsx      # Central React Context state management
│   ├── data/
│   │   └── careersData.ts         # Career profiles, metrics, and starter data
│   └── types/
│       └── career.ts              # TypeScript schemas and definitions
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📦 How to Import / Push to GitHub

### Option A: Using Git CLI (Recommended)

1. Open your terminal in this directory:
   ```bash
   cd "c:\Users\haley\OneDrive\Desktop\MRU - Year 3\ENTR 3360 - How Technology Enables Innovation\myrimaven-app"
   ```

2. Initialize git and stage all files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MyriMaven Next.js Career Sandbox"
   ```

3. Create a new repository on [GitHub](https://github.com/new) (e.g. named `myrimaven-app`).

4. Link and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/myrimaven-app.git
   git push -u origin main
   ```

### Option B: Using GitHub Desktop
1. Open GitHub Desktop.
2. Click **File** > **Add Local Repository...**
3. Choose the `myrimaven-app` folder.
4. If prompted that it isn't a git repository, click **Create a Repository**.
5. Click **Publish repository** to push it to your GitHub account!

---

## 🛠️ Tech Stack
* **Framework**: Next.js 15+ (App Router)
* **Language**: TypeScript
* **Styling**: Vanilla CSS (TailwindCSS avoided for clean bespoke design control)
* **Icons**: `lucide-react`

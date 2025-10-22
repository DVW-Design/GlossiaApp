# GlossiaApp Setup Guide

**Date:** 2025-10-22
**Status:** ✅ **INITIAL SETUP COMPLETE**

---

## Overview

This guide covers the initial setup process for the GlossiaApp monorepo, including mobile app (React Native/Expo), backend server, and development tools.

---

## Prerequisites Fixed / To Fix

### ⚠️ NPM Cache Permission Issue

**Issue:** NPM cache contains root-owned files causing permission errors during installation.

**Fix Required:**
```bash
sudo chown -R 1031:20 "/Users/dave/.npm"
```

**Then run:**
```bash
cd /Users/Shared/htdocs/github/DVWDesign/GlossiaApp
npm install
```

---

## What Was Created

### 1. Repository Structure ✅

```
GlossiaApp/
├── .git/                   # Git repository initialized
├── .gitignore              # Comprehensive gitignore
├── README.md               # Project overview
├── CLAUDE.md               # Claude Code guidelines
├── package.json            # Root package with workspaces
│
├── mobile/                 # React Native/Expo app ✅
│   ├── src/
│   │   ├── domains/        # Domain-driven architecture
│   │   │   ├── translation/
│   │   │   ├── avatar/
│   │   │   ├── camera/
│   │   │   ├── recognition/
│   │   │   ├── auth/
│   │   │   └── learning/
│   │   ├── shared/         # Shared components
│   │   ├── api/            # API clients
│   │   ├── navigation/     # React Navigation
│   │   └── theme/          # Design system
│   ├── assets/
│   ├── tsconfig.json       # TypeScript config with path aliases
│   ├── metro.config.js     # Metro bundler config
│   └── package.json        # Mobile dependencies
│
├── server/                 # Node.js backend (TO BE CREATED)
│   └── package.json
│
├── shared/                 # Shared TypeScript types (TO BE CREATED)
│   └── types/
│
├── scripts/                # Build & deployment scripts
│
├── docs/                   # Documentation (ORGANIZED)
│   ├── 00-references/
│   ├── 01-project-management/
│   │   ├── user-stories/   # ✅ Existing docs moved here
│   │   ├── user-flows/     # ✅ Existing diagrams moved here
│   │   └── roles/          # ✅ Existing roles moved here
│   ├── 02-architecture/
│   │   └── diagrams/       # ✅ AI sequence diagram moved here
│   ├── 03-mobile/
│   │   └── ui-wireframes/  # ✅ Existing wireframes moved here
│   ├── 04-backend/
│   ├── 05-ml-ai/           # ✅ NLP framework moved here
│   ├── 06-design/
│   ├── 07-guides/          # ✅ This file
│   └── 08-api/
│
├── .claude/                # Claude Code configuration (TO BE CREATED)
│   ├── agents/
│   ├── commands/
│   └── settings.local.json
│
└── docs-original/          # ✅ Original docs backed up
    └── [all original files preserved]
```

---

## 2. Configuration Files Created ✅

### Root Level
- ✅ `.gitignore` - Comprehensive ignore rules
- ✅ `README.md` - Project overview and quickstart
- ✅ `CLAUDE.md` - Detailed development guidelines
- ✅ `package.json` - Monorepo workspace configuration

### Mobile App
- ✅ `tsconfig.json` - TypeScript with path aliases configured
- ✅ `metro.config.js` - Metro bundler configuration
- ✅ Domain structure created (translation, avatar, camera, etc.)

---

## 3. Path Aliases Configured ✅

**TypeScript (`mobile/tsconfig.json`):**
```json
{
  "@/*": ["src/*"],
  "@domains/*": ["src/domains/*"],
  "@shared/*": ["src/shared/*"],
  "@components/*": ["src/shared/components/*"],
  "@hooks/*": ["src/shared/hooks/*"],
  "@utils/*": ["src/shared/utils/*"],
  "@api/*": ["src/api/*"],
  "@navigation/*": ["src/navigation/*"],
  "@theme/*": ["src/theme/*"],
  "@assets/*": ["assets/*"]
}
```

**Usage:**
```typescript
// Clean imports
import { useSignRecognition } from '@domains/recognition/hooks/useSignRecognition';
import { SignButton } from '@components/SignButton';
import type { Sign } from '@shared/types/sign-language';
```

---

## 4. Documentation Organized ✅

### Existing Files Organized:

**Project Management:**
- ✅ `DeafSignerApp_UserStories.md` → `docs/01-project-management/user-stories/`
- ✅ `DeafSignerApp_ExtendedUserStories.md` → `docs/01-project-management/user-stories/`
- ✅ `DeafSignerApp_UserStories.csv` → `docs/01-project-management/user-stories/`
- ✅ `DeafSignerApp_UserFlow_VisualMap.svg` → `docs/01-project-management/user-flows/`
- ✅ `DeafSignerApp_UserRolesMap.{svg,pdf,jam}` → `docs/01-project-management/roles/`

**Architecture:**
- ✅ `AI_Agent_Interaction_Sequence.svg` → `docs/02-architecture/diagrams/`

**ML/AI:**
- ✅ `NLP_LSF_Mapping_Framework.md` → `docs/05-ml-ai/`

**Mobile UI:**
- ✅ `UI Wireframe.png` → `docs/03-mobile/ui-wireframes/`
- ✅ `DeafSignerApp_MobileUI_Avatar_Fallback.pdf` → `docs/03-mobile/ui-wireframes/`
- ✅ `image.png` → `docs/03-mobile/ui-wireframes/`

**Original Backup:**
- ✅ All original files preserved in `docs-original/`

---

## Next Steps

### 1. Fix NPM Permissions (REQUIRED) ⚠️

```bash
# Fix npm cache permissions
sudo chown -R 1031:20 "/Users/dave/.npm"

# Clear cache
npm cache clean --force

# Install all dependencies
cd /Users/Shared/htdocs/github/DVWDesign/GlossiaApp
npm install
```

---

### 2. Install Mobile App Dependencies

```bash
cd mobile
npm install

# Install additional dependencies for sign language app
npm install --save \
  @react-navigation/native \
  @react-navigation/native-stack \
  react-native-screens \
  react-native-safe-area-context \
  zustand \
  expo-camera \
  expo-av \
  @tensorflow/tfjs \
  @tensorflow/tfjs-react-native \
  react-native-reanimated \
  expo-three \
  three

# Install dev dependencies
npm install --save-dev \
  @types/three \
  @babel/plugin-proposal-export-namespace-from
```

---

### 3. Set Up Storybook

```bash
cd mobile
npx sb init --type react_native

# Configure path aliases in Storybook
# Edit .storybook/main.js to include path aliases
```

---

### 4. Create Backend Server

```bash
cd ../server
npm init -y
npm install --save \
  express \
  mongoose \
  passport \
  passport-jwt \
  bcrypt \
  dotenv \
  cors \
  helmet

npm install --save-dev \
  @types/express \
  @types/node \
  typescript \
  ts-node \
  nodemon \
  jest \
  supertest
```

---

### 5. Set Up Claude Code Configuration

**Create `.claude/` folder:**
```bash
cd /Users/Shared/htdocs/github/DVWDesign/GlossiaApp
mkdir -p .claude/{agents,commands}
```

**Copy agents from FigmailAPP:**
```bash
# Symlink to shared agents (if using @figma-core)
# Or copy specific agents needed for GlossiaApp
```

**Create custom commands:**
- `/translate` - Quick translation test
- `/avatar` - Test avatar rendering
- `/camera` - Test camera permissions

See: `docs/07-guides/CLAUDE-CODE-SETUP.md` (to be created)

---

### 6. Configure MCPs

#### Figma MCP (Design-to-Code)
```bash
claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp
```

#### MongoDB MCP (Database)
```bash
claude mcp add mongodb -- npx -y @mongodb-js/mongodb-mcp-server
```

#### Jira MCP (Project Management)
**Status:** To be configured
**Documentation:** `docs/07-guides/MCP-SETUP-JIRA.md` (to be created)

---

### 7. Set Up Project Management

#### Jira Configuration
1. Create Jira project: "GlossiaApp"
2. Set up board with columns:
   - Backlog
   - To Do
   - In Progress
   - In Review
   - Done
3. Import user stories from `docs/01-project-management/user-stories/`
4. Create epic for MVP

#### Team Communication
- **Discord/Slack:** Team chat channel
- **Notion:** Knowledge base (optional)
- **Figma:** Design collaboration

See: `docs/07-guides/PROJECT-MANAGEMENT-SETUP.md` (to be created)

---

### 8. Environment Variables

Create `.env` files:

**Mobile (`mobile/.env`):**
```bash
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_ML_API_URL=http://localhost:8000
EXPO_PUBLIC_OPENAI_API_KEY=your_key_here
```

**Server (`server/.env`):**
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/glossia
JWT_SECRET=your_secret_here
OPENAI_API_KEY=your_key_here
```

**⚠️ IMPORTANT:** Never commit `.env` files!

---

### 9. Start Development

```bash
# Terminal 1: Start mobile app
cd mobile
npm start

# Terminal 2: Start backend server (once created)
cd server
npm run dev

# Terminal 3: Start Storybook (optional)
cd mobile
npm run storybook
```

---

### 10. ML Model Setup

#### Download Pre-trained Models
```bash
# Create models directory
mkdir -p ml-models/sign-recognition

# Download LSF recognition model (placeholder)
# wget https://example.com/lsf-model.h5 -O ml-models/sign-recognition/lsf.h5
```

#### Train Custom Model
See: `docs/05-ml-ai/MODEL-TRAINING-GUIDE.md` (to be created)

---

## Verification Checklist

### Repository Setup
- ✅ Git repository initialized
- ✅ `.gitignore` configured
- ✅ Monorepo structure created
- ✅ Documentation organized

### Mobile App
- ✅ Expo app created with TypeScript
- ✅ Path aliases configured
- ✅ Domain structure created
- ⏳ Dependencies installed (pending npm fix)
- ⏳ Storybook configured
- ⏳ Initial components created

### Configuration
- ✅ `CLAUDE.md` created (comprehensive guidelines)
- ✅ `README.md` created
- ✅ Root `package.json` with workspaces
- ⏳ `.claude/` folder setup
- ⏳ MCP configurations

### Documentation
- ✅ Existing docs organized
- ✅ Folder structure created
- ⏳ Additional guides to be written

---

## Common Issues & Solutions

### Issue 1: NPM Permission Errors

**Error:**
```
EACCES: permission denied, rename...
Your cache folder contains root-owned files
```

**Solution:**
```bash
sudo chown -R 1031:20 "/Users/dave/.npm"
npm cache clean --force
```

---

### Issue 2: Expo CLI Not Found

**Error:**
```
expo: command not found
```

**Solution:**
```bash
npm install -g expo-cli
# Or use npx
npx expo start
```

---

### Issue 3: TypeScript Path Aliases Not Working

**Solution:**
1. Restart TypeScript server in IDE
2. Verify `tsconfig.json` has `baseUrl` and `paths`
3. Restart Metro bundler: `npm start -- --clear`

---

### Issue 4: Camera Permissions on iOS

**Solution:**
Add to `app.json`:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "GlossiaApp needs camera access to recognize sign language.",
        "NSMicrophoneUsageDescription": "GlossiaApp needs microphone access for voice translation."
      }
    }
  }
}
```

---

## Additional Resources

### Documentation To Be Created
- [ ] `docs/07-guides/CLAUDE-CODE-SETUP.md`
- [ ] `docs/07-guides/MCP-SETUP-JIRA.md`
- [ ] `docs/07-guides/PROJECT-MANAGEMENT-SETUP.md`
- [ ] `docs/05-ml-ai/MODEL-TRAINING-GUIDE.md`
- [ ] `docs/03-mobile/STORYBOOK-SETUP.md`
- [ ] `docs/04-backend/API-DESIGN.md`
- [ ] `docs/02-architecture/SYSTEM-ARCHITECTURE.md`

### External Resources
- **React Native:** https://reactnative.dev
- **Expo:** https://docs.expo.dev
- **TensorFlow.js:** https://www.tensorflow.org/js
- **Sign Language Datasets:** [To be added]

---

## Team Onboarding

### For Mobile Developer
1. Read `README.md`
2. Read `CLAUDE.md`
3. Review `docs/03-mobile/`
4. Complete setup steps 1-3
5. Start with Storybook component development

### For ML Engineer
1. Read `README.md`
2. Read `docs/05-ml-ai/`
3. Review existing NLP framework
4. Set up Python environment
5. Start model evaluation

### For Product Owner
1. Review user stories in `docs/01-project-management/`
2. Set up Jira board
3. Prioritize MVP features
4. Schedule sprint planning

---

## Status: Ready for Development ✅

**Completed:**
- ✅ Repository structure
- ✅ Mobile app scaffolding
- ✅ Documentation organization
- ✅ Configuration files
- ✅ Development guidelines

**Pending:**
- ⏳ NPM permissions fix
- ⏳ Dependencies installation
- ⏳ Storybook setup
- ⏳ Backend server creation
- ⏳ Claude Code configuration
- ⏳ MCP setup
- ⏳ Team onboarding

---

**Last Updated:** 2025-10-22
**Setup Completed By:** Claude Code (FigmailAPP instance)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

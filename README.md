# GlossiaApp

**Bidirectional Sign Language Translation Application**

GlossiaApp is a mobile-first application that enables real-time translation between spoken/written language and sign language, facilitating communication for deaf and hard-of-hearing individuals.

---

## 🎯 Core Features

### Phase 1 - MVP (iOS)
- **Sign to Text/Voice** - Camera-based sign language recognition → Text/Voice output
- **Voice/Text to Sign** - Voice/Text input → Animated signing avatar (mirrored)
- **Supported Languages:**
  - 🇫🇷 LSF (Langue des Signes Française)
  - 🇺🇸 ASL (American Sign Language)
  - 🇬🇧 BSL (British Sign Language)
- **Core Capabilities:**
  - Real-time camera processing
  - Geolocation services
  - Microphone access
  - AI/ML model inference
  - User identification & profiles

### Phase 2 - Extended Platform Support
- Android mobile app
- macOS desktop app
- Windows desktop app
- Web application

### Phase 3 - Advanced Features
- Multi-user video calls with sign language overlay
- Educational mode with learning modules
- Community-contributed sign variations
- Offline mode with on-device models

---

## 🏗️ Architecture

### Monorepo Structure

```
GlossiaApp/
├── mobile/              # React Native/Expo mobile app
│   ├── src/
│   │   ├── domains/     # Domain-driven architecture
│   │   │   ├── translation/
│   │   │   ├── avatar/
│   │   │   ├── camera/
│   │   │   └── auth/
│   │   ├── shared/      # Shared components
│   │   └── api/         # API clients
│   └── package.json
├── server/              # Node.js/Express backend
│   ├── src/
│   │   ├── api/         # REST/GraphQL APIs
│   │   ├── ml/          # ML model serving
│   │   └── services/    # Business logic
│   └── package.json
├── shared/              # Shared TypeScript types
│   └── types/
├── scripts/             # Build & deployment scripts
├── docs/                # Documentation
└── .claude/             # Claude Code configuration
```

---

## 🛠️ Technology Stack

### Mobile (React Native/Expo)
- **Framework:** React Native with Expo
- **Language:** TypeScript
- **UI Library:** React Native Paper / NativeBase
- **State Management:** Zustand / Redux Toolkit
- **Navigation:** React Navigation
- **Camera:** expo-camera
- **ML Integration:** TensorFlow.js / ONNX Runtime
- **Storybook:** React Native Storybook

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js / Fastify
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose) + PostgreSQL (optional)
- **AI/ML:** Python microservices (FastAPI)
- **Authentication:** JWT + OAuth2

### AI/ML Stack
- **Sign Recognition:** TensorFlow / PyTorch
- **NLP:** OpenAI GPT-4 / Claude API
- **Avatar Animation:** Three.js / Unity
- **Model Training:** Python + Jupyter notebooks
- **Model Serving:** TensorFlow Serving / ONNX Runtime

### DevOps & Tools
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Testing:** Jest, Detox (E2E), Pytest (Python)
- **Documentation:** Markdown + Storybook
- **Project Management:** Jira (via MCP)
- **Collaboration:** Discord / Notion / Slack
- **Design:** Figma (via MCP)
- **AI Assistant:** Claude Code with MCPs

---

## 📋 Prerequisites

### Development Environment
- Node.js 20+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Studio
- Git
- Code editor (VS Code recommended)

### For ML Development
- Python 3.10+
- Conda or virtualenv
- CUDA (for GPU training, optional)
- Jupyter Lab

### Optional Tools
- Docker (for containerized services)
- Figma Desktop (for MCP integration)
- Jira account (for project management MCP)

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd GlossiaApp
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install mobile app dependencies
cd mobile
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
# - API keys (OpenAI, Claude, etc.)
# - Database URLs
# - OAuth credentials
```

### 4. Start Development

**Mobile App:**
```bash
cd mobile
npm start        # Start Expo dev server
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
```

**Backend Server:**
```bash
cd server
npm run dev      # Start with nodemon
```

**Storybook (UI Development):**
```bash
cd mobile
npm run storybook
```

---

## 📚 Documentation

### Project Management
- [User Stories](docs/01-project-management/user-stories/)
- [User Flows](docs/01-project-management/user-flows/)
- [User Roles](docs/01-project-management/roles/)

### Architecture
- [System Architecture](docs/02-architecture/)
- [AI/ML Pipeline](docs/05-ml-ai/)
- [API Documentation](docs/08-api/)

### Development Guides
- [Mobile Development](docs/03-mobile/)
- [Backend Development](docs/04-backend/)
- [Setup Guides](docs/07-guides/)

### Design System
- [UI/UX Guidelines](docs/06-design/)
- [Component Library](mobile/src/shared/components/)

---

## 🤖 Claude Code Integration

This project is optimized for development with Claude Code.

### Available MCPs
- **Figma MCP** - Design-to-code workflow
- **MongoDB MCP** - Database operations
- **Jira MCP** - Project management (planned)

### Claude Commands
```bash
# See available commands
/help

# Common workflows will be added as custom commands
```

See [CLAUDE.md](CLAUDE.md) for detailed guidelines.

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests (mobile)
cd mobile
npm run test:e2e

# Run ML model tests
cd ml-models
pytest
```

---

## 🔒 Security

- All API keys stored in environment variables
- No credentials committed to repository
- Security scanning via GitHub Actions
- Regular dependency audits

See [Security Policy](docs/07-guides/SECURITY.md) for details.

---

## 📦 Deployment

### Mobile App
- **iOS:** TestFlight → App Store
- **Android:** Google Play Console

### Backend
- **Staging:** Heroku / Render
- **Production:** AWS / Google Cloud
- **ML Models:** AWS SageMaker / Google Vertex AI

Deployment guides: [docs/07-guides/deployment/](docs/07-guides/deployment/)

---

## 👥 Team

### Current Team
- **Project Manager / Product Owner:** [Your Name]
- **Design System Admin:** [Your Name]

### Planned Roles
- **Mobile Developer** (Swift / React Native) - To be hired
- **ML/AI Engineer** (Python, Langflow, model training) - To be hired
- **Backend Developer** (Node.js, APIs) - To be determined

---

## 🗺️ Roadmap

### Q1 2025 - MVP (iOS)
- [ ] Basic sign recognition (LSF)
- [ ] Text-to-sign avatar
- [ ] User authentication
- [ ] Camera & microphone access
- [ ] Basic UI/UX

### Q2 2025 - Enhancement
- [ ] ASL & BSL support
- [ ] Improved avatar animations
- [ ] Offline mode
- [ ] Performance optimization

### Q3 2025 - Multi-platform
- [ ] Android app
- [ ] Web application (beta)
- [ ] Desktop app (macOS)

### Q4 2025 - Advanced Features
- [ ] Multi-user video calls
- [ ] Educational mode
- [ ] Community contributions

---

## 📄 License

[To be determined]

---

## 🙏 Acknowledgments

- Sign language datasets and research community
- Open-source ML model contributors
- Accessibility advocates

---

## 📞 Contact

- **Project Repository:** [GitHub URL]
- **Project Management:** [Jira Board URL]
- **Design System:** [Figma URL]
- **Team Communication:** [Discord/Slack URL]

---

**Status:** 🚧 **In Development** - MVP Phase
**Last Updated:** 2025-10-22

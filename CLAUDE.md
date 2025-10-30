# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in the GlossiaApp repository.

---

## Project Overview

**GlossiaApp** is a mobile-first sign language translation application that enables bidirectional communication between spoken/written language and sign language.

### Core Mission
Enable deaf and hard-of-hearing individuals to communicate seamlessly through real-time sign language translation powered by AI/ML.

### Target Users
- **Deaf/Hard-of-Hearing Individuals** - Primary users needing sign language translation
- **Hearing Individuals** - People communicating with deaf/hard-of-hearing individuals
- **Educators** - Sign language teachers and students
- **Healthcare Providers** - Medical professionals serving deaf patients
- **Emergency Services** - First responders needing to communicate with deaf individuals

---

## Recommended MCP Servers

For optimal development experience, install these Model Context Protocol (MCP) servers:

### Quick Setup

Run the automated installation script:

```bash
npm run mcp:setup
```

This installs all required MCP servers for GlossiaApp. Verify installation:

```bash
npm run mcp:check
```

### 1. Figma MCP Server (ESSENTIAL)

```bash
# Use Figma Desktop's built-in MCP server (No API key needed!)
claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp
```

**Official Documentation:**
- https://www.figma.com/blog/introducing-figmas-dev-mode-mcp-server/
- https://github.com/figma/mcp-server-guide/

**Benefits:**
- Design-to-code for mobile UI components
- Avatar design extraction
- UI/UX prototype conversion
- Layout data for responsive mobile design
- Real-time design updates and synchronization
- **No API key required** - uses your Figma Desktop authentication!

**Requirements:** Figma Desktop app must be running (hosts MCP server on port 3845)

---

### 2. Atlassian MCP Server (PROJECT MANAGEMENT)

```bash
claude mcp add atlassian -- npx -y @atlassian/mcp-server
```

**Official Documentation:**
- https://developer.atlassian.com/platform/mcp/

**Benefits:**
- Jira integration for user story tracking
- Sprint planning and issue management
- Confluence documentation access
- Team coordination and collaboration
- Automated workflow management

**Requirements:** Atlassian API token configuration (see setup guide)

---

### 3. MongoDB MCP Server (DATABASE - Optional)

```bash
claude mcp add mongodb -- npx -y @mongodb-js/mongodb-mcp-server
```

**Official Documentation:**
- https://www.mongodb.com/docs/mcp-server/

**Benefits:**
- User profile management queries
- Translation history storage patterns
- Learning progress tracking
- Sign language dictionary management
- Schema design best practices

**Note:** Optional for GlossiaApp. Required if using MongoDB backend.

---

### 4. Additional MCPs to Evaluate

**Future Considerations:**
- **Linear MCP** - Alternative to Atlassian/Jira
- **Notion MCP** - Documentation and knowledge base
- **Slack/Discord MCP** - Team communication
- **AWS MCP** - Cloud infrastructure (for ML models)
- **Firebase MCP** - Real-time database and authentication

**See full setup guide:** `docs/07-guides/MCP-SETUP-GUIDE.md` (to be created)

---

## Project Structure

```
GlossiaApp/
├── mobile/                 # React Native/Expo mobile app
│   ├── src/
│   │   ├── domains/        # Domain-driven architecture
│   │   │   ├── translation/  # Sign ↔ Text/Voice translation
│   │   │   ├── avatar/       # Signing avatar rendering
│   │   │   ├── camera/       # Camera & video processing
│   │   │   ├── recognition/  # Sign recognition ML
│   │   │   ├── auth/         # Authentication & profiles
│   │   │   └── learning/     # Educational features
│   │   ├── shared/         # Shared components
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── utils/       # Utility functions
│   │   │   └── types/       # TypeScript types
│   │   ├── api/            # API clients
│   │   ├── navigation/     # React Navigation setup
│   │   └── theme/          # Design system & theming
│   ├── assets/             # Images, fonts, videos
│   ├── .storybook/         # Storybook configuration
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── api/            # REST/GraphQL APIs
│   │   │   ├── routes/      # API routes
│   │   │   ├── controllers/ # Request handlers
│   │   │   └── middleware/  # Auth, validation, etc.
│   │   ├── ml/             # ML model serving
│   │   │   ├── sign-recognition/
│   │   │   └── text-to-sign/
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models (Mongoose)
│   │   └── utils/          # Server utilities
│   └── package.json
│
├── shared/                 # Shared TypeScript types
│   ├── types/
│   │   ├── api.ts          # API request/response types
│   │   ├── sign-language.ts # Sign language data structures
│   │   ├── user.ts         # User & profile types
│   │   └── ml.ts           # ML model types
│   └── package.json
│
├── scripts/                # Build & deployment scripts
│   ├── setup/              # Initial setup scripts
│   ├── deploy/             # Deployment automation
│   └── ml/                 # ML model training scripts
│
├── docs/                   # Documentation
│   ├── 00-references/      # External resources
│   ├── 01-project-management/
│   │   ├── user-stories/
│   │   ├── user-flows/
│   │   └── roles/
│   ├── 02-architecture/    # System architecture
│   ├── 03-mobile/          # Mobile app docs
│   ├── 04-backend/         # Backend docs
│   ├── 05-ml-ai/           # ML/AI documentation
│   ├── 06-design/          # Design system
│   ├── 07-guides/          # How-to guides
│   └── 08-api/             # API documentation
│
└── .claude/                # Claude Code configuration
    ├── agents/             # Specialized agents
    ├── commands/           # Custom slash commands
    └── settings.local.json # Local MCP settings
```

---

## Technology Stack

### Mobile (React Native/Expo)
- **Framework:** React Native 0.74+ with Expo SDK 51+
- **Language:** TypeScript 5+
- **UI Library:** React Native Paper / NativeBase / custom components
- **State Management:** Zustand / Redux Toolkit
- **Navigation:** React Navigation 6+
- **Camera:** expo-camera
- **Microphone:** expo-av
- **ML Integration:** TensorFlow.js / ONNX Runtime React Native
- **Animation:** React Native Reanimated 3
- **3D Avatar:** Three.js / expo-three
- **Storybook:** React Native Storybook 7+
- **Testing:** Jest + React Native Testing Library + Detox

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js / Fastify
- **Language:** TypeScript 5+
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** Passport.js (JWT + OAuth2)
- **ML Serving:** TensorFlow Serving / ONNX Runtime
- **Real-time:** Socket.io (for live translation)
- **API:** REST + GraphQL (Apollo Server)
- **Testing:** Jest + Supertest

### AI/ML Stack
- **Sign Recognition:** TensorFlow / PyTorch
- **Computer Vision:** MediaPipe / OpenCV
- **NLP:** OpenAI GPT-4 / Claude API for text processing
- **Avatar Animation:** Blender (rigging) + Three.js (rendering)
- **Model Training:** Python 3.10+, Jupyter notebooks
- **Model Serving:** TensorFlow Serving / FastAPI
- **Datasets:** LSF/ASL/BSL sign language datasets

### Sign Language Support

**Priority 1 (MVP):**
- 🇫🇷 **LSF** (Langue des Signes Française) - Primary
- 🇺🇸 **ASL** (American Sign Language)
- 🇬🇧 **BSL** (British Sign Language)

**Priority 2 (Future):**
- Other regional sign languages
- International Sign Language (IS)

---

## Development Commands

### Root Level
```bash
npm install              # Install all workspace dependencies
npm run dev              # Start mobile + server in parallel
npm run build            # Build all packages
npm test                 # Run all tests
npm run lint             # Lint all code
npm run storybook        # Start Storybook UI development
npm run clean            # Remove all node_modules
```

### MCP Servers
```bash
npm run mcp:setup        # Install all MCP servers (Figma + Atlassian)
npm run mcp:check        # Verify MCP installation
npm run mcp:install      # Same as mcp:setup
```

### Documentation
```bash
npm run docs:organize         # Move HTML/PDF to .output folder
npm run docs:organize:dry     # Preview organization (dry-run)
npm run docs:organize:cleanup # Also remove empty directories
npm run docs:fix              # Fix documentation issues
```

### GitHub Operations
```bash
npm run github:issues         # List all issues (last 20)
npm run github:issues:open    # List open issues
npm run github:issues:closed  # List closed issues
npm run github:pr:list        # List pull requests
npm run github:pr:status      # Show PR status
npm run github:repo:view      # View repository details
npm run github:actions        # List GitHub Actions runs
npm run github:security       # Check security vulnerabilities
```

### Security
```bash
npm run security:scan                # Multi-workspace security audit
npm run security:fix                 # Auto-fix vulnerabilities
npm run security:report              # Comprehensive security report
npm run security:auto-update         # Safe auto-update (critical/high)
npm run security:aikido              # AIKIDO security scan
npm run security:aikido:interactive  # Interactive security dashboard
```

### Mobile App (from /mobile directory)
```bash
npm start                # Start Expo dev server
npm run ios              # Run on iOS simulator
npm run android          # Run on Android emulator
npm test                 # Run unit tests
npm run test:e2e         # Run E2E tests with Detox
npm run lint             # ESLint
npm run storybook        # Start Storybook
npm run build            # Build for production
```

### Backend Server (from /server directory)
```bash
npm run dev              # Start with nodemon (hot reload)
npm start                # Start production server
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run lint             # ESLint
npm run build            # Build TypeScript
```

---

## Path Aliases

TypeScript and Metro bundler configured with path aliases:

**Mobile App:**
- `@/` → `src/`
- `@domains/` → `src/domains/`
- `@shared/` → `src/shared/`
- `@components/` → `src/shared/components/`
- `@hooks/` → `src/shared/hooks/`
- `@utils/` → `src/shared/utils/`
- `@api/` → `src/api/`
- `@navigation/` → `src/navigation/`
- `@theme/` → `src/theme/`
- `@assets/` → `assets/`

**Backend:**
- `@/` → `src/`
- `@api/` → `src/api/`
- `@services/` → `src/services/`
- `@models/` → `src/models/`
- `@ml/` → `src/ml/`
- `@utils/` → `src/utils/`

---

## Key Technologies & Patterns

### 1. Domain-Driven Architecture

**Domains** represent major feature areas:

```typescript
// Example: Translation domain
mobile/src/domains/translation/
├── components/          # Domain-specific components
│   ├── TranslationView/
│   ├── SignInput/
│   └── TextOutput/
├── hooks/              # Domain-specific hooks
│   ├── useSignRecognition.ts
│   └── useTranslation.ts
├── services/           # Business logic
│   └── translationService.ts
├── types/              # Domain types
│   └── translation.types.ts
└── stores/             # State management
    └── translationStore.ts
```

**IMPORTANT:** Keep domain logic isolated. Domains should not import from other domains directly - use shared services or event emitters.

---

### 2. Storybook for UI Development

**CRITICAL:** All UI components MUST have Storybook stories.

Location: `mobile/.storybook/`

Usage:
```typescript
// ✅ DO THIS - Create story for every component
import type { Meta, StoryObj } from '@storybook/react';
import { SignButton } from './SignButton';

const meta: Meta<typeof SignButton> = {
  title: 'Components/SignButton',
  component: SignButton,
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export default meta;
type Story = StoryObj<typeof SignButton>;

export const Default: Story = {
  args: {
    sign: 'hello',
    language: 'LSF',
  },
};

export const Disabled: Story = {
  args: {
    sign: 'hello',
    language: 'LSF',
    disabled: true,
  },
};
```

**Run Storybook:**
```bash
cd mobile
npm run storybook
```

---

### 3. Sign Language Data Structures

**IMPORTANT:** Use consistent type definitions for sign language data.

Location: `shared/types/sign-language.ts`

```typescript
// Sign language type
export type SignLanguage = 'LSF' | 'ASL' | 'BSL';

// Individual sign representation
export interface Sign {
  id: string;
  language: SignLanguage;
  word: string;                    // Written word
  videoUrl?: string;               // Reference video
  handshape: HandShape;
  location: SignLocation;
  movement: SignMovement;
  palmOrientation: PalmOrientation;
  facialExpression?: FacialExpression;
  metadata: SignMetadata;
}

// Sign recognition result
export interface SignRecognitionResult {
  sign: Sign;
  confidence: number;              // 0-1
  alternatives: Array<{
    sign: Sign;
    confidence: number;
  }>;
  timestamp: Date;
}

// Translation request/response
export interface TranslationRequest {
  input: string | Sign[];
  sourceLanguage: 'text' | 'voice' | SignLanguage;
  targetLanguage: 'text' | 'voice' | SignLanguage;
  userId?: string;
}

export interface TranslationResponse {
  result: string | Sign[];
  confidence: number;
  alternatives?: Array<{
    result: string | Sign[];
    confidence: number;
  }>;
  processingTime: number;          // milliseconds
}
```

**Usage in components:**
```typescript
import type { Sign, SignLanguage } from '@/shared/types/sign-language';

const MyComponent = () => {
  const [currentSign, setCurrentSign] = useState<Sign | null>(null);
  const [language, setLanguage] = useState<SignLanguage>('LSF');

  // ...
};
```

---

### 4. Camera & Video Processing

**Location:** `mobile/src/domains/camera/`

**IMPORTANT:** Use expo-camera with proper permissions handling.

```typescript
import { Camera, CameraView } from 'expo-camera';
import { useSignRecognition } from '@domains/recognition/hooks/useSignRecognition';

const SignRecognitionCamera = () => {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const { recognizeSign, isProcessing } = useSignRecognition();

  if (!permission?.granted) {
    return <PermissionScreen onRequest={requestPermission} />;
  }

  return (
    <CameraView
      style={{ flex: 1 }}
      facing="front"                    // Front camera for signing
      onCameraReady={() => {
        // Start frame processing
      }}
    />
  );
};
```

**Best Practices:**
- Always use front camera for sign recognition (user facing)
- Process frames at 15-30 FPS (balance accuracy vs battery)
- Handle low-light conditions
- Provide visual feedback during processing
- Cache recognition results to reduce API calls

---

### 5. Avatar Rendering (Text-to-Sign)

**Location:** `mobile/src/domains/avatar/`

**Technology:** Three.js via expo-three

```typescript
import { Canvas } from '@react-three/fiber';
import { SigningAvatar } from '@domains/avatar/components/SigningAvatar';

const AvatarView = () => {
  const [currentSigns, setCurrentSigns] = useState<Sign[]>([]);

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <SigningAvatar
        signs={currentSigns}
        language="LSF"
        speed={1.0}
        mirrored={true}              // Mirror avatar for user to follow
      />
    </Canvas>
  );
};
```

**Avatar Requirements:**
- Must be mirrored (so user can follow)
- Smooth transitions between signs
- Accurate hand positioning
- Facial expressions included
- Configurable speed (0.5x - 2x)

---

### 6. ML Model Integration

**Location:** `mobile/src/domains/recognition/` and `server/src/ml/`

**Client-Side (React Native):**
```typescript
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

export const useSignRecognition = () => {
  const [model, setModel] = useState<tf.GraphModel | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const loadedModel = await tf.loadGraphModel('path/to/model.json');
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  const recognizeSign = async (imageData: ImageData) => {
    if (!model) return null;

    // Preprocess image
    const tensor = tf.browser.fromPixels(imageData)
      .resizeBilinear([224, 224])
      .expandDims(0)
      .toFloat()
      .div(255);

    // Run inference
    const predictions = await model.predict(tensor) as tf.Tensor;
    const result = await predictions.data();

    // Cleanup
    tensor.dispose();
    predictions.dispose();

    return processResults(result);
  };

  return { recognizeSign, isReady: model !== null };
};
```

**Server-Side (Python FastAPI):**
```python
# server/src/ml/sign-recognition/app.py
from fastapi import FastAPI, UploadFile
import tensorflow as tf

app = FastAPI()
model = tf.keras.models.load_model('models/sign_recognition_lsf.h5')

@app.post("/recognize")
async def recognize_sign(video: UploadFile):
    # Process video frames
    frames = extract_frames(video)

    # Run inference
    predictions = model.predict(frames)

    # Return results
    return {
        "sign": decode_prediction(predictions),
        "confidence": float(predictions.max()),
    }
```

---

### 7. State Management (Zustand)

**Location:** `mobile/src/domains/*/stores/`

**IMPORTANT:** Use Zustand for local state, not Redux (simpler, better for mobile).

```typescript
import { create } from 'zustand';
import type { Sign, SignLanguage } from '@/shared/types/sign-language';

interface TranslationStore {
  // State
  currentLanguage: SignLanguage;
  history: Sign[];
  isRecording: boolean;

  // Actions
  setLanguage: (language: SignLanguage) => void;
  addToHistory: (sign: Sign) => void;
  startRecording: () => void;
  stopRecording: () => void;
  clearHistory: () => void;
}

export const useTranslationStore = create<TranslationStore>((set) => ({
  currentLanguage: 'LSF',
  history: [],
  isRecording: false,

  setLanguage: (language) => set({ currentLanguage: language }),
  addToHistory: (sign) => set((state) => ({
    history: [...state.history, sign]
  })),
  startRecording: () => set({ isRecording: true }),
  stopRecording: () => set({ isRecording: false }),
  clearHistory: () => set({ history: [] }),
}));
```

---

### 8. Navigation (React Navigation)

**Location:** `mobile/src/navigation/`

**Structure:**
```typescript
// Main navigation structure
<NavigationContainer>
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Translation" component={TranslationScreen} />
    <Stack.Screen name="Learning" component={LearningScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
</NavigationContainer>
```

**Type-safe navigation:**
```typescript
// navigation/types.ts
export type RootStackParamList = {
  Home: undefined;
  Translation: { language: SignLanguage };
  Learning: { lessonId: string };
  Profile: { userId: string };
};

// Use in components
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Translation'>;

const TranslationScreen = ({ route, navigation }: Props) => {
  const { language } = route.params;  // Type-safe!
  // ...
};
```

---

## Important Development Rules

### Rule 1: Always Use Storybook

**CRITICAL:** Every UI component must have a Storybook story.

✅ **DO:**
```bash
# Create component with story
mobile/src/shared/components/SignButton/
├── SignButton.tsx
├── SignButton.types.ts
└── SignButton.stories.tsx
```

❌ **DON'T:**
```bash
# Component without story
mobile/src/shared/components/SignButton.tsx  # ❌ Missing story!
```

---

### Rule 2: Type Safety First

**CRITICAL:** All TypeScript code must have proper types. No `any` types.

✅ **DO:**
```typescript
interface Props {
  sign: Sign;
  onPress: (sign: Sign) => void;
}

const Component: React.FC<Props> = ({ sign, onPress }) => { ... };
```

❌ **DON'T:**
```typescript
const Component = ({ sign, onPress }: any) => { ... };  // ❌ No any!
```

---

### Rule 3: Domain Isolation

**IMPORTANT:** Domains should not directly import from other domains.

✅ **DO:**
```typescript
// Use shared services
import { translationService } from '@/shared/services/translation';

// Or emit events
import { eventEmitter } from '@/shared/utils/events';
eventEmitter.emit('sign-recognized', sign);
```

❌ **DON'T:**
```typescript
// Direct domain-to-domain import
import { useAvatarStore } from '@domains/avatar/stores/avatarStore';  // ❌
```

---

### Rule 4: Mobile Performance

**CRITICAL:** Always optimize for mobile performance.

**Best Practices:**
- Use React.memo() for expensive components
- Implement virtualized lists for long content (FlatList)
- Lazy load heavy dependencies
- Minimize bundle size
- Use native modules for performance-critical operations
- Profile with React DevTools Profiler

---

### Rule 5: Offline-First Approach

**IMPORTANT:** App should work offline where possible.

**Strategy:**
- Cache ML models locally
- Store translation history locally (AsyncStorage)
- Sync when online
- Show offline indicator
- Queue requests when offline

```typescript
import NetInfo from '@react-native-community/netinfo';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    return unsubscribe;
  }, []);

  return isOnline;
};
```

---

### Rule 6: Accessibility First

**CRITICAL:** App must be fully accessible.

**Requirements:**
- Screen reader support (TalkBack, VoiceOver)
- High contrast mode
- Adjustable font sizes
- Haptic feedback
- Voice commands (alternative input method)

```typescript
import { AccessibilityInfo } from 'react-native';

<TouchableOpacity
  accessible={true}
  accessibilityLabel="Record sign language"
  accessibilityHint="Tap to start recording your signing"
  accessibilityRole="button"
  onPress={handleRecord}
>
  <RecordButton />
</TouchableOpacity>
```

---

### Rule 7: Security & Privacy

**CRITICAL:** Handle user data with care.

**Requirements:**
- Never store videos without consent
- Encrypt sensitive data
- Clear camera permissions rationale
- GDPR compliance
- Secure API communication (HTTPS only)
- No tracking without consent

---

### Rule 8: Use Project Frameworks Over Raw Commands

**CRITICAL:** Always use the project's npm scripts instead of raw commands.

❌ **DON'T:**
```bash
npm audit                # Use security:scan instead
npm audit fix            # Use security:fix instead
npm update               # Use security:auto-update instead
gh issue list            # Use github:issues instead
```

✅ **DO:**
```bash
npm run security:scan              # Multi-workspace security audit
npm run security:auto-update       # Safe auto-update (critical/high only)
npm run security:aikido:interactive # Interactive security dashboard
npm run docs:organize              # Organize documentation
npm run github:issues              # List GitHub issues
npm run mcp:setup                  # Install MCP servers
```

**Why:** Project frameworks provide:
- Multi-workspace scanning (mobile/server/shared)
- Severity thresholds and safe updates
- AIKIDO integration for enhanced security
- Consistent behavior across all repositories
- Proper error handling and reporting

**See:** `docs/07-guides/INTERACTION-RULES.md` (to be created) for complete details

---

## ML/AI Development

### Sign Recognition Pipeline

```
Camera Frame
    ↓
Preprocessing (resize, normalize)
    ↓
MediaPipe Hand Landmarks Detection
    ↓
TensorFlow Sign Classification
    ↓
Post-processing (confidence threshold)
    ↓
Result: Sign + Confidence
```

### Model Requirements

**Sign Recognition Model:**
- Input: Video frames (224x224x3)
- Output: Sign class + confidence
- Accuracy: >90% on test set
- Inference time: <100ms per frame
- Model size: <50MB (mobile constraint)

**Text-to-Sign Model:**
- Input: Text string
- Output: Sequence of signs
- Grammar handling (word order differences)
- Context awareness

---

## Testing Strategy

### Mobile App Testing

**Unit Tests (Jest):**
```bash
cd mobile
npm test
```

**E2E Tests (Detox):**
```bash
cd mobile
npm run test:e2e:ios
npm run test:e2e:android
```

**Storybook Visual Testing:**
```bash
cd mobile
npm run storybook
npm run chromatic  # Visual regression testing
```

### Backend Testing

**Unit Tests:**
```bash
cd server
npm test
```

**API Integration Tests:**
```bash
cd server
npm run test:integration
```

### ML Model Testing

**Model Accuracy Tests:**
```bash
cd ml-models
pytest tests/test_sign_recognition.py
```

---

## Documentation Organization

**IMPORTANT:** Use doc-classifier agent for documentation management.

### Folder Structure

```
docs/
├── 00-references/              # External links, datasets
├── 01-project-management/      # User stories, sprints, roles
├── 02-architecture/            # System design, diagrams
├── 03-mobile/                  # Mobile app documentation
├── 04-backend/                 # Backend API docs
├── 05-ml-ai/                   # ML models, training
├── 06-design/                  # UI/UX, design system
├── 07-guides/                  # Setup, deployment guides
└── 08-api/                     # API reference
```

**When creating docs:**
1. Use doc-classifier agent to determine correct location
2. Follow naming conventions
3. Update AUTO-INDEX.md in each folder
4. Cross-reference related docs

---

## Team Collaboration

### Project Management (Jira)

**User Stories Format:**
```
As a [user type]
I want to [action]
So that [benefit]

Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

### Communication

**Channels:**
- **Discord/Slack** - Daily communication
- **Jira** - Sprint planning, user stories
- **GitHub** - Code reviews, technical discussions
- **Notion** - Documentation, knowledge base (optional)
- **Figma** - Design collaboration

---

## Git Workflow

### Branch Naming

```
feature/translation-lsf-support
bugfix/camera-permission-android
hotfix/avatar-crash
docs/ml-pipeline-guide
```

### Commit Messages

```
feat(translation): Add LSF sign recognition
fix(camera): Fix permission request on Android
docs(ml): Add model training guide
test(avatar): Add avatar rendering tests
chore(deps): Update TensorFlow to 2.15
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manually tested on iOS
- [ ] Manually tested on Android

## Screenshots (if applicable)

## Related Issues
Closes #123
```

---

## Deployment

### Mobile App

**iOS:**
```bash
cd mobile
eas build --platform ios
eas submit --platform ios
```

**Android:**
```bash
cd mobile
eas build --platform android
eas submit --platform android
```

### Backend

**Staging:**
```bash
npm run deploy:staging
```

**Production:**
```bash
npm run deploy:production
```

---

## Additional Resources

### Sign Language Datasets
- **LSF:** [Insert dataset URL]
- **ASL:** [Insert dataset URL]
- **BSL:** [Insert dataset URL]

### Research Papers
- Sign language recognition: [Papers]
- Avatar animation: [Papers]
- Real-time translation: [Papers]

### Tools
- **Langflow** - LLM orchestration
- **LLM Studio** - Model training/fine-tuning
- **MediaPipe** - Hand landmark detection
- **Blender** - Avatar rigging

---

## Support & Questions

- **Technical Issues:** GitHub Issues
- **Design Questions:** Figma comments
- **Project Questions:** Jira
- **Team Chat:** Discord/Slack

---

**Last Updated:** 2025-10-22
**Project Status:** 🚧 Initial Setup Phase
**Target MVP:** Q1 2025

🤖 Optimized for Claude Code development

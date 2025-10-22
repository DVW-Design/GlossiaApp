# Storybook for GlossiaApp Mobile

This directory contains the Storybook configuration for the GlossiaApp mobile application.

## Running Storybook

### Start Storybook
```bash
npm run storybook
```

This will start Expo with Storybook enabled. You can then:
- Press `i` for iOS simulator
- Press `a` for Android simulator
- Scan QR code with Expo Go app

### Platform-Specific Storybook
```bash
# iOS only
npm run storybook:ios

# Android only
npm run storybook:android
```

## Creating Stories

Stories should be placed next to their components with the `.stories.tsx` extension:

```
src/
  shared/
    components/
      Button/
        Button.tsx
        Button.stories.tsx  ← Story file
```

### Story Template

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import { YourComponent } from './YourComponent';

const meta: Meta<typeof YourComponent> = {
  title: 'Components/YourComponent',
  component: YourComponent,
  argTypes: {
    onPress: { action: 'pressed' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // your props
  },
};
```

## Visual Testing with Chromatic

### Upload to Chromatic
```bash
npm run chromatic
```

This will build and upload your Storybook to Chromatic for visual regression testing.

## Configuration Files

- `main.ts` - Storybook configuration
- `preview.ts` - Global decorators and parameters
- `Storybook.tsx` - Storybook UI component
- `storybook.requires.ts` - Auto-generated story imports

## Addons

- **@storybook/addon-ondevice-actions** - Log component actions
- **@storybook/addon-ondevice-controls** - Interactive component props
- **@storybook/addon-ondevice-notes** - Component documentation

## Troubleshooting

### Storybook not loading
Make sure `STORYBOOK_ENABLED=true` is set:
```bash
STORYBOOK_ENABLED=true expo start
```

### Stories not appearing
1. Check that story files match the pattern in `main.ts`
2. Ensure stories export a default meta object
3. Try clearing Metro bundler cache: `expo start -c`

### Build errors
```bash
# Clear all caches
rm -rf node_modules
npm install
expo start -c
```

## Resources

- [Storybook for React Native](https://github.com/storybookjs/react-native)
- [Chromatic Docs](https://www.chromatic.com/docs/)
- [React Native Documentation](https://reactnative.dev/)

import { StorybookConfig } from '@storybook/react-native';

const config: StorybookConfig = {
  stories: [
    '../src/domains/**/*.stories.tsx',
    '../src/shared/components/**/*.stories.tsx',
  ],
  addons: [
    '@storybook/addon-ondevice-actions',
    '@storybook/addon-ondevice-controls',
    '@storybook/addon-ondevice-notes',
  ],
};

export default config;

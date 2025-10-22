import { getStorybookUI } from '@storybook/react-native';
import './storybook.requires';

const StorybookUI = getStorybookUI({
  // Enable websockets for live reloading
  enableWebsockets: true,
  // Additional options
  host: 'localhost',
  port: 7007,
  // Show navigator by default
  shouldPersistSelection: true,
});

export default StorybookUI;

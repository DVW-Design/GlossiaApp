import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// Storybook integration - toggle with STORYBOOK_ENABLED env var
const SHOW_STORYBOOK = process.env.STORYBOOK_ENABLED === 'true';

// Import Storybook UI only when needed
let StorybookUI: any;
if (SHOW_STORYBOOK && __DEV__) {
  StorybookUI = require('./.storybook/Storybook').default;
}

export default function App() {
  // Show Storybook in development when enabled
  if (SHOW_STORYBOOK && __DEV__ && StorybookUI) {
    return <StorybookUI />;
  }

  // Normal app
  return (
    <View style={styles.container}>
      <Text>GlossiaApp - Sign Language Translation</Text>
      <Text style={styles.subtitle}>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  },
});

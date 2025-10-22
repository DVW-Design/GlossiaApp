import type { Meta, StoryObj } from '@storybook/react-native';
import { View, StyleSheet } from 'react-native';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    onPress: { action: 'pressed' },
  },
  args: {
    title: 'Press me',
  },
  decorators: [
    (Story) => (
      <View style={styles.decorator}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Primary Variants
export const Primary: Story = {
  args: {
    title: 'Primary Button',
    variant: 'primary',
    size: 'medium',
  },
};

export const Secondary: Story = {
  args: {
    title: 'Secondary Button',
    variant: 'secondary',
    size: 'medium',
  },
};

export const Outline: Story = {
  args: {
    title: 'Outline Button',
    variant: 'outline',
    size: 'medium',
  },
};

// Sizes
export const Small: Story = {
  args: {
    title: 'Small Button',
    variant: 'primary',
    size: 'small',
  },
};

export const Medium: Story = {
  args: {
    title: 'Medium Button',
    variant: 'primary',
    size: 'medium',
  },
};

export const Large: Story = {
  args: {
    title: 'Large Button',
    variant: 'primary',
    size: 'large',
  },
};

// States
export const Disabled: Story = {
  args: {
    title: 'Disabled Button',
    variant: 'primary',
    size: 'medium',
    disabled: true,
  },
};

export const DisabledOutline: Story = {
  args: {
    title: 'Disabled Outline',
    variant: 'outline',
    size: 'medium',
    disabled: true,
  },
};

// Interactive
export const WithAction: Story = {
  args: {
    title: 'Click Me',
    variant: 'primary',
    size: 'medium',
  },
};

const styles = StyleSheet.create({
  decorator: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

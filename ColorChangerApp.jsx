import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const ColorChangerApp = () => {
  const [backgroundColor, setBackgroundColor] = useState('hsl(0,75.3%,76.8%)');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.title}>Color Changer App</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="White"
          onPress={() => setBackgroundColor('white')}
        />
        <Button
          title="Light Blue"
          onPress={() => setBackgroundColor('lightblue')}
        />
        <Button
          title="Light Green"
          onPress={() => setBackgroundColor('lightgreen')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
});
export default ColorChangerApp;
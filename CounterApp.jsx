import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const CounterApp = () => {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };
  const reset = () => {
    setCount(0);
  };

  const decrement = () => {
    setCount(count - 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Counter App</Text>
      <Text style={styles.counter}>{count}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Increment" onPress={increment} style={styles.border}/>
        <Button title="Reset" onPress={reset} style={styles.border}/>
        <Button title="Decrement" onPress={decrement} style={styles.border}/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 0,
    padding: 2,
  },
  title: {
    fontSize: 12,
    marginBottom: 8,
  },
  counter: {
    fontSize: 25,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
  border: {
    borderRadius: "20px",
  },
});

export default CounterApp;

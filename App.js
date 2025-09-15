import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';

import ColorChangerApp from './ColorChangerApp'
import CounterApp from './CounterApp'
import MySubscribeButton from './MySubscribeButton'

const SafeAreaComponent = () => {
  return (
    <SafeAreaView style={styles.container}>
    <CounterApp />
    <MySubscribeButton />
    <ColorChangerApp />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default SafeAreaComponent;
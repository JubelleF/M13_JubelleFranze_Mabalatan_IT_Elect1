import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';

import ChatScreen from './ChatScreen'
import CommentSection from './CommentSection'

const SafeAreaComponent = () => {
  return (
    <SafeAreaView style={styles.container}>
    <ChatScreen />
    <CommentSection />
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
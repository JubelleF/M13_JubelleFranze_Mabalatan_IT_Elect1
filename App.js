
import React from "react";
import { SafeAreaView, StyleSheet, Text} from "react-native";
import ChatScreen from "./ChatScreen";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ChatScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 ,
  },
  text : {
    color: 'hsla(0,79.7%,65.3%,0.808)',
  }
});
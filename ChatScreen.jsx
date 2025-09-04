// ChatScreen.js
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function ChatScreen() {
  
  const [messages, setMessages] = useState([
    { id: "1", text: "Hey! Naa tay Assignment?", sender: "Jaymark"},
    { id: "2", text: "Wala ko kabalo, Try to ask the another classmate!", sender: "JubelleFranze" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
  if (input.trim().length > 0) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const newMsg = {
      id: Date.now().toString(),
      text: input,
      sender: "JubelleFranze",
      timestamp: `${dateString}, ${timeString}`, 
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  }
};

  const renderMessage = ({ item }) => (
  <View
    style={[
      styles.messageBubble,
      item.sender === "JubelleFranze" ? styles.myMessage : styles.otherMessage,
    ]}
  >
    <Text style={styles.messageText}>{item.text}</Text>
    <Text
      style={[
        styles.timestamp,
        item.sender === "JubelleFranze" ? styles.myTimestamp : styles.otherTimestamp,
      ]}
    >
      {item.timestamp}{" "}{item.sender}
    </Text>
  </View>
);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            style={styles.input}
            placeholder="Type a message..."
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: '5%',
    flex: 1,
    backgroundColor: "hsl(240,16%,45.3%)",
    marginVertical: 25,
  },
  chatContainer: { padding: 10 },
  messageBubble: {
    maxWidth: "70%",
    padding: 10,
    marginVertical: 10,
    borderRadius: 15,
  },
  myMessage: {
    backgroundColor: "#0078fe",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  otherMessage: {
    backgroundColor: "hsl(240,11.5%,31.4%)",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
    color: 'hsl(19,89.8%,73.1%)',
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    backgroundColor: "#0078fe",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  messageText: {
    color: "#fff",
    marginBottom: 5,
  },
  senderName: {
    fontSize: 10,
    opacity: 0.6,
  },
  mySenderName: {
    color: "#fff", 
    alignSelf: "flex-end",
  },
  otherSenderName: {
    color: "#fff",
    alignSelf: "flex-start",
  },
  sendText: { color: "#fff", fontWeight: "bold" },
  timestamp: {
    fontSize: 10,
    opacity: 0.6,
  },
  myTimestamp: {
    color: "#fff",
    alignSelf: "flex-end",
  },
  otherTimestamp: {
    color: "#fff",
    alignSelf: "flex-start",
  },
});
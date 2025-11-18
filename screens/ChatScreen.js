// screens/ChatScreen.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  Modal,
  Dimensions,
  Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import * as ImagePicker from "expo-image-picker";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ChatScreen({ currentUser, chatUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const flatListRef = useRef(null);
  const db = useSQLiteContext();

  useEffect(() => {
    requestPermissions();
    loadMessages();
    markMessagesAsRead();

    const interval = setInterval(() => loadMessages(), 2000);

    return () => clearInterval(interval);
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant photo library access to send images."
      );
    }
  };

  const loadMessages = async () => {
    try {
      const results = await db.getAllAsync(
        `SELECT * FROM messages 
         WHERE (senderId = ? AND receiverId = ?) 
         OR (senderId = ? AND receiverId = ?)
         ORDER BY timestamp ASC`,
        [currentUser.id, chatUser.id, chatUser.id, currentUser.id]
      );
      setMessages(results);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await db.runAsync(
        `UPDATE messages 
         SET isRead = 1 
         WHERE senderId = ? AND receiverId = ? AND isRead = 0`,
        [chatUser.id, currentUser.id]
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await sendImage(imageUri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const sendImage = async (imageUri) => {
    try {
      const now = new Date().toISOString();
      await db.runAsync(
        "INSERT INTO messages (senderId, receiverId, message, imageUri, messageType, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
        [currentUser.id, chatUser.id, "", imageUri, "image", now]
      );
      await loadMessages();
    } catch (error) {
      console.error("Error sending image:", error);
      Alert.alert("Error", "Failed to send image. Please try again.");
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const msg = inputText.trim();
    setInputText("");

    try {
      const now = new Date().toISOString();
      await db.runAsync(
        "INSERT INTO messages (senderId, receiverId, message, messageType, timestamp) VALUES (?, ?, ?, ?, ?)",
        [currentUser.id, chatUser.id, msg, "text", now]
      );
      await loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      setInputText(msg);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) return "";
    
    // Same day - show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    }
    
    // Yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday " + date.toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    }
    
    // Same year - show date without year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { 
        month: "short", 
        day: "numeric" 
      }) + " " + date.toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    }
    
    // Different year - show full date
    return date.toLocaleDateString([], { 
      year: "numeric",
      month: "short", 
      day: "numeric" 
    }) + " " + date.toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const openImageViewer = (imageUri) => {
    setSelectedImage(imageUri);
    setIsImageViewerOpen(true);
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.senderId === currentUser.id;
    const isImage = item.messageType === "image" || item.imageUri;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
            isImage && styles.imageBubble,
          ]}
        >
          {isImage ? (
            <TouchableOpacity
              onPress={() => openImageViewer(item.imageUri)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: item.imageUri }}
                style={styles.messageImage}
                resizeMode="cover"
              />
              <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.messageText}>{item.message}</Text>
              <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "hsl(0,97.3%,14.3%)" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <StatusBar barStyle="light-content" />

      <View style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            {chatUser.profilePhoto ? (
              <Image
                source={{ uri: chatUser.profilePhoto }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {chatUser.fullName?.charAt(0)?.toUpperCase()}
                </Text>
              </View>
            )}

            <View>
              <Text style={styles.headerTitle}>{chatUser.fullName}</Text>
              <Text style={styles.headerSubtitle}>Active now</Text>
            </View>
          </View>
        </View>

        {/* MESSAGES */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        {/* INPUT AREA */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={pickImage}
            >
              <Text style={styles.imageIcon}>📷</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#aaa"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim() && styles.sendButtonActive,
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* IMAGE VIEWER MODAL */}
      <Modal
        visible={isImageViewerOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageViewerOpen(false)}
      >
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsImageViewerOpen(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D0D" },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    paddingTop: 45,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.4,
    borderBottomColor: "#222",
  },
  backButton: { marginRight: 12, padding: 4 },
  backIcon: { fontSize: 32, color: "#0A84FF" },
  headerCenter: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 12 },
  avatarPlaceholder: {
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { color: "#fff", fontSize: 18, fontWeight: "600" },
  headerTitle: { fontSize: 17, fontWeight: "600", color: "#fff" },
  headerSubtitle: { fontSize: 13, color: "#888", marginTop: 2 },

  /* MESSAGE BUBBLES */
  messages: { paddingVertical: 12, paddingHorizontal: 14, paddingBottom: 20 },
  messageContainer: { marginVertical: 4, maxWidth: "75%" },
  ownMessage: { alignSelf: "flex-end" },
  otherMessage: { alignSelf: "flex-start" },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18 },
  ownBubble: { backgroundColor: "#0A84FF", borderBottomRightRadius: 6 },
  otherBubble: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderBottomLeftRadius: 6,
  },
  imageBubble: {
    padding: 4,
    backgroundColor: "transparent",
  },
  messageText: { fontSize: 16, color: "#fff" },
  timeText: { 
    fontSize: 11, 
    marginTop: 4, 
    opacity: 0.7, 
    textAlign: "right", 
    color: "#ddd" 
  },
  messageImage: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: 14,
    backgroundColor: "#0D0D0D",
  },

  /* INPUT */
  inputWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#111",
    borderTopWidth: 0.4,
    borderTopColor: "#222",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#1A1A1A",
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  imageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  imageIcon: {
    fontSize: 24,
  },
  input: { flex: 1, color: "#fff", fontSize: 16, maxHeight: 120 },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    backgroundColor: "#2C2C2E",
  },
  sendButtonActive: { backgroundColor: "#0A84FF" },
  sendIcon: { color: "#fff", fontSize: 18 },

  /* IMAGE VIEWER */
  imageViewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "600",
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
});
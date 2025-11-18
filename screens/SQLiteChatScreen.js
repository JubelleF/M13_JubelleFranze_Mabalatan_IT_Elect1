// screens/SQLiteChatScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { dbInstance, initializeDatabase } from '../database/db';

export default function SQLiteChatScreen() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState(1); // Assume logged in as user 1
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    initializeDatabase();
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    dbInstance.transaction((tx) => {
      tx.executeSql(
        'SELECT id, username FROM users;',
        [],
        (_, results) => {
          const usersList = [];
          for (let i = 0; i < results.rows.length; i++) {
            usersList.push(results.rows.item(i));
          }
          setUsers(usersList);
        },
        (_, error) => {
          console.log('Error fetching users:', error);
          return true; // Don't stop transaction
        }
      );
    });
  };

  const sendMessage = () => {
    if (!selectedUser || !newMessage.trim()) {
      Alert.alert('Error', 'Please select a user and type a message');
      return;
    }

    dbInstance.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?);',
        [currentUserId, selectedUser.id, newMessage],
        () => {
          setNewMessage('');
          fetchMessages(selectedUser.id); // Refresh messages
        },
        (_, error) => {
          console.log('Error sending message:', error);
          return true;
        }
      );
    });
  };

  const fetchMessages = (userId) => {
    dbInstance.transaction((tx) => {
      tx.executeSql(
        `SELECT m.message, m.timestamp, u.username as sender
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
         ORDER BY m.timestamp;`,
        [currentUserId, userId, userId, currentUserId],
        (_, results) => {
          const messagesList = [];
          for (let i = 0; i < results.rows.length; i++) {
            messagesList.push(results.rows.item(i));
          }
          setMessages(messagesList);
        },
        (_, error) => {
          console.log('Error fetching messages:', error);
          return true;
        }
      );
    });
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchMessages(user.id);
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'JubelleFranze' ? styles.ownMessage : styles.otherMessage
    ]}>
      <Text style={styles.messageText}>{item.message}</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Act 3: SQLite Chat</Text>

      <View style={styles.usersContainer}>
        <Text style={styles.sectionTitle}>Registered Users</Text>
        <FlatList
          data={users}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.userButton, selectedUser?.id === item.id && styles.selectedUser]}
              onPress={() => handleUserSelect(item)}
            >
              <Text style={styles.userButtonText}>{item.username}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.chatContainer}>
        {selectedUser && (
          <>
            <Text style={styles.chatTitle}>Chatting with: {selectedUser.username}</Text>
            <FlatList
              data={messages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderMessage}
              style={styles.messagesList}
            />
          </>
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  usersContainer: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  userButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    margin: 5,
    borderRadius: 20,
  },
  selectedUser: {
    backgroundColor: '#FF9800',
  },
  userButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  chatContainer: {
    flex: 1,
    marginBottom: 10,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messageBubble: {
    padding: 10,
    marginVertical: 2,
    borderRadius: 10,
    maxWidth: '80%',
  },
  ownMessage: {
    backgroundColor: '#2196F3',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#E0E0E0',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
    marginTop: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
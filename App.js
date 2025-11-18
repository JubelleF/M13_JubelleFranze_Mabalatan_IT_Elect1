//App.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';

// --------------------------------------------
// AppContent - Uses Database + Session Storage
// --------------------------------------------
function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const db = useSQLiteContext();

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');

      if (userId) {
        const user = await db.getFirstAsync(
          'SELECT * FROM users WHERE id = ?',
          [parseInt(userId)]
        );

        if (user) {
          setCurrentUser(user);
          setCurrentScreen('home');
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = async (user) => {
    try {
      await AsyncStorage.setItem('userId', user.id.toString());
      setCurrentUser(user);
      setCurrentScreen('home');
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId');
    setCurrentUser(null);
    setSelectedChatUser(null);
    setCurrentScreen('login');
  };

  const handleOpenChat = (user) => {
    setSelectedChatUser(user);
    setCurrentScreen('chat');
  };

  const handleBackToHome = () => {
    setSelectedChatUser(null);
    setCurrentScreen('home');
  };

  // --------------------------------------------
  // Authentication Loading Screen
  // --------------------------------------------
  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // --------------------------------------------
  // Screen Routing
  // --------------------------------------------
  switch (currentScreen) {
    case 'login':
      return (
        <LoginScreen
          onLogin={handleLogin}
          onNavigateToRegister={() => setCurrentScreen('register')}
        />
      );

    case 'register':
      return (
        <RegisterScreen
          onRegisterSuccess={() => setCurrentScreen('login')}
          onNavigateToLogin={() => setCurrentScreen('login')}
        />
      );

    case 'home':
      return (
        <HomeScreen
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenChat={handleOpenChat}
        />
      );

    case 'chat':
      return (
        <ChatScreen
          currentUser={currentUser}
          chatUser={selectedChatUser}
          onBack={handleBackToHome}
        />
      );

    default:
      return null;
  }
}

// --------------------------------------------
// Database Migration for Image Support
// --------------------------------------------
async function migrateDatabase(db) {
  try {
    console.log('🔄 Checking for database migrations...');
    
    // Check if columns already exist
    const tableInfo = await db.getAllAsync('PRAGMA table_info(messages)');
    const hasImageUri = tableInfo.some(col => col.name === 'imageUri');
    const hasMessageType = tableInfo.some(col => col.name === 'messageType');

    // Add imageUri column if it doesn't exist
    if (!hasImageUri) {
      await db.runAsync('ALTER TABLE messages ADD COLUMN imageUri TEXT;');
      console.log('✅ Added imageUri column');
    } else {
      console.log('✓ imageUri column already exists');
    }

    // Add messageType column if it doesn't exist
    if (!hasMessageType) {
      await db.runAsync("ALTER TABLE messages ADD COLUMN messageType TEXT DEFAULT 'text';");
      console.log('✅ Added messageType column');
      
      // Update existing messages to have messageType = 'text'
      await db.runAsync("UPDATE messages SET messageType = 'text' WHERE messageType IS NULL;");
      console.log('✅ Updated existing messages with messageType');
    } else {
      console.log('✓ messageType column already exists');
    }

    console.log('✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during database migration:', error);
    // Don't throw - let the app continue even if migration fails
  }
}

// --------------------------------------------
// Database Initialization (No Dropping Tables)
// --------------------------------------------
async function initializeDatabase(db) {
  try {
    console.log('Initializing database...');

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password TEXT NOT NULL,
        fullName TEXT NOT NULL,
        profilePhoto TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        senderId INTEGER NOT NULL,
        receiverId INTEGER NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        isRead INTEGER DEFAULT 0,
        FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(senderId);
      CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiverId);
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(senderId, receiverId);
    `);

    const test = await db.getFirstAsync('SELECT COUNT(*) AS count FROM users');
    console.log('Users count:', test.count);

    // Run migration to add image support columns
    await migrateDatabase(db);

  } catch (error) {
    console.error('Database initialization error:', error);
    Alert.alert('Database Error', error.message);
    throw error;
  }
}

// --------------------------------------------
// Main App Component
// --------------------------------------------
export default function App() {
  return (
    <SQLiteProvider
      databaseName="messengerApp.db"
      onInit={initializeDatabase}
      options={{ useNewConnection: false }}
    >
      <View style={styles.container}>
        <AppContent />
      </View>
    </SQLiteProvider>
  );
}

// --------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
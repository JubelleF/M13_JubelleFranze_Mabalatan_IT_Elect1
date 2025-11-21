//App.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';

// --------------------------------------------
// INFO SCREEN COMPONENT
// --------------------------------------------
function InfoScreen({ onBack }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#9333ea" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.infoContainer}>
          <View style={styles.infoHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={onBack}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.infoTitle}>About Me</Text>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.imageContainer}>
              <Image
                source={require('./assets/jubellefranze.jpg')}
                style={styles.profileImage}
              />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>👤 Author</Text>
              <Text style={styles.infoCardText}>
                Jubelle Franze Cabardo Mabalatan
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Submitted To</Text>
              <Text style={styles.infoCardText}>Jay Ian Camelotes</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Bio</Text>
              <Text style={styles.infoCardText}>
                Hi! I'm Jubelle Franze, a passionate developer who loves creating
                beautiful and functional mobile applications.</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Address</Text>
              <Text style={styles.infoCardText}>
                Hingotanan East, Bien Unido, Bohol
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerBadge}>
              <Text style={styles.footerText}>
                Final Individual Project 2025
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// --------------------------------------------
// AppContent - Uses Database + Session Storage
// --------------------------------------------
function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

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
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  // --------------------------------------------
  // Show Info Screen
  // --------------------------------------------
  if (showInfo) {
    return <InfoScreen onBack={() => setShowInfo(false)} />;
  }

  // --------------------------------------------
  // Screen Routing with Info Button
  // --------------------------------------------
  switch (currentScreen) {
    case 'login':
      return (
        <View style={styles.container}>
          <View style={styles.infoButtonContainer}>
            <TouchableOpacity
              style={styles.topInfoButton}
              onPress={() => setShowInfo(true)}
            >
              <Text style={styles.topInfoButtonText}>ℹ️</Text>
            </TouchableOpacity>
          </View>
          <LoginScreen
            onLogin={handleLogin}
            onNavigateToRegister={() => setCurrentScreen('register')}
          />
        </View>
      );

    case 'register':
      return (
        <View style={styles.container}>
          <View style={styles.infoButtonContainer}>
            <TouchableOpacity
              style={styles.topInfoButton}
              onPress={() => setShowInfo(true)}
            >
              <Text style={styles.topInfoButtonText}>ℹ️</Text>
            </TouchableOpacity>
          </View>
          <RegisterScreen
            onRegisterSuccess={() => setCurrentScreen('login')}
            onNavigateToLogin={() => setCurrentScreen('login')}
          />
        </View>
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

    const tableInfo = await db.getAllAsync('PRAGMA table_info(messages)');
    const hasImageUri = tableInfo.some((col) => col.name === 'imageUri');
    const hasMessageType = tableInfo.some((col) => col.name === 'messageType');

    if (!hasImageUri) {
      await db.runAsync('ALTER TABLE messages ADD COLUMN imageUri TEXT;');
      console.log('✅ Added imageUri column');
    } else {
      console.log('✓ imageUri column already exists');
    }

    if (!hasMessageType) {
      await db.runAsync(
        "ALTER TABLE messages ADD COLUMN messageType TEXT DEFAULT 'text';"
      );
      console.log('✅ Added messageType column');

      await db.runAsync(
        "UPDATE messages SET messageType = 'text' WHERE messageType IS NULL;"
      );
      console.log('✅ Updated existing messages with messageType');
    } else {
      console.log('✓ messageType column already exists');
    }

    console.log('✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during database migration:', error);
  }
}

// --------------------------------------------
// Database Initialization
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
      <View style={styles.appContainer}>
        <AppContent />
      </View>
    </SQLiteProvider>
  );
}

// --------------------------------------------
// STYLES
// --------------------------------------------
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  infoButtonContainer: {
    position: 'absolute',
    top: 40,
    right: 16,
    zIndex: 999,
  },
  topInfoButton: {
    backgroundColor: '#9333ea',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  topInfoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  infoContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  infoHeader: {
    backgroundColor: '#9333ea',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 45,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 32,
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 6,
    borderColor: '#e9d5ff',
  },
  badge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#10b981',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 20,
    color: '#fff',
  },
  infoCards: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  infoCard: {
    backgroundColor: '#f3e8ff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9d5ff',
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
  },
  footerBadge: {
    backgroundColor: '#9333ea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  footerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
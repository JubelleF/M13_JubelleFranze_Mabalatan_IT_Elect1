// App.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shield, LogOut, Users, Ban, Trash2, CheckCircle, AlertCircle, Eye, EyeOff, Gamepad2, Settings } from 'lucide-react-native';

// Mock Authentication System
const mockAuth = {
  currentUser: null,
  users: [],
  
  async signUp(email, password, username) {
    // List of admin emails
    const adminEmails = [
      'jubellefranze1907@gmail.com'
    ];
    
    const user = {
      id: Date.now().toString(),
      email,
      username,
      role: adminEmails.includes(email.toLowerCase()) ? 'admin' : 'player',
      status: 'active',
      createdAt: new Date().toISOString(),
      stats: { wins: 0, totalDamage: 0, gamesPlayed: 0 }
    };
    this.users.push(user);
    this.currentUser = user;
    await AsyncStorage.setItem('tower_game_users', JSON.stringify(this.users));
    await AsyncStorage.setItem('tower_game_current', JSON.stringify(user));
    return user;
  },
  
  async signIn(email, password) {
    const user = this.users.find(u => u.email === email);
    if (!user) throw new Error('User not found');
    if (user.status === 'disabled') throw new Error('Account is disabled');
    if (user.status === 'deleted') throw new Error('Account has been deleted');
    this.currentUser = user;
    await AsyncStorage.setItem('tower_game_current', JSON.stringify(user));
    return user;
  },
  
  async signOut() {
    this.currentUser = null;
    await AsyncStorage.removeItem('tower_game_current');
  },
  
  async updateUserStatus(userId, status) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.status = status;
      await AsyncStorage.setItem('tower_game_users', JSON.stringify(this.users));
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.status = status;
        await AsyncStorage.setItem('tower_game_current', JSON.stringify(this.currentUser));
      }
    }
  },
  
  async updateUserStats(userId, stats) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.stats = { ...user.stats, ...stats };
      await AsyncStorage.setItem('tower_game_users', JSON.stringify(this.users));
    }
  },
  
  getAllUsers() {
    return this.users.filter(u => u.status !== 'deleted');
  },
  
  async init() {
    const storedUsers = await AsyncStorage.getItem('tower_game_users');
    const storedCurrent = await AsyncStorage.getItem('tower_game_current');
    if (storedUsers) this.users = JSON.parse(storedUsers);
    if (storedCurrent) this.currentUser = JSON.parse(storedCurrent);
  }
};

const CHARACTERS = {
  archer: {
    name: 'Archer',
    icon: '🏹',
    skills: [
      { id: 'burning', name: 'Burning Arrow', damage: 150, color: '#f97316' },
      { id: 'freezing', name: 'Freezing Arrow', damage: 100, color: '#60a5fa' },
      { id: 'rain', name: 'Rain of Arrows', damage: 200, color: '#a855f7' },
      { id: 'wind', name: 'Wind Arrow', damage: 50, color: '#4ade80' }
    ]
  },
  warrior: {
    name: 'Warrior',
    icon: '⚔️',
    skills: [
      { id: 'slash', name: 'Sword Slash', damage: 50, color: '#6b7280' },
      { id: 'heavy', name: 'Heavy Sword', damage: 200, color: '#dc2626' },
      { id: 'giant', name: 'Giant Sword', damage: 100, color: '#2563eb' },
      { id: 'earthquake', name: 'Earthquake Sword', damage: 150, color: '#d97706' }
    ]
  },
  witch: {
    name: 'Witch',
    icon: '🔮',
    skills: [
      { id: 'blackmagic', name: 'Black Magic', damage: 200, color: '#581c87' },
      { id: 'voodoo', name: 'Voodoo', damage: 50, color: '#15803d' },
      { id: 'curse', name: 'Curse', damage: 100, color: '#4f46e5' },
      { id: 'spell', name: 'Spell Attack', damage: 150, color: '#db2777' }
    ]
  },
  dwarf: {
    name: 'Dwarf',
    icon: '🔨',
    skills: [
      { id: 'fast', name: 'Fast Hammer', damage: 150, color: '#ca8a04' },
      { id: 'lightning', name: 'Lightning', damage: 200, color: '#facc15' },
      { id: 'double', name: 'Double Hammer', damage: 100, color: '#ea580c' },
      { id: 'throw', name: 'Hammer Throw', damage: 50, color: '#ef4444' }
    ]
  }
};

export default function TowerDefenseGame() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('auth');
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [towerHP, setTowerHP] = useState(525);
  const [totalDamage, setTotalDamage] = useState(0);
  const [battleLog, setBattleLog] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    initApp();
  }, []);
  //add*
useEffect(() => {
  if (screen === 'admin') {
    loadUsers();
  }
}, [screen]);

  const initApp = async () => {
    await mockAuth.init();
    if (mockAuth.currentUser) {
      setUser(mockAuth.currentUser);
      setScreen('menu'); // Always start at menu for both admin and player
    }
  };

  const handleAuth = async () => {
    setError('');
    try {
      let userData;
      if (authMode === 'signup') {
        if (!username.trim()) {
          setError('Username is required');
          return;
        }
        userData = await mockAuth.signUp(email, password, username);
      } else {
        userData = await mockAuth.signIn(email, password);
      }
      setUser(userData);
      setScreen('menu');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    await mockAuth.signOut();
    setUser(null);
    setScreen('auth');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const loadUsers = async () => {
    // Reload users from storage to get the latest data
    const storedUsers = await AsyncStorage.getItem('tower_game_users');
    if (storedUsers) {
      mockAuth.users = JSON.parse(storedUsers);
    }
    setAllUsers(mockAuth.getAllUsers());
  };

  const handleUserAction = async (userId, action, username) => {
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${action} ${username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            await mockAuth.updateUserStatus(userId, action);
            loadUsers();
          }
        }
      ]
    );
  };

  const useSkill = async (skill) => {
    if (gameWon) return;
    
    const newHP = Math.max(0, towerHP - skill.damage);
    setTowerHP(newHP);
    setTotalDamage(prev => prev + skill.damage);
    
    setBattleLog(prev => [
      { skill: skill.name, damage: skill.damage, remaining: newHP },
      ...prev.slice(0, 4)
    ]);
    
    if (newHP <= 0) {
      setGameWon(true);
      const newStats = {
        wins: user.stats.wins + 1,
        totalDamage: user.stats.totalDamage + totalDamage + skill.damage,
        gamesPlayed: user.stats.gamesPlayed + 1
      };
      await mockAuth.updateUserStats(user.id, newStats);
      setUser({ ...user, stats: newStats });
    }
  };

  const resetGame = () => {
    setTowerHP(525);
    setTotalDamage(0);
    setBattleLog([]);
    setGameWon(false);
    setSelectedCharacter(null);
    setScreen('menu');
  };

  // Auth Screen
  if (screen === 'auth') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.authContainer}>
              <Shield color="#fbbf24" size={64} style={styles.logo} />
              <Text style={styles.title}>Tower Defense</Text>
              <Text style={styles.subtitle}>Destroy the tower and claim victory!</Text>

              <View style={styles.tabContainer}>
                <TouchableOpacity
                  onPress={() => setAuthMode('signin')}
                  style={[styles.tab, authMode === 'signin' && styles.tabActive]}
                >
                  <Text style={[styles.tabText, authMode === 'signin' && styles.tabTextActive]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAuthMode('signup')}
                  style={[styles.tab, authMode === 'signup' && styles.tabActive]}
                >
                  <Text style={[styles.tabText, authMode === 'signup' && styles.tabTextActive]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              {authMode === 'signup' && (
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#9ca3af"
                  value={username}
                  onChangeText={setUsername}
                />
              )}
              
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff color="#9ca3af" size={22} />
                  ) : (
                    <Eye color="#9ca3af" size={22} />
                  )}
                </TouchableOpacity>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <AlertCircle color="#fca5a5" size={20} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
                <Text style={styles.authButtonText}>
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.tip}>
                Created and Developed by: Jubelle Franze with Claude
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

// Admin Panel
if (screen === 'admin') {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView>

        <View style={styles.adminHeader}>
          <View>
            <Text style={styles.adminTitle}>Admin Dashboard</Text>
            <Text style={styles.adminSubtitle}>Welcome, {user.username}</Text>
          </View>

          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => setScreen('menu')}
            >
              <Gamepad2 color="#fff" size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <LogOut color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.userListContainer}>
          <View style={styles.sectionHeader}>
            <Users color="#fff" size={24} />
            <Text style={styles.sectionTitle}>Player Management</Text>
          </View>

          {allUsers.map(u => (
            <View key={u.id} style={styles.userCard}>

              <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{u.username}</Text>

                  <View style={[styles.badge, u.role === 'admin' ? styles.badgeAdmin : styles.badgePlayer]}>
                    <Text style={styles.badgeText}>{u.role}</Text>
                  </View>

                  <View style={[styles.badge, u.status === 'active' ? styles.badgeActive : styles.badgeInactive]}>
                    <Text style={styles.badgeText}>{u.status}</Text>
                  </View>
                </View>

                <Text style={styles.userEmail}>{u.email}</Text>

                <View style={styles.statsRow}>
                  <Text style={styles.statText}>🏆 {u.stats.wins} wins</Text>
                  <Text style={styles.statText}>⚔️ {u.stats.totalDamage} dmg</Text>
                  <Text style={styles.statText}>🎮 {u.stats.gamesPlayed} games</Text>
                </View>
              </View>

              {u.role !== 'admin' && (
                <View style={styles.actionButtons}>
                  {u.status === 'active' ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.disableButton]}
                      onPress={() => handleUserAction(u.id, 'disabled', u.username)}>
                      <Ban color="#fff" size={16} />
                      <Text style={styles.actionButtonText}>Disable</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.enableButton]}
                      onPress={() => handleUserAction(u.id, 'active', u.username)}>
                      <CheckCircle color="#fff" size={16} />
                      <Text style={styles.actionButtonText}>Enable</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleUserAction(u.id, 'deleted', u.username)}>
                    <Trash2 color="#fff" size={16} />
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

  // Character Selection / Main Menu
  if (screen === 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView>
          <View style={styles.menuHeader}>
            <View>
              <Text style={styles.menuTitle}>Welcome, {user.username}!</Text>
              <Text style={styles.menuSubtitle}>Choose your character</Text>
              {user.role === 'admin' && (
                <View style={styles.adminBadgeContainer}>
                  <Text style={styles.adminBadgeText}>👑 Admin Account</Text>
                </View>
              )}
            </View>
            <View style={styles.headerButtons}>
              {user.role === 'admin' && (
                <TouchableOpacity 
                  style={styles.adminButton} 
                  onPress={() => setScreen('admin')}
                >
                  <Settings color="#fff" size={20} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <LogOut color="#fff" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.characterGrid}>
            {Object.entries(CHARACTERS).map(([key, char]) => (
              <TouchableOpacity
                key={key}
                style={styles.characterCard}
                onPress={() => {
                  setSelectedCharacter(key);
                  setScreen('game');
                }}
              >
                <Text style={styles.characterIcon}>{char.icon}</Text>
                <Text style={styles.characterName}>{char.name}</Text>
                {char.skills.map(skill => (
                  <Text key={skill.id} style={styles.skillText}>
                    {skill.name}: {skill.damage} dmg
                  </Text>
                ))}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Your Stats</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statText}>🏆 Wins: {user.stats.wins}</Text>
              <Text style={styles.statText}>⚔️ Damage: {user.stats.totalDamage}</Text>
              <Text style={styles.statText}>🎮 Games: {user.stats.gamesPlayed}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Game Screen
  const character = CHARACTERS[selectedCharacter];
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView>
        <View style={styles.gameHeader}>
          <View style={styles.characterInfo}>
            <Text style={styles.characterIconLarge}>{character.icon}</Text>
            <Text style={styles.characterNameLarge}>{character.name}</Text>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={resetGame}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.towerCard}>
          <View style={styles.towerInfo}>
            <Text style={styles.towerLabel}>Tower HP</Text>
            <Text style={styles.towerHP}>{towerHP} / 525</Text>
          </View>
          <View style={styles.healthBarContainer}>
            <View 
              style={[styles.healthBar, { width: `${(towerHP / 525) * 100}%` }]}
            />
          </View>
        </View>

        {gameWon && (
          <View style={styles.victoryCard}>
            <Text style={styles.victoryTitle}>🎉 Victory! 🎉</Text>
            <Text style={styles.victoryText}>Total Damage: {totalDamage}</Text>
          </View>
        )}

        <View style={styles.skillGrid}>
          {character.skills.map(skill => (
            <TouchableOpacity
              key={skill.id}
              style={[styles.skillButton, { backgroundColor: skill.color }, gameWon && styles.skillButtonDisabled]}
              onPress={() => useSkill(skill)}
              disabled={gameWon}
            >
              <Text style={styles.skillName}>{skill.name}</Text>
              <Text style={styles.skillDamage}>{skill.damage} DMG</Text>
            </TouchableOpacity>
          ))}
        </View>

        {battleLog.length > 0 && (
          <View style={styles.logCard}>
            <Text style={styles.logTitle}>Battle Log</Text>
            {battleLog.map((log, i) => (
              <Text key={i} style={styles.logText}>
                ⚔️ {log.skill} dealt {log.damage} damage! Tower HP: {log.remaining}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  authContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  logo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 30,
  },
  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    color: '#d1d5db',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    marginBottom: 15,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    color: '#fff',
    fontSize: 16,
  },
  eyeButton: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    gap: 10,
    width: '100%',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    flex: 1,
  },
  authButton: {
    width: '100%',
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tip: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 15,
    borderRadius: 15,
  },
  adminTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  adminSubtitle: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  playButton: {
    backgroundColor: '#22c55e',
    padding: 12,
    borderRadius: 10,
  },
  adminButton: {
    backgroundColor: '#a855f7',
    padding: 12,
    borderRadius: 10,
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 10,
  },
  userListContainer: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  userInfo: {
    marginBottom: 10,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  badgeAdmin: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
  },
  badgePlayer: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  badgeActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
  },
  badgeInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  userEmail: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
    flexWrap: 'wrap',
  },
  statText: {
    color: '#d1d5db',
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disableButton: {
    backgroundColor: '#f97316',
  },
  enableButton: {
    backgroundColor: '#22c55e',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 15,
    borderRadius: 15,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 5,
  },
  adminBadgeContainer: {
    marginTop: 8,
  },
  adminBadgeText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 'bold',
  },
  characterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 10,
  },
  characterCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  characterIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  characterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  skillText: {
    color: '#d1d5db',
    fontSize: 11,
    marginTop: 3,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 15,
    padding: 15,
    borderRadius: 15,
  },
  statsTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 15,
    borderRadius: 15,
  },
  characterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  characterIconLarge: {
    fontSize: 40,
  },
  characterNameLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  towerCard: {
    backgroundColor: '#dc2626',
    margin: 15,
    padding: 20,
    borderRadius: 15,
  },
  towerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  towerLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  towerHP: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  healthBarContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  healthBar: {
    backgroundColor: '#22c55e',
    height: '100%',
  },
  victoryCard: {
    backgroundColor: '#22c55e',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  victoryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  victoryText: {
    color: '#fff',
    fontSize: 16,
  },
  skillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 10,
  },
  skillButton: {
    width: '48%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  skillButtonDisabled: {
    opacity: 0.5,
  },
  skillName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  skillDamage: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    margin: 15,
    padding: 15,
    borderRadius: 15,
  },
  logTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  logText: {
    color: '#d1d5db',
    fontSize: 13,
    marginTop: 5,
  },
});
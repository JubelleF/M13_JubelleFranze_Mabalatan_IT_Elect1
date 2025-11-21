// screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

// Admin username - this user can delete other users
const ADMIN_USERNAME = 'jubelle';

export default function HomeScreen({ currentUser, onLogout, onOpenChat }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedFullName, setEditedFullName] = useState('');
  const [editedProfilePhoto, setEditedProfilePhoto] = useState('');
  const db = useSQLiteContext();

  const isAdmin = currentUser.username === ADMIN_USERNAME;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const results = await db.getAllAsync(
        'SELECT id, username, fullName, profilePhoto, createdAt FROM users WHERE id != ? ORDER BY fullName',
        [currentUser.id]
      );

      const usersWithLastMessage = await Promise.all(
        results.map(async (user) => {
          const lastMessage = await db.getFirstAsync(
            `SELECT message, timestamp, senderId 
             FROM messages 
             WHERE (senderId = ? AND receiverId = ?) 
                OR (senderId = ? AND receiverId = ?)
             ORDER BY timestamp DESC 
             LIMIT 1`,
            [currentUser.id, user.id, user.id, currentUser.id]
          );

          const unreadResult = await db.getFirstAsync(
            `SELECT COUNT(*) as count 
             FROM messages 
             WHERE senderId = ? AND receiverId = ? AND isRead = 0`,
            [user.id, currentUser.id]
          );

          return {
            ...user,
            lastMessage: lastMessage?.message || 'No messages yet',
            lastMessageTime: lastMessage?.timestamp || null,
            unreadCount: unreadResult?.count || 0,
            isYou: lastMessage?.senderId === currentUser.id,
          };
        })
      );

      setUsers(usersWithLastMessage);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) {
      const minutes = Math.floor(diff / 60000);
      return minutes < 1 ? 'now' : `${minutes}m`;
    }
    if (hours < 24) return `${hours}h`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUserPress = (user) => {
    setSelectedUser(user);
    setEditMode(false);
    setModalVisible(true);
  };

  const handleViewOwnProfile = () => {
    setSelectedUser(currentUser);
    setEditMode(false);
    setModalVisible(true);
  };

  const handleEditProfile = () => {
    setEditMode(true);
    setEditedFullName(currentUser.fullName);
    setEditedProfilePhoto(currentUser.profilePhoto || '');
  };

  const handleSaveProfile = async () => {
    try {
      await db.runAsync(
        'UPDATE users SET fullName = ?, profilePhoto = ? WHERE id = ?',
        [editedFullName.trim(), editedProfilePhoto.trim(), currentUser.id]
      );

      // Update currentUser object
      currentUser.fullName = editedFullName.trim();
      currentUser.profilePhoto = editedProfilePhoto.trim();

      setEditMode(false);
      setModalVisible(false);
      loadUsers();
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleDeleteUser = (user) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.fullName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete user's messages
              await db.runAsync(
                'DELETE FROM messages WHERE senderId = ? OR receiverId = ?',
                [user.id, user.id]
              );
              
              // Delete user
              await db.runAsync('DELETE FROM users WHERE id = ?', [user.id]);
              
              setModalVisible(false);
              loadUsers();
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => onOpenChat(item)}
      onLongPress={() => handleUserPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.profilePhoto ? (
          <Image 
            source={{ uri: item.profilePhoto }} 
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {item.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {item.unreadCount > 0 && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.fullName}
          </Text>
          {item.lastMessageTime && (
            <Text style={styles.timestamp}>
              {formatTime(item.lastMessageTime)}
            </Text>
          )}
        </View>
        <View style={styles.messagePreview}>
          <Text 
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.unreadMessage
            ]} 
            numberOfLines={1}
          >
            {item.isYou ? 'You: ' : ''}{item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.infoButton}
        onPress={() => handleUserPress(item)}
      >
        <Text style={styles.infoButtonText}>ⓘ</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderProfileModal = () => {
    if (!selectedUser) return null;

    const isOwnProfile = selectedUser.id === currentUser.id;
    const displayUser = isOwnProfile ? currentUser : selectedUser;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditMode(false);
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => {
              setModalVisible(false);
              setEditMode(false);
            }}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <ScrollView 
                style={styles.modalContent}
                contentContainerStyle={styles.modalScrollContent}
                bounces={false}
              >
                {/* Profile Header */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setModalVisible(false);
                      setEditMode(false);
                    }}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>
                    {isOwnProfile ? 'My Profile' : 'User Profile'}
                  </Text>
                  <View style={styles.headerSpacer} />
                </View>

                {/* Avatar */}
                <View style={styles.modalAvatarContainer}>
                  {displayUser.profilePhoto ? (
                    <Image 
                      source={{ uri: displayUser.profilePhoto }} 
                      style={styles.modalAvatar}
                    />
                  ) : (
                    <View style={[styles.modalAvatar, styles.avatarPlaceholder]}>
                      <Text style={styles.modalAvatarText}>
                        {displayUser.fullName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Profile Info */}
                <View style={styles.profileInfo}>
                  {editMode ? (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput
                          style={styles.input}
                          value={editedFullName}
                          onChangeText={setEditedFullName}
                          placeholder="Enter full name"
                          placeholderTextColor="#8E8E93"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Profile Photo URL</Text>
                        <TextInput
                          style={styles.input}
                          value={editedProfilePhoto}
                          onChangeText={setEditedProfilePhoto}
                          placeholder="Enter image URL"
                          placeholderTextColor="#8E8E93"
                          autoCapitalize="none"
                        />
                      </View>

                      <View style={styles.buttonRow}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.cancelButton]}
                          onPress={() => setEditMode(false)}
                        >
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.saveButton]}
                          onPress={handleSaveProfile}
                        >
                          <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Full Name</Text>
                        <Text style={styles.infoValue}>{displayUser.fullName}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Username</Text>
                        <Text style={styles.infoValue}>@{displayUser.username}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Member Since</Text>
                        <Text style={styles.infoValue}>
                          {formatDate(displayUser.createdAt)}
                        </Text>
                      </View>

                      {isOwnProfile && (
                        <>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>User ID</Text>
                            <Text style={styles.infoValue}>{displayUser.id}</Text>
                          </View>
                          {isAdmin && (
                            <View style={styles.adminBadge}>
                              <Text style={styles.adminBadgeText}>👑 Admin</Text>
                            </View>
                          )}
                        </>
                      )}

                      {/* Action Buttons */}
                      <View style={styles.actionContainer}>
                        {isOwnProfile ? (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                            onPress={handleEditProfile}
                          >
                            <Text style={styles.editButtonText}>Edit Profile</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.messageButton]}
                            onPress={() => {
                              setModalVisible(false);
                              onOpenChat(selectedUser);
                            }}
                          >
                            <Text style={styles.messageButtonText}>💬 Send Message</Text>
                          </TouchableOpacity>
                        )}

                        {isAdmin && !isOwnProfile && (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDeleteUser(selectedUser)}
                          >
                            <Text style={styles.deleteButtonText}>🗑️ Delete User</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </>
                  )}
                </View>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleViewOwnProfile}>
              {currentUser.profilePhoto ? (
                <Image 
                  source={{ uri: currentUser.profilePhoto }} 
                  style={styles.headerAvatar}
                />
              ) : (
                <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
                  <Text style={styles.headerAvatarText}>
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Messages</Text>
              <Text style={styles.headerSubtitle}>
                {currentUser.fullName} {isAdmin && '👑'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={users.length === 0 ? styles.emptyListContainer : styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#0A84FF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>💬</Text>
            </View>
            <Text style={styles.emptyText}>No Conversations Yet</Text>
            <Text style={styles.emptySubtext}>
              When you start chatting with other users,{'\n'}
              your conversations will appear here
            </Text>
          </View>
        }
      />

      {renderProfileModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    backgroundColor: '#1C1C1E',
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#38383A',
  },
  logoutText: {
    color: '#0A84FF',
    fontSize: 15,
    fontWeight: '600',
  },
  listContainer: {
    paddingTop: 8,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  userItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1C1C1E',
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#30D158',
    borderWidth: 2,
    borderColor: '#1C1C1E',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '400',
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 15,
    color: '#8E8E93',
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  infoButtonText: {
    fontSize: 18,
    color: '#0A84FF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalScrollContent: {
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 32,
  },
  modalAvatarContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  modalAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#2C2C2E',
  },
  modalAvatarText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '600',
  },
  profileInfo: {
    paddingHorizontal: 20,
  },
  infoRow: {
    backgroundColor: '#2C2C2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  adminBadge: {
    backgroundColor: '#FFD60A',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  adminBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  actionContainer: {
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#0A84FF',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    backgroundColor: '#0A84FF',
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF453A',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Edit Mode Styles
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#38383A',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderWidth: 1,
    borderColor: '#38383A',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0A84FF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CommentSection from './CommentSection';

const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.addToStoryButton}>
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.addToStoryText}>Add to story</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Jubelle Franze Mabalatan</Text>
            <Text style={styles.friendCount}>1K friends</Text>
            
            <TouchableOpacity style={styles.editProfileButton}>
              <Text style={styles.editProfileText}>Edit profile</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Share Song Prompt */}
        <View style={styles.shareSongContainer}>
          <View style={styles.shareSongHeader}>
            <Text style={styles.shareSongTitle}>Share a song...</Text>
          </View>
          
          <View style={styles.shareSongInput}>
            <Ionicons name="musical-notes" size={24} color="#888" />
            <Text style={styles.shareSongPlaceholder}>What song are you listening to?</Text>
          </View>
        </View>
        
        {/* Recent Activity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          {/* You would map through recent activities here */}
          <View style={styles.emptyState}>
            <Ionicons name="musical-note" size={50} color="#ddd" />
            <Text style={styles.emptyStateText}>No recent activity yet</Text>
          </View>
        </View>
        <CommentSection />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  addToStoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1877f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  addToStoryText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  friendCount: {
    color: '#666',
    marginBottom: 12,
  },
  editProfileButton: {
    backgroundColor: '#e4e6eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  editProfileText: {
    fontWeight: '600',
  },
  shareSongContainer: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  shareSongHeader: {
    marginBottom: 12,
  },
  shareSongTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareSongInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 12,
    borderRadius: 20,
  },
  shareSongPlaceholder: {
    marginLeft: 8,
    color: '#888',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 12,
    color: '#888',
  },
});

export default ProfileScreen;
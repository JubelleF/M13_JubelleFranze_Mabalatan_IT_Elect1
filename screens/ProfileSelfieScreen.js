// screens/ProfileSelfieScreen.js
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, PermissionsAndroid } from 'react-native';
import { launchCamera } from 'react-native-image-picker'; // Or use Expo equivalent

// If using Expo, replace with:
// import { Camera } from 'expo-camera';
// import { Asset } from 'expo-asset';

export default function ProfileSelfieScreen({ navigation }) {
  const [selfieUri, setSelfieUri] = useState(null);

  // For Expo, use this instead of image-picker
  const takeSelfie = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
      if (!result.canceled) {
        setSelfieUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not take selfie: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Act 2: Profile & Selfie</Text>
      
      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Profile Picture</Text>
        <Image
          source={require('../Pics/jubellefranze.jpg')} // Make sure this file exists
          style={styles.profileImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.selfieSection}>
        <Text style={styles.sectionTitle}>Your Selfie</Text>
        {selfieUri ? (
          <Image source={{ uri: selfieUri }} style={styles.selfieImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text>No selfie yet</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={takeSelfie}>
        <Text style={styles.buttonText}>Take Selfie</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('SQLiteChat')}>
        <Text style={styles.navButtonText}>Next: SQLite Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selfieSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  selfieImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
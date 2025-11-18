import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
const UserForm = () => {
 const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
 const db = useSQLiteContext();
 const handleSubmit = async () => {
 try {
 if (!form.firstName || !form.lastName || !form.email || !form.phone) {
 throw new Error('All fields are required');
 }
 await db.runAsync(
 'INSERT INTO users (firstName, lastName, email, phone) VALUES (?, ?, ?, ?)',
 [form.firstName, form.lastName, form.email, form.phone]
 );
 Alert.alert('Success', 'User added successfully!');
 setForm({ firstName: '', lastName: '', email: '', phone: '' });
 } catch (err) {
 console.error(err);
 Alert.alert('Error', err.message || 'An error occurred while adding the user.');
 }
 };
 return (
 <View style={styles.container}>
 <TextInput
 style={styles.input}
 placeholder="First Name"
 value={form.firstName}
 onChangeText={(text) => setForm({ ...form, firstName: text })}
 />
 <TextInput
 style={styles.input}
 placeholder="Last Name"
 value={form.lastName}
 onChangeText={(text) => setForm({ ...form, lastName: text })}
 />
 <TextInput
 style={styles.input}
 placeholder="Email"
 autoCapitalize="none"
 keyboardType="email-address"
 value={form.email}
 onChangeText={(text) => setForm({ ...form, email: text })}
 />
 <TextInput
 style={styles.input}
 placeholder="Phone"
 keyboardType="phone-pad"
 value={form.phone}
 onChangeText={(text) => setForm({ ...form, phone: text })}
 />
  <Button title="Add User" onPress={handleSubmit} />
 </View>
 );
};
const styles = StyleSheet.create({
 container: {
 padding: 20,
 backgroundColor: '#fff',
 borderRadius: 10,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.25,
 shadowRadius: 3.84,
 elevation: 5,
 margin: 16,
 },
 input: {
 height: 40,
 borderColor: '#ccc',
 borderWidth: 1,
 marginBottom: 10,
 paddingHorizontal: 10,
 borderRadius: 6,
 },
});
export default UserForm;
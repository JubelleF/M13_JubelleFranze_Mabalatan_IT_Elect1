import React, { useEffect, useState } from 'react';
import { FlatList, Text, View, ActivityIndicator, RefreshControl } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
const UserList = () => {
 const [users, setUsers] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const db = useSQLiteContext();
 const loadUsers = async () => {
 try {
 const results = await db.getAllAsync('SELECT * FROM users');
 setUsers(results);
 } catch (error) {
 console.error('Database error', error);
 } finally {
 setIsLoading(false);
 }
 };
 useEffect(() => {
 loadUsers();
 }, []);
 if (isLoading) {
 return <ActivityIndicator size="large" color="#0000ff" />;
 }
 return (
 <FlatList
 data={users}
 refreshControl={
 <RefreshControl refreshing={isLoading} onRefresh={loadUsers} tintColor="#007" />
 }
 keyExtractor={(item) => item.id.toString()}
 renderItem={({ item }) => (
 <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
 <Text>{`${item.firstName} ${item.lastName}`}</Text>
 <Text>{item.email}</Text>
 <Text>{item.phone}</Text>
 </View>
 )}
 ListEmptyComponent={<Text>No users found</Text>}
 />
 );
};
export default UserList;
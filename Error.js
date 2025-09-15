import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Import your screens
import ChatScreen from './ChatScreen'; // Assuming you have HomeScreen.jsx
import CommentSection from './CommentSection'; // Assuming you have AboutScreen.jsx
import CounterApp from './CounterApp'; // Assuming you have ContactScreen.jsx
import ColorChangerApp from './ColorChangerApp'; // Import the new ServicesScreen

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Chat Screen" component={ChatScreen} />
        <Stack.Screen name="Comment Section" component={CommentSection} />
        <Stack.Screen name="Counter" component={CounterApp} />
        <Stack.Screen name="Color Changes" component={ColorChangerApp} /> {/* Add the Services screen */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

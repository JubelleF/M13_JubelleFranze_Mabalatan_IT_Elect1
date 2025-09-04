import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';

function ShoppingCart() {
  const [quantity, setQuantity] = useState(0);
  const [price] = useState(100);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping Cart</Text>
      <Text style={styles.subtitle}>10 Limited Edition t-shirt 100 only</Text>
      <Text style={styles.text}>Quantity: {quantity}</Text>
      <Text style={styles.text}>Total: {quantity * price}</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="+" 
          onPress={() => quantity <= 9 && setQuantity(quantity + 1)} 
        />
        <Button 
          title="-" 
          onPress={() => quantity >= 1 && setQuantity(quantity > 0 ? quantity - 1 : 0)} 
        />
        <Button 
          title="max" 
          onPress={() => setQuantity(10)} 
        />
        <Button 
          title="reset" 
          onPress={() => setQuantity(0)} 
        />
        <Button 
          title="min" 
          onPress={() => setQuantity(1)} 
        />
        <Button 
          title="Checkout" 
          onPress={() => {
            if (quantity) {
              Alert.alert("Success", "Checkout Successfully!");
            } else {
              Alert.alert("Error", "Invalid Purchase!");
            }
          }} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
});

export default ShoppingCart;
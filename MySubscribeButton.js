
import React from 'react';
import { Button, Alert} from 'react-native';

const MySubscribeButton = () => (
  <Button
    title="Subscribe Now"
    onPress={() => Alert.alert('Subscription process initiated!')}
  />
);
export default MySubscribeButton;
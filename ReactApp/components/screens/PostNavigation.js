import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';


import PostScreen from './AllPostScreen';
import CreatePost from './CreatePost';
import ClickPostScreen from './ViewPost';

const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
    <Stack.Navigator initialRouteName="PostScreen">
      <Stack.Screen name="PostScreen" component={PostScreen} />
      <Stack.Screen name="CreatePost" component={CreatePost} />
      <Stack.Screen name="ClickPost" component={ClickPostScreen} />
    </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Navigation;
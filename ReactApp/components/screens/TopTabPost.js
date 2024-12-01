import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MyPostScreen from './MyPostScreen';
import AllPostScreen from './AllPostScreen';

const TopTab = createMaterialTopTabNavigator();

const TopTabPost = ({route}) => {

  const { userType, userID } = route.params;

  return (
    <TopTab.Navigator
    initialRouteName='AllPostScreen'
    screenOptions={{
      tabBarActiveTintColor: 'black',
      tabBarIndicatorStyle: {backgroundColor:'#cc0000'}
    }}
    >
      <TopTab.Screen name="All Posts" component={AllPostScreen} initialParams={{ userType, userID }}/>
      <TopTab.Screen name="My Posts" component={MyPostScreen} initialParams={{ userType, userID }}/>
    </TopTab.Navigator>
  );
};

export default TopTabPost;

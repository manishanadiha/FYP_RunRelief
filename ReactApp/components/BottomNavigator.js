import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import ProfileScreen from './screens/ProfileScreen';
import ResourceScreen from './screens/AllResourceScreen';
import TopTabPost from './screens/TopTabPost';
import TopTabResource from './screens/TopTabResource';
import { Entypo } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const PostStack = createStackNavigator();
const ResourceStack = createStackNavigator();

const PostStackScreen = ({ userType, userID }) => (
  <PostStack.Navigator>
    <PostStack.Screen
      name="PostScreen"
      component={TopTabPost}
      options={{ headerShown: false }}
      initialParams={{ userType, userID }}
    />
  </PostStack.Navigator>
);

const ResourceStackScreen = ({ userType, userID }) => (
  <ResourceStack.Navigator>
    <ResourceStack.Screen
      name="PostScreen"
      component={TopTabResource}
      options={{ headerShown: false }}
      initialParams={{ userType, userID }}
    />
  </ResourceStack.Navigator>
);

export default function BottomNavigator({ route }) {
  const { userType, userID } = route.params;

  useEffect(() => {
    console.log('userID in BottomNavigator:', userID);
  }, [userID]);

  return (
    <Tab.Navigator
      initialRouteName="Profile"
      screenOptions={{
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontSize: 12 },
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: '#cc0000' }, // Change header background color
        headerTintColor: 'white', // Change header text color
      }}
    >
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <FontAwesome name="user" size={24} color={focused ? 'black' : 'gray'} />
          ),
        }}
      >
        {() => <ProfileScreen userType={userType} userID={userID} />}
      </Tab.Screen>

      <Tab.Screen
        name="Resources"
        options={{
          tabBarIcon: ({ focused }) => (
            <Entypo name="box" size={26} color={focused ? 'black' : 'gray'} />
          ),
        }}
      >
        {() => <ResourceStackScreen userType={userType} userID={userID}  />}
      </Tab.Screen>

      <Tab.Screen
        name="Post"
        options={{
          tabBarIcon: ({ focused }) => (
            <FontAwesome name="file-text" size={24} color={focused ? 'black' : 'gray'} />
          ),
        }}
      >
        {() => <PostStackScreen userType={userType} userID={userID} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

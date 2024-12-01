import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MyResourceScreen from './MyResourceScreen';
import AllResourceScreen from './AllResourceScreen';

const Tab = createMaterialTopTabNavigator();

const TopTabResource = ({ route }) => {

    const { userType, userID } = route.params;
    const myTabName = userType === 'organization' ? 'My Listings' : 'My Requests';

    // If the user is an admin, render only the AllResourceScreen
    if (userType === 'admin') {
        return (
            <Tab.Navigator
                initialRouteName="AllResourceScreen"
                screenOptions={{
                  
                    tabBarActiveTintColor: 'black',
                    tabBarIndicatorStyle: { backgroundColor: 'white' }
                }}
            >
                <Tab.Screen name="All" component={AllResourceScreen} initialParams={{ userType, userID }} />
            </Tab.Navigator>
        );
    }

    // For other user types, render both AllResourceScreen and MyResourceScreen
    return (
        <Tab.Navigator
            initialRouteName="AllResourceScreen"
            screenOptions={{
                tabBarActiveTintColor: 'black',
                tabBarIndicatorStyle: { backgroundColor: '#cc0000' }
            }}
        >
            <Tab.Screen name="All" component={AllResourceScreen} initialParams={{ userType, userID }} />
            <Tab.Screen name={myTabName} component={MyResourceScreen} initialParams={{ userType, userID }}/>
            </Tab.Navigator>
    );
};

export default TopTabResource;

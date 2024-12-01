import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import RegisterPublicUser from './components/RegisterPublicUser';
import RegisterOrganization from './components/RegisterOrganization';
import BottomNavigator from './components/BottomNavigator';
import PostNavigation from './components/screens/PostNavigation';
import CreatePost from './components/screens/CreatePost';
import ViewPost  from './components/screens/ViewPost';
import EditProfile from './components/screens/EditProfile'
import AddResource from './components/screens/AddResource'
import AddressMap from './components/screens/AddressMap'
import ViewListing from './components/screens/ViewListing';
import AcceptedUsers from './components/screens/AcceptedUsers'
import EditPost from './components/screens/EditPost'
import UnverifiedPublic from './components/screens/UnverifiedPublic'
import UnverifiedOrganization from './components/screens/UnverifiedOrganization'


const Stack = createStackNavigator();


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login"
      screenOptions={{headerShown:false}}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="RegisterPublicUser" component={RegisterPublicUser} />
        <Stack.Screen name="RegisterOrganization" component={RegisterOrganization} />
        <Stack.Screen name="BottomNavigator" component={BottomNavigator} />
        <Stack.Screen name="CreatePost" component={CreatePost} />
        <Stack.Screen name="ViewPost" component={ViewPost} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="AddResource" component={AddResource} />
        <Stack.Screen name="AddressMap" component={AddressMap} />
        <Stack.Screen name="ViewListing" component={ViewListing} />
        <Stack.Screen name="AcceptedUsers" component={AcceptedUsers} />
        <Stack.Screen name="EditPost" component={EditPost} />
        <Stack.Screen name="UnverifiedPublic" component={UnverifiedPublic} />
        <Stack.Screen name="UnverifiedOrganization" component={UnverifiedOrganization} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
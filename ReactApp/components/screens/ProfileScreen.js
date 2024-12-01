import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Button, TextInput, Image, ActivityIndicator, Touchable } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import * as DocumentPicker from 'expo-document-picker';



const ProfileScreen = (props) => {
  const navigation = useNavigation();
  const route = useRoute();

  // Destructure userType and userID from props
  const { userType, userID } = props;
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);


  useEffect(() => {
    console.log('userID in ProfileScreen:', userID);
    // Log userType for debugging
    console.log('userType in ProfileScreen:', userType);
  }, [userID, userType]); // Log userID and userType whenever they change

  /*useEffect(() => {
    fetchProfile();
  }, []);*/

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://192.168.1.105:5000/profile/${userType}/${userID}`);
      const data = await response.json();
      setProfile(data);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch profile');
    }
  };

  const handleLogout = async () => {
    try {

      // Clear stored user data from AsyncStorage
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user_id');
      await AsyncStorage.removeItem('user_type');


      navigation.reset({
        index: 0,
        routes: [{ name: 'Login'}],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userType, userID, profile });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#cc0000" />
        <Text>Loading...</Text>
      </View>
    );
  }



  const handleChooseFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type:'*/*',
      multiple: true,
      copyToCacheDirectory: false,
    })

    
    if (!result.canceled) {
      setSelectedFile(result.assets[0]);
      uploadFile(selectedFile)
    }

    console.log('fileuri' , result.assets[0])
  };

  const uploadFile = async (selectedFile) => { // Change the parameter name to selectedFile
    console.log('selectedfile:' , selectedFile)
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType, // Use mimeType from the selected file
      });

      console.log('formData:' ,formData)

      console.log('selectedfile', selectedFile)
  
      const response = await fetch(`http://192.168.1.105:5000/document/${userType}/${userID}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const data = await response.json();
      if (response.ok) {
        // File uploaded successfully
        console.log(data.message);
      } else {
        // Handle error
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handlePublic = () => {
    navigation.navigate('UnverifiedPublic');
  };

  const handleOrganization = () => {
    navigation.navigate('UnverifiedOrganization');
  };

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/945/945120.png' }} 
        style={styles.profileImage} 
      />
      <Text style={styles.title}>{profile.name}</Text>
      {(userType === 'organization' || userType === 'public_user') && (
      <ScrollView style={styles.profileContainer}>
        <View style={styles.profileItem}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{profile.email}</Text>
        </View>
        {userType === 'organization' && (
          <>
            <View style={styles.profileItem}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{profile.address}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.label}>Telephone:</Text>
              <Text style={styles.value}>{profile.telephone_number}</Text>
            </View>
          </>
        )}
        {userType === 'public_user' && (
          <>
            <View style={styles.profileItem}>
              <Text style={styles.label}>Age:</Text>
              <Text style={styles.value}>{profile.age}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{profile.address ? `${profile.address}, ${profile.location_name}` : profile.location_name}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.label}>Telephone:</Text>
              <Text style={styles.value}>{profile.telephone_number}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.label}>Dependents:</Text>
              <Text style={styles.value}>{profile.num_dependents}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.label}>Income Range:</Text>
              <Text style={styles.value}>{profile.income_range}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.label}>Senior Citizen:</Text>
              <Text style={styles.value}>{profile.senior_citizen ? 'Yes' : 'No'}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.label}>OKU Card Holder:</Text>
              <Text style={styles.value}>{profile.oku_card_holder ? 'Yes' : 'No'}</Text>
            </View>
          </>
        )}
      </ScrollView>
)}
      {(userType === 'admin') && (
      <View style={styles.profileContainer}>
      <View style={styles.profileItem}>
              <Text style={styles.label}>Dashboard</Text>
            </View>
      <TouchableOpacity style={styles.dashboardContainer} onPress={handlePublic}>
      <Text style={styles.label}>Unverified Public Users</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.dashboardContainer} onPress={handleOrganization}>
      <Text style={styles.label}>Unverified Organizations</Text>
      </TouchableOpacity>
     
      </View>
      )}


      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      {(userType === 'organization' || userType === 'public_user') && !profile.is_verified && (
  <View style={styles.profileContainer}>
    <View style={styles.profileItem}>
      <Text style={styles.alert}>Upload Documents for Verification!</Text>
      <TouchableOpacity style={styles.chooseFileButton} onPress={handleChooseFile}>
        <Text style={styles.chooseFileButtonText}>Choose File</Text>
      </TouchableOpacity>
    </View>
  </View>
)}
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'gray',
    marginBottom: 20,
    opacity: 0.75
  },
  profileContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dashboardContainer:{
    width: '100%',
    backgroundColor: '#f7f7f7',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileItem: {
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  alert: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'red'
  },
  value: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  logoutButton: {
    backgroundColor: 'white',
    borderColor: 'grey',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginRight: 10,
    marginBottom: 20
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
  },
  editButton: {
    backgroundColor: '#cc0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 20
  },
  editButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chooseFileButton: {
    backgroundColor: '#D3D3D3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 10,
  },
  chooseFileButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;

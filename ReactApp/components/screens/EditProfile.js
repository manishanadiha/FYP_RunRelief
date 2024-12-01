import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Picker } from '@react-native-picker/picker';

const EditProfileScreen = ({ route }) => {
  const { userType, userID, profile } = route.params;
  const [updatedProfile, setUpdatedProfile] = useState(profile);
  const [selectedPlaceName, setSelectedPlaceName] = useState(profile.location_name || '');
  const navigation = useNavigation();

  const isProfileChanged = () => {
    return JSON.stringify(updatedProfile) !== JSON.stringify(profile);
  };

  useEffect(() => {
    if (route.params && route.params.selectedPlace) {
      setUpdatedProfile((prevProfile) => ({
        ...prevProfile,
        location_lat: route.params.selectedPlace.latitude,
        location_lon: route.params.selectedPlace.longitude,
        location_name: route.params.selectedPlaceName,
      }));
      setSelectedPlaceName(route.params.selectedPlaceName);
    }
  }, [route.params]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isProfileChanged()) {
          Alert.alert(
            'Discard changes?',
            'You have unsaved changes. Are you sure you want to discard them?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Discard',
                style: 'destructive',
                onPress: () => navigation.goBack(),
              },
            ],
            { cancelable: true }
          );
          return true;
        }
        return false;
      };

      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        if (!isProfileChanged()) {
          return;
        }

        e.preventDefault();

        Alert.alert(
          'Discard changes?',
          'You have unsaved changes. Are you sure you want to discard them?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => {} },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => navigation.dispatch(e.data.action),
            },
          ]
        );
      });

      return () => unsubscribe();
    }, [navigation, updatedProfile])
  );

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`http://192.168.1.105:5000/profile/${userType}/${userID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleChange = (field, value) => {
    setUpdatedProfile({ ...updatedProfile, [field]: value });
  };

  const handleSelectAddress = () => {
    navigation.navigate('AddressMap');
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Profile</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={updatedProfile.name}
          onChangeText={(text) => handleChange('name', text)}
        />
        {userType === 'organization' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={updatedProfile.address}
              multiline={true}
              onChangeText={(text) => handleChange('address', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Telephone"
              value={updatedProfile.telephone_number}
              onChangeText={(text) => handleChange('telephone_number', text)}
            />
          </>
        )}
        {userType === 'public_user' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Age"
              value={updatedProfile.age ? updatedProfile.age.toString() : ''}
              onChangeText={(text) => handleChange('age', parseInt(text))}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={handleSelectAddress}>
              <TextInput
                style={styles.input}
                placeholder="Address"
                value={selectedPlaceName}
                editable={false}
                multiline={true}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Address Details (House No./Block/etc)"
              value={updatedProfile.address}
              onChangeText={(text) => handleChange('address', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Telephone"
              value={updatedProfile.telephone_number}
              onChangeText={(text) => handleChange('telephone_number', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Number of Dependents"
              value={updatedProfile.num_dependents ? updatedProfile.num_dependents.toString() : ''}
              onChangeText={(text) => handleChange('num_dependents', parseInt(text))}
              keyboardType="numeric"
            />
            <Picker
              selectedValue={updatedProfile.income_range}
              onValueChange={(itemValue) => handleChange('income_range', itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Income Range" value="" />
              <Picker.Item label="Below RM2500" value="Below 2500" />
              <Picker.Item label="RM2500 - RM3500" value="RM2500 - RM3500" />
              <Picker.Item label="RM3500 - RM4500" value="RM3500 - RM4500" />
              <Picker.Item label="RM4500 - RM5500" value="RM4500 - RM5500" />
              <Picker.Item label="RM5500 - RM6500" value="RM5500 - RM6500" />
              <Picker.Item label="RM6500 - RM7500" value="RM6500 - RM7500" />
              <Picker.Item label="RM7500 - RM8500" value="RM7500 - RM8500" />
              <Picker.Item label="RM8500 - RM9500" value="RM8500 - RM9500" />
              <Picker.Item label="RM9500 - RM10500" value="RM9500 - RM10500" />
              <Picker.Item label="Above RM10500" value="Above RM10500" />
            </Picker>
            <View style={styles.checkboxContainer}>
              <Text style={styles.checkboxLabel}>Senior Citizen:</Text>
              <TouchableOpacity onPress={() => handleChange('senior_citizen', !updatedProfile.senior_citizen)}>
                <View style={styles.checkbox}>
                  {updatedProfile.senior_citizen && <View style={styles.checked} />}
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.checkboxContainer}>
              <Text style={styles.checkboxLabel}>OKU Card Holder:</Text>
              <TouchableOpacity onPress={() => handleChange('oku_card_holder', !updatedProfile.oku_card_holder)}>
                <View style={styles.checkbox}>
                  {updatedProfile.oku_card_holder && <View style={styles.checked} />}
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
        <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
          <Text style={styles.buttonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    justifyContent: 'top',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  header: {
    alignItems: 'left',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  form: {
    marginBottom: 24,
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#C9D3DB',
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#C9D3DB',
  },
  button: {
    backgroundColor: '#cc0000',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#C9D3DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    width: 12,
    height: 12,
    backgroundColor: '#cc0000',
  },
});

export default EditProfileScreen;

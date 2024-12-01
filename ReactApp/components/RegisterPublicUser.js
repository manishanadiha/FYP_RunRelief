import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Picker } from '@react-native-picker/picker';

export default function PublicUserRegister({ navigation, route }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [telephoneNumber, setTelephoneNumber] = useState('');
  const [numDependents, setNumDependents] = useState('');
  const [incomeRange, setIncomeRange] = useState('');
  const [seniorCitizen, setSeniorCitizen] = useState(false);
  const [okuCardHolder, setOkuCardHolder] = useState(false);
  const [location, setLocation] = useState(null);
  const [selectedPlaceName, setSelectedPlaceName] = useState('');
  

  useEffect(() => {
    if (route.params && route.params.selectedPlace) {
      setLocation(route.params.selectedPlace);
    }
    if (route.params && route.params.selectedPlaceName) {
      setSelectedPlaceName(route.params.selectedPlaceName);
    }
  }, [route.params]);

  const handleRegister = async () => {
    try {
      const response = await fetch('http://192.168.1.105:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'public_user',
          name,
          email,
          password,
          age: parseInt(age),
          address,
          telephone_number: telephoneNumber,
          num_dependents: parseInt(numDependents),
          income_range: incomeRange,
          senior_citizen: seniorCitizen,
          oku_card_holder: okuCardHolder,
          location_lat: location.latitude,
          location_lon: location.longitude,
          location_name: selectedPlaceName
        }),
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const userData = await response.json();
      Alert.alert('Success', userData.message);
      navigation.navigate('Login'); // Redirect to login screen
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSelectAddress = () => {
    navigation.navigate('AddressMap');
  };

  const handleMapPress = event => {
    const { coordinate } = event.nativeEvent;
    setLocation(coordinate);
  };

  const handlePlaceSelect = (data, details) => {
    if (details) {
      const { lat, lng } = details.geometry.location;
      setLocation({
        latitude: lat,
        longitude: lng
      });
      setSelectedPlaceName(data.description);
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,  // Adjust the zoom level as needed
        longitudeDelta: 0.01,
      });
    } else {
      Alert.alert('Error', 'No place details found for the selected place.');
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Register as public user</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleSelectAddress}>
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
          value={address}
          onChangeText={setAddress}
        />
         <TextInput
          style={styles.input}
          placeholder="Telephone Number"
          value={telephoneNumber}
          onChangeText={setTelephoneNumber}
        />
        <TextInput
          style={styles.input}
          placeholder="Number of Dependents"
          value={numDependents}
          onChangeText={setNumDependents}
          keyboardType="numeric"
        />
        <View style={styles.pickerContainer}>
          {incomeRange === '' && <Text style={styles.pickerPlaceholder}>Select Income Range</Text>}
          <Picker
            selectedValue={incomeRange}
            onValueChange={(itemValue, itemIndex) => setIncomeRange(itemValue)}
          >
            <Picker.Item label="" value="" />
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
        </View>
        <View style={styles.checkboxContainer}>
          <Text style={styles.checkboxLabel}>Senior Citizen:</Text>
          <TouchableOpacity onPress={() => setSeniorCitizen(!seniorCitizen)}>
            <View style={styles.checkbox}>
              {seniorCitizen && <View style={styles.checked} />}
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.checkboxContainer}>
          <Text style={styles.checkboxLabel}>OKU Card Holder:</Text>
          <TouchableOpacity onPress={() => setOkuCardHolder(!okuCardHolder)}>
            <View style={styles.checkbox}>
              {okuCardHolder && <View style={styles.checked} />}
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleRegister} style={styles.btn}>
          <Text style={styles.btnText}>Register</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
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
    fontWeight: '500',
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
    borderColor: 'gray',
  },
  pickerContainer: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'gray',
    justifyContent: 'center',
  },
  pickerPlaceholder: {
    position: 'absolute',
    left: 16,
    color: '#222',
    fontSize: 15,
  },
  btn: {
    backgroundColor: '#cc0000',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  btnText: {
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
    borderColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    width: 12,
    height: 12,
    backgroundColor: '#cc0000',
  },


});

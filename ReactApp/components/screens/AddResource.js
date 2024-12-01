import React, { useState } from 'react';
import { View, Text, TextInput,StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button } from 'react-native-paper';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';




const CreateListingScreen = ({ route, navigation }) => {
  const { userID } = route.params;  
  const [quantity, setQuantity] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [location, setLocation] = useState(null);
  const [resource_type, setResourceType] = useState('');
  const [image, setImage] = useState(null);
  const [selectedPlaceName, setSelectedPlaceName] = useState('');
  const [region, setRegion] = useState({
    latitude: 5.4164,
    longitude: 100.3327,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreateListing = () => {
    // Validate form fields
    if (!quantity || !location || !selectedPlaceName) {
      Alert.alert('Please fill in all fields.');
      return;
    }
  
    // Construct the data object to send to the backend
    const data = new FormData();
    data.append('organization_id', userID);
    data.append('quantity', parseInt(quantity));
    data.append('distribution_date', selectedDate.toISOString());
    data.append('location_lat', location.latitude);
    data.append('location_lon', location.longitude);
    data.append('location_name', selectedPlaceName);
    data.append('resource_type', resource_type);


    if (image) {
      let filename = image.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;

      data.append('picture', {
        uri: image,
        name: filename,
        type: type
      });
    }
  
    console.log('Data to be sent:', data); // Add this line for debugging
  
    fetch('http://192.168.1.105:5000/listings', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      body: data,
    })
    .then(response => {
      if (response.ok) {
        Alert.alert('Listing created successfully!');
        // Clear form fields after successful submission
        setQuantity('');
        setSelectedDate('');
        setLocation(null);
        setSelectedPlaceName('');
        setImage(null); // Clear selected image
        navigation.goBack();
      } else {
        console.log('Response:', response); // Add this line for debugging
        Alert.alert('Error creating listing.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      Alert.alert('Error creating listing. Please try again later.');
    });
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
        latitudeDelta: 0.01,  
        longitudeDelta: 0.01,
      });
    } else {
      Alert.alert('Error', 'No place details found for the selected place.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create a listing</Text>
      </View>

        <TextInput
        style={styles.input}
        placeholder="Quantity"
        keyboardType="numeric"
        value={quantity}
        onChangeText={text => setQuantity(text)}
      />

      <View style={styles.dateContainer}>
        <TextInput
          style={styles.dateInput}
          placeholder="Select Date"
          value={selectedDate.toLocaleString()}
          editable={false}
        />
        <MaterialIcons name="date-range" size={24} color="black" style={styles.calendarIcon} onPress={showDatePicker} />
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
          minimumDate={minDate}
        />

      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onPress={handleMapPress}
        >
          {location && (
            <Marker coordinate={location} title={selectedPlaceName} />
          )}
        </MapView>
        <GooglePlacesAutocomplete
          placeholder="Search"
          fetchDetails={true}  
          onPress={(data, details = null) => handlePlaceSelect(data, details)}
          query={{
            key: 'AIzaSyAMNl74ofAqRXXEsKB0ciNrW8gyKzREUfM',
            language: 'en',
          }}
          styles={{
            container: {
              position: 'absolute',
              marginTop: 5,
              alignSelf: 'center',
              width: '98%',
              zIndex: 1,
            },
            listView: {
              backgroundColor: 'white',
            },
          }}
        />  
    </View> 

    <TextInput
        style={styles.inputItems}
        placeholder="Items (in one set) "
        value={resource_type}
        onChangeText={text => setResourceType(text)}
      />
      <Text style={styles.notice}>(info) each accepted user should receive a standardized set
        consisting of items specified here e.g. 3 cooking oil, 2 sugar...
      </Text>


    <Button onPress={pickImage} style={styles.ImageButton}>
      <Feather name="upload" size={20} color="black" style={styles.icon} />
      <Text style={styles.imageButtonText}>  Upload an image</Text>
    </Button>
      {image && <Image source={{ uri: image }} style={{ width: 300, height: 100 }} />}
      <TouchableOpacity style={styles.button} onPress={handleCreateListing}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>    

  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'top',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    paddingTop: 70,
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
  notice: {
    fontSize: 12.5,
    color: '#333',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  inputItems: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    width: 370, // Adjust the width as needed
  },
  calendarIcon: {
    marginLeft: -40, // Add a margin to separate the icon from the input
  },
  mapContainer: {
    width: '100%',
    height: 300,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  button: {
    backgroundColor: '#cc0000',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 30,
    marginBottom: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  ImageButton: {
    backgroundColor: '#fff',
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: '#000',
    marginBottom: 10
  },
  imageButtonText: {
    fontSize: 15,
    color: '#000', 
    fontWeight: 'normal',
  },
});

export default CreateListingScreen;

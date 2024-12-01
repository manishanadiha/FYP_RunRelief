import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const AddressSelectionScreen = ({ navigation }) => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedPlaceName, setSelectedPlaceName] = useState('');
  const [region, setRegion] = useState({
    latitude: 5.4164,
    longitude: 100.3327,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const handlePlaceSelect = (data, details) => {
    if (details) {
      const { lat, lng } = details.geometry.location;
      setSelectedPlace({ latitude: lat, longitude: lng });
      setSelectedPlaceName(data.description);
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,  
        longitudeDelta: 0.01,
      });
    }
  };

  const handleConfirmAddress = () => {
    if (selectedPlace) {
      navigation.navigate('RegisterPublicUser', { selectedPlace, selectedPlaceName });
    }
  };
  

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onPress={(event) => {
          setSelectedPlace(event.nativeEvent.coordinate);
        }}
      >
        {selectedPlace && <Marker coordinate={selectedPlace} />}
      </MapView>
      <GooglePlacesAutocomplete
        placeholder="Search address"
        fetchDetails={true} 
        onPress={(data, details = null) => handlePlaceSelect(data, details)}
        query={{
          key: 'AIzaSyAMNl74ofAqRXXEsKB0ciNrW8gyKzREUfM',
          language: 'en',
        }}
        styles={{
          container: {
            position: 'absolute',
            marginTop: 50,
            alignSelf: 'center',
            width: '98%',
            zIndex: 1,
          },
          listView: {
            backgroundColor: 'white',
          },
        }}
      />
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmAddress}>
        <Text style={styles.buttonText}>Confirm Address</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  confirmButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#cc0000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddressSelectionScreen;

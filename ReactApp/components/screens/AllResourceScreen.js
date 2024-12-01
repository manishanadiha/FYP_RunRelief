import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FAB, Card } from 'react-native-paper';
import Countdown from 'react-countdown';
import { MaterialIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';


const ResourceScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userType, userID } = route.params || { userType: '', userID: '' };
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isVerified, setIsVerified] = useState(false);


  useFocusEffect(
    useCallback(() => {
      console.log('userType:', userType);
      console.log('userID:', userID);
  
      if (userType === 'public_user') {
        fetchNearbyListings(userID);
      } else if (userType === 'organization' || userType === 'admin') {
        fetchFilteredListings(filter);
      }


      checkUserVerification(userID);



  
      // Polling mechanism
      const intervalId = setInterval(() => {
        if (userType === 'public_user') {
          fetchNearbyListings(userID);
        } else if (userType === 'organization' || userType === 'admin') {
          fetchFilteredListings(filter);
        }
      }, 10000); 
  
      return () => clearInterval(intervalId); // Cleanup on unmount
    }, [userType, userID, filter])
  );

  

  const fetchNearbyListings = async (userID) => {
    try {
      const response = await fetch(`http://192.168.1.105:5000/listings/nearby/${userID}`);
      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error('Error fetching nearby listings:', error);
    }
  };

  const fetchFilteredListings = async (filter) => {
    try {
      let url = 'http://192.168.1.105:5000/listings';
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error('Error fetching filtered listings:', error);
    }
  };

  const checkUserVerification = async (userID) => {
    try {
      const response = await fetch(`http://192.168.1.105:5000/user/${userID}`);
      const data = await response.json();
      setIsVerified(data.is_verified);
    } catch (error) {
      console.error('Error fetching user verification status:', error);
    }
  };


  const handleAddResource = () => {
    navigation.navigate('AddResource', { userType, userID });
  };

  const handleListingPress = (listingID) => {
    console.log('Navigating to ViewListing with listingId:', listingID);
    navigation.navigate('ViewListing', { listingID, userType, userID });
  };

  const millisecondsToTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    return `${days} days ${hours} hours ${minutes} minutes`;
  };


  const renderListingItem = ({ item }) => {

    return (
      <TouchableOpacity onPress={() => handleListingPress(item.id)}>
        <Card style={styles.listingCard}>
        <View style={styles.imageContainer}>
          <Image
            source={item.picture_url ? { uri: item.picture_url } : { uri: 'https://img.freepik.com/free-vector/tiny-people-standing-near-box-donation-food-delivery-volunteers-giving-healthy-grocery-goods-charity-flat-vector-illustration-social-support-humanitarian-help-community-sharing-concept_74855-21023.jpg?w=1480&t=st=1716743663~exp=1716744263~hmac=f3356aebddc448ada5749318914aad2b1d5d4f5d1da549bbef3e4ff9155976ff' }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
          <Card.Content style={styles.textContainer}>
            <Text style={styles.organizationName}>{item.organization_name}</Text>
            
            <View style={styles.row}>
              <FontAwesome6 name="location-dot" size={15} color="gray" />
              <Text style={styles.text}>{item.location_name}</Text>
            </View>
            
            <View style={styles.row}>
              <Octicons name="stack" size={15} color="gray" />
              <Text style={styles.text}>{item.quantity} slots</Text>
            </View>
            
            <View style={styles.row}>
              <FontAwesome5 name="calendar" size={15} color="gray" />
              <Text style={styles.text}>{item.date_time}</Text>
            </View>
  
            {userType === 'public_user' && (              
              <Text>{millisecondsToTime(item.countdown)} left to request!</Text>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {(userType === 'organization' || userType === 'admin') && (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={filter === 'all' ? styles.filterButtonActive : styles.filterButton}
            onPress={() => setFilter('all')}
          >
            <Text style={filter === 'all' ? styles.filterTextActive : styles.filterText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={filter === 'active' ? styles.filterButtonActive : styles.filterButton}
            onPress={() => setFilter('active')}
          >
            <Text style={filter === 'active' ? styles.filterTextActive : styles.filterText}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={filter === 'completed' ? styles.filterButtonActive : styles.filterButton}
            onPress={() => setFilter('completed')}
          >
            <Text style={filter === 'completed' ? styles.filterTextActive : styles.filterText}>Closed</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={listings}
        renderItem={renderListingItem}
        keyExtractor={(item) => item.id.toString()}
      />
      {userType === 'organization' && isVerified && (
        <FAB
          style={styles.fab}
          icon="plus"
          color="white"
          onPress={handleAddResource}
        />
      )}
    </View>
  );
};




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'left',
    marginBottom: 2,
    marginTop: 10,
    marginLeft: 15,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 0.5,
    borderColor: 'gray'
  },
  filterButtonActive: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    backgroundColor: 'red',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  filterText: {
    color: '#000',
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#cc0000',
  },
  listingCard: {
    margin: 10,
    marginBottom: 5,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 10,
    elevation: 10,
    backgroundColor: 'white',
  },
  organizationName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 0,
    color: '#000'
  },
  imageContainer: {
    height: 150,
    overflow: 'hidden',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 0,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  textContainer: {
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 0,
  },
  text: {
    marginLeft: 5,
  },
});

export default ResourceScreen;

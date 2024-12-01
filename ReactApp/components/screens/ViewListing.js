import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import { Divider } from 'react-native-paper';

const ViewListing = ({ route, navigation }) => {
  const { listingID, userType, userID } = route.params;
  const [listing, setListing] = useState(null);
  const [status, setStatus] = useState(null);
  const [isVerified, setIsVerified] = useState(false);


  useEffect(() => {
    console.log('userType:', userType); // Debug log
    console.log('userId:', userID); // Debug log
    fetchListingDetails(listingID);
    if (userType === 'public_user') {
      viewStatus(listingID, userID);
      checkUserVerification(userID);

    }

    // Polling mechanism
    const intervalId = setInterval(() => {
      fetchListingDetails(listingID);
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [listingID, userID]);

  const fetchListingDetails = async (id) => {
    try {
      const response = await fetch(`http://192.168.1.105:5000/listings/${id}`);
      const data = await response.json();
      console.log('Fetched listing details:', data); // Debug log
      setListing(data);
    } catch (error) {
      console.error('Error fetching listing details:', error);
    }
  };

  const viewStatus = async (listingID, userID) => {
    try {
      const response = await fetch(`http://192.168.1.105:5000/request/status/${listingID}/${userID}`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
      } else {
        setStatus(null);
      }
    } catch (error) {
      console.error('Error fetching request status:', error);
      setStatus(null);
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

  const handleRequest = async () => {
    try {
      const response = await fetch(`http://192.168.1.105:5000/request/${listingID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userID }),
      });

      const responseText = await response.text(); // Get the raw response text

      try {
        const responseData = JSON.parse(responseText); // Try to parse it as JSON

        if (response.ok) {
          Alert.alert('Request submitted successfully!');
          setStatus('Pending'); // Update status immediately after request
        } else {
          Alert.alert(responseData.message || 'Error submitting request. Please try again later.');
        }
      } catch (error) {
        // If parsing fails, it's likely an HTML error page
        console.error('Response is not valid JSON:', responseText);
        Alert.alert('Error submitting request. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert('Error submitting request. Please try again later.');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return styles.pendingStatus;
      case 'Accepted':
        return styles.acceptedStatus;
      case 'Rejected':
        return styles.rejectedStatus;
      default:
        return styles.pendingStatus;
    }
  };

  if (!listing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#cc0000" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
<View style={styles.container}>
  <View style={styles.imageWrapper}>
    <ImageBackground
      source={listing.picture_url ? { uri: listing.picture_url } : { uri: 'https://img.freepik.com/free-vector/humanitarian-help-people-donating-sanitary-protection-equipment-concept-illustration_114360-1756.jpg?size=626&ext=jpg&ga=GA1.1.1700460183.1708214400&semt=ais' }}
      style={styles.imageBackground}
      resizeMode="cover"
    >
      <View style={styles.overlay}></View>
      <Text style={styles.title}>{listing.organization_name}</Text>
    </ImageBackground>
  </View>
  <View style={styles.detailsContainer}>
    <View style={styles.detailRow}>
      <Text style={styles.label}>Quantity</Text>
      <Text style={styles.value}>{listing.quantity}</Text>
    </View>
    <Divider style={styles.divider} />
    <View style={styles.detailRow}>
      <Text style={styles.label}>Distribution Date</Text>
      <Text style={styles.value}>{listing.date_time}</Text>
    </View>
    <Divider style={styles.divider} />
    <View style={styles.detailRow}>
      <Text style={styles.label}>Location</Text>
      <Text style={styles.value}>{listing.location_name}</Text>
    </View>
    <Divider style={styles.divider} />
    <View style={styles.detailRow}>
      <Text style={styles.label}>Items</Text>
      {userType === 'public_user' && (
      <Text style={styles.notice}>(info) for each listing, an accepted user will 
      receive a standardized set consisting of these items.</Text>
      )}
      <Text style={styles.value}>{listing.resource_type}</Text>
    </View>
    <Divider style={styles.divider} />
    {userType === 'public_user' && status && (
  <View style={styles.statusContainer}>
    <Text style={styles.label}>Status</Text>
    <View style={[styles.statusButton, getStatusStyle(status)]}>
      <Text style={styles.statusText}>{status}</Text>
    </View>
      </View>
    )}
  </View>
  {userType === 'public_user' && listing.status === 'active' && (
        <View style={styles.buttonContainer}>
          {isVerified ? (
            <TouchableOpacity style={styles.requestButton} onPress={handleRequest}>
              <Text style={styles.buttonText}>Request</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.unverified}>You must be verified to request this listing.</Text>
          )}
        </View>
      )}
      {userType === 'organization' && listing && userID === listing.organization_id && (
        <>
          {listing.status === 'closed' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#cc0000" />
              <Text>Algorithm is running.</Text>
              <Text>This may take a while.</Text>
            </View>
          )}
          {listing.status === 'completed' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.requestButton}
                onPress={() => navigation.navigate('AcceptedUsers', { listingID })}
              >
                <Text style={styles.buttonText}>View Accepted Users</Text>
              </TouchableOpacity>
            </View>
          )}
    </>
  )}
</View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  imageBackground: {
    height: 300,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    padding: 16,
    textShadowColor: 'black',
    textShadowOffset: { width: -2, height: 2},
    textShadowRadius: 2,
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  detailRow: {
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  notice: {
    fontSize: 12.5,
    color: '#333',
  },
  unverified: {
    fontSize: 15,
    color: '#333',
  },
  divider: {
    marginVertical: 10,
    height: 0.8,
  },
  buttonContainer: {
    padding: 16,
    paddingVertical: 10,
  },
  requestButton: {
    backgroundColor: '#cc0000',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    alignItems: 'flex-start',
    marginTop: 5, 
  },
  statusButton: {
    borderRadius: 15, 
    paddingVertical: 5, 
    paddingHorizontal: 20, 
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 2
  },
  statusText: {
    color: 'white',
    fontSize: 16, 
    fontWeight: 'bold',
  },
  pendingStatus: {
    backgroundColor: 'gray',
  },
  acceptedStatus: {
    backgroundColor: 'green',
  },
  rejectedStatus: {
    backgroundColor: 'red',
  },
});

export default ViewListing;

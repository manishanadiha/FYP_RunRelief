import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';

const AcceptedUsers = ({ route }) => {
  const { listingID } = route.params;
  const [acceptedUsers, setAcceptedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcceptedUsers();
  }, []);

  const fetchAcceptedUsers = async () => {
    try {
      const response = await fetch(`http://192.168.1.105:5000/listings/${listingID}/accepted`);
      const data = await response.json();
      setAcceptedUsers(data.accepted_users);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accepted users:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#cc0000" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accepted Users</Text>
      {acceptedUsers.length === 0 ? (
        <Text style = {styles.noUser}>No users have been accepted for this listing.</Text>
      ) : (
        <FlatList
          data={acceptedUsers}
          renderItem={({ item }) => (
            <View style={styles.userContainer}>
              <Text style={styles.label}>Name</Text>
              <Text>{item.name}</Text>
              <Text style={styles.label}>Address</Text>
              <Text>{item.address ? `${item.address}, ${item.location}` : item.location}</Text>
              <Text style={styles.label}>Telephone</Text>
              <Text>{item.telephone}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexGrow: 1,
    backgroundColor: 'white',
    justifyContent: 'top',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 80
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noUser: {
    fontSize: 18,
    marginBottom: 10,
  },
  userContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 1,
  },
});

export default AcceptedUsers;

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native';
import { Card, FAB } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FontAwesome6 } from '@expo/vector-icons';

const MyPostScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userType, userID } = route.params || { userType: '', userID: '' };
  const [data, setData] = useState([]);
  const [isVerified, setIsVerified] = useState(false);


  useFocusEffect(
    useCallback(() => {
      if (userID) {
        fetchUserArticles(userID);
      }
      checkUserVerification(userID);

    }, [userID])
  );

  const fetchUserArticles = async (userID) => {
    try {
      const response = await fetch(`http://192.168.1.105:5000/articles/user/${userID}`);
      const articles = await response.json();
      setData(articles);
    } catch (error) {
      console.error('Error fetching user articles:', error);
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

  const handlePostPress = (postID) => {
    console.log('Navigating to ViewPost with postId:', postID);
    navigation.navigate('ViewPost', { postID, userType, userID });
  };

  const renderData = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handlePostPress(item.id)}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.title}>{item.title}</Text>
          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.description}>
            {item.body}
          </Text>
          {item.picture_url && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.picture_url }} style={styles.image} />
            </View>
          )}
            <View style={styles.datetimeContainer}>
              <FontAwesome6 name="clock" size={15} color="gray" style={styles.icon} />
              <Text style={styles.datetime}>{item.date}</Text>
            </View>
        </Card.Content>
      </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderData}
        keyExtractor={(item) => `${item.id}`}
      />
      {isVerified && (
      <FAB
        style={styles.fab}
        icon="plus"
        color="white"
        onPress={() => navigation.navigate('CreatePost', { userType, userID }) }
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D2A32',
  },
  card: {
    margin: 10,
    marginBottom: 5,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 10,
    elevation: 4,
    backgroundColor: 'white',
  },
  cardContent: {
    flexDirection: 'column',
  },
  datetimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  icon: {
    marginRight: 5,
  },
  datetime: {
    fontSize: 14,
    color: '#5b5b5b',
  },
  imageContainer: {
    height: 150,
    overflow: 'hidden',
    borderRadius: 5,
    marginTop: 10,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderWidth: 0.4,
    borderColor: 'gray'
  },
  description: {
    fontSize: 16,
    color: '#1D2A32',
  },
  fab: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#cc0000',
  },
});

export default MyPostScreen;

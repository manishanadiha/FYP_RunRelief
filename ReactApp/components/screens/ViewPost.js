import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const ViewPostScreen = ({ route, navigation }) => {
  const { postID, userType, userID } = route.params;
  const [post, setPost] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchPostDetails(postID);
    }, [postID])
  );

  const fetchPostDetails = async (id) => {
    try {
      const response = await fetch(`http://192.168.1.105:5000/articles/${id}`);
      const postData = await response.json();
      setPost(postData);
    } catch (error) {
      console.error('Error fetching post details:', error);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditPost', { userType, userID, postID });
  };

  const confirmDelete = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: handleDelete },
      ],
      { cancelable: false }
    );
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://192.168.1.105:5000/deletearticles/${postID}?confirm=yes`, {
        method: 'DELETE',
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#cc0000" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {userID === post.user_id && (
          <TouchableOpacity onPress={handleEdit}>
            <FontAwesome name="edit" size={24} color="gray" style={styles.icon} />
          </TouchableOpacity>
        )}
        {(userID === post.user_id || userType === 'admin') && (
          <TouchableOpacity onPress={confirmDelete}>
            <FontAwesome name="trash" size={24} color="gray" style={styles.icon} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>{post.title}</Text>
      {post.picture_url && (
        <Image
          source={{ uri: post.picture_url }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
      <Text style={styles.description}>{post.body}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 20,
    marginTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  icon: {
    marginLeft: 15,
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    marginBottom: 20,
    borderRadius: 10,
  },
  description: {
    fontSize: 18,
    lineHeight: 26,
    color: '#666',
    paddingBottom: 80,
  },
});

export default ViewPostScreen;

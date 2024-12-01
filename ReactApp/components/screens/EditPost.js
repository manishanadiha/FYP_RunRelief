import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const EditPost = ({ route, navigation }) => {
  const { postID, userID } = route.params;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPostDetails(postID);
    }, [postID])
  );

  const fetchPostDetails = async (id) => {
    try {
      const response = await fetch(`http://192.168.1.105:5000/articles/${id}`);
      const postData = await response.json();
      setTitle(postData.title);
      setBody(postData.body);
      if (postData.picture_url) {
        const imageUrl = postData.picture_url;
        console.log('Fetched Image URL:', imageUrl); // Debug print
        setImage(imageUrl);
        setOriginalImage(imageUrl);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching post details:', error);
    }
  };

  const handlePost = () => {
    navigation.goBack();
  };

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

  const updateData = () => {
    const formData = new FormData();
    formData.append('user_id', userID);
    formData.append('title', title);
    formData.append('body', body);

    if (image && image !== originalImage) {
      let filename = image.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;

      formData.append('picture', {
        uri: image,
        name: filename,
        type: type
      });
    }

    fetch(`http://192.168.1.105:5000/updatearticles/${postID}/`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    })
    .then(response => {
      if (response.ok) {
        console.log('Post updated successfully!');
        handlePost();
      } else {
        console.log('Error updating post:', response.statusText);
      }
    })
    .catch(error => {
      console.error('Error updating post:', error);
    });
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
      <Text style={styles.title}>Edit Post</Text>
      <View style={styles.form}>
        <TextInput
          value={title}
          onChangeText={text => setTitle(text)}
          style={styles.input}
        />

        <TextInput
          value={body}
          onChangeText={text => setBody(text)}
          style={styles.inputBody}
          multiline
          numberOfLines={10}
        />
      </View>

      <Button onPress={pickImage} style={styles.ImageButton}>
        <Feather name="upload" size={20} color="black" style={styles.icon} />
        <Text style={styles.imageButtonText}>{image ? ' Replace image' : ' Upload an image'}</Text>
      </Button>
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 200, height: 200 }}
          onError={(error) => console.error('Error loading image:', error)} // Debug print
        />
      )}

      <TouchableOpacity style={styles.button} onPress={updateData}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'top',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff'
  },
  inputBody: {
    backgroundColor: '#fff',
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  imageButtonText: {
    fontSize: 15,
    color: '#000',
    fontWeight: 'normal',
  },
  ImageButton: {
    backgroundColor: '#fff',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
});

export default EditPost;

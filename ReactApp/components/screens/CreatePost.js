import React, { useState } from 'react';
import {  Text, View, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import {  TextInput, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';



const CreatePost = ({ route, navigation }) => {
  const { userType, userID } = route.params;  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  

  const handlePost = () => {
    navigation.goBack();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    console.log(result)


    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }

    console.log(result.assets[0].uri)

  };



  const insertData = () => {

      // Validate form fields
      if (!title || !body ) {
        Alert.alert('Please fill in necesarry fields.');
        return;
      }


    const formData = new FormData();
    formData.append('user_id', userID);
    formData.append('title', title);
    formData.append('body', body);

    if (image) {
      let filename = image.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;

      formData.append('picture', {
        uri: image,
        name: filename,
        type: type
      });
    }

    

    console.log('Data to be sent:', formData); // Add this line for debugging


    fetch('http://192.168.1.105:5000/createarticles', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    })
    .then(response => {
      if (response.ok) {
        console.log('Article created successfully!');
        handlePost();
      } else {
        console.log('Error creating article:', response.statusText);
      }
    })
    .catch(error => {
      console.error('Error creating article:', error);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Create a post
      </Text>   

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={text => setTitle(text)}
        style={styles.input}
      />

      <TextInput
        placeholder="Description"
        value={body}
        onChangeText={text => setBody(text)}
        style={styles.inputBody}
        multiline
        numberOfLines={10}
      />
      
      <Button onPress={pickImage} style={styles.ImageButton}>
  <Feather name="upload" size={20} color="black" style={styles.icon} />
  <Text style={styles.imageButtonText}>  Upload an image</Text>
</Button>
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}

      <TouchableOpacity style={styles.button} onPress={insertData}>
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
    marginBottom: 20,
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
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: '#000',
    marginBottom: 10
  },
  submitButton: {
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: '#cc0000',
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
});

export default CreatePost;

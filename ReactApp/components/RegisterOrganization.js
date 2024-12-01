import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function OrganizationRegister({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [telephoneNumber, setTelephoneNumber] = useState('');

  const handleRegister = async () => {
    try {
      const response = await fetch('http://192.168.1.105:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'organization',
          name,
          email,
          password,
          address,
          telephone_number: telephoneNumber,
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

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Register as organization</Text>
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
          placeholder="Address"
          value={address}
          multiline={true}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Telephone Number"
          value={telephoneNumber}
          onChangeText={setTelephoneNumber}
        />
        <TouchableOpacity onPress={handleRegister} style={styles.btn}>
          <Text style={styles.btnText}>Register</Text>
        </TouchableOpacity>
      </View>
      
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    justifyContent: 'top',
    paddingHorizontal: 24,
    paddingVertical: 80,
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
  btn: {
    backgroundColor: '#cc0000',
    borderRadius: 30,
    paddingVertical: 10,
    alignItems: 'center',
    marginVertical: 10
  },
  btnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

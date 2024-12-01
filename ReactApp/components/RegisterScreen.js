import React from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';

export default function RegisterScreen({ navigation }) {
  const handlePublicUserRegister = () => {
    navigation.navigate('RegisterPublicUser');
  };

  const handleOrganizationRegister = () => {
    navigation.navigate('RegisterOrganization');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePublicUserRegister} style={styles.button}>
        <Text style={styles.buttonText}>Register as Public User</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleOrganizationRegister} style={styles.button}>
        <Text style={styles.buttonText}>Register as Organization</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 31,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});

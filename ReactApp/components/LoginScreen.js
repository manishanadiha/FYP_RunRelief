import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleLogin = async () => {
    const { email, password } = form;
    try {
      const response = await fetch('http://192.168.1.105:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const userData = await response.json();
      console.log('userData:', userData); // Add this line for debugging

      await AsyncStorage.setItem('access_token', userData.access_token);
      await AsyncStorage.setItem('user_id', userData.user_id.toString());
      await AsyncStorage.setItem('user_type', userData.user_type);

      Alert.alert('Success', userData.message);

      navigation.reset({
        index: 0,
        routes: [{ name: 'BottomNavigator', params: { userType: userData.user_type, userID: userData.user_id } }],
      });

    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollViewContent}
          enableOnAndroid={true}
          extraScrollHeight={Platform.OS === 'ios' ? 0 : 100}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Image
                alt="App Logo"
                resizeMode="contain"
                style={styles.headerImg}
                source={{
                  uri: 'https://i.pinimg.com/originals/9b/e4/9f/9be49fde1f9fdd2eade474f69701912b.png',
                }}
              />
              <Text style={styles.title}>
                Welcome to RUN RELIEF
              </Text>
              <Text style={styles.subtitle}>
                Sign in to your account
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.input}>
                <Text style={styles.inputLabel}>Email address</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onChangeText={email => setForm({ ...form, email })}
                  placeholder="abc@example.com"
                  placeholderTextColor="#6b7280"
                  style={styles.inputControl}
                  value={form.email}
                />
              </View>

              <View style={styles.input}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  autoCorrect={false}
                  onChangeText={password => setForm({ ...form, password })}
                  placeholder="********"
                  placeholderTextColor="#6b7280"
                  style={styles.inputControl}
                  secureTextEntry={true}
                  value={form.password}
                />
              </View>

              <TouchableOpacity onPress={handleLogin}>
                <View style={styles.btn}>
                  <Text style={styles.btnText}>Sign in</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>

        <View style={styles.dontHaveAccount}>
          <Text style={styles.formHaveAccount}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.formFooter}>
              <Text style={{ textDecorationLine: 'underline' }}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    paddingVertical: 50,
    paddingHorizontal: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  title: {
    fontSize: 31,
    fontWeight: '700',
    color: '#1D2A32',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#929292',
  },
  /** Header */
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 36,
  },
  headerImg: {
    width: 300,
    height: 150,
    alignSelf: 'center',
    marginBottom: 36,
  },
  /** Form */
  form: {
    marginBottom: 24,
    paddingHorizontal: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  formLink: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
    textAlign: 'center',
    marginTop: 16,
  },

  dontHaveAccount: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },

  formFooter: {
    fontSize: 15,
    fontWeight: '600',
    color: '#cc0000',
    textAlign: 'center',
    letterSpacing: 0.15,
  },
  formHaveAccount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    letterSpacing: 0.15,
  },

  /** Input */
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  inputControl: {
    height: 60,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 20,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#C9D3DB',
    borderStyle: 'solid',
  },
  /** Button */
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#cc0000',
    borderColor: '#cc0000',
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { AntDesign } from '@expo/vector-icons';




const UnverifiedUsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);


  useEffect(() => {
    // Fetch unverified users from the backend
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://192.168.1.105:5000/unverified/org');
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleViewDocuments = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalVisible(false);
  };

  const renderDocumentModal = () => {
    if (!selectedUser) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Documents for {selectedUser.name}</Text>
            <Image
              source={{ uri: `http://192.168.1.105:5000/uploads/${selectedUser.document}` }}
              style={styles.documentImage}
            />
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const handleVerify = async (userId) => {
    try {
      const response = await fetch(`http://192.168.1.105:5000/verify/org/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_verified: true }),
      });

      if (response.ok) {
        setUsers(users.map(user => user.id === userId ? { ...user, is_verified: true } : user));
      } else {
        const errorData = await response.json();
        console.error('Error verifying user:', errorData.error);
      }
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  // Define the UnverifiedUser component         <CheckBox
          //value={user.is_verified}
          //onValueChange={() => onVerify(user.id)}
        // />
        const UnverifiedUser = ({ user, onVerify }) => {
            return (
              <View style={styles.userContainer}>
                <View style={styles.userDetails}>
                  <Text style={styles.userText}>Name: {user.name}</Text>
                  <Text style={styles.userText}>Email: {user.email}</Text>
                  <Text style={styles.userText}>Address: {user.address}</Text>
                  <Text style={styles.userText}>Telephone: {user.telephone_number}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleViewDocuments(user)}>
                <AntDesign name="filetext1" size={24} color="gray" style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.userContainer}
                    onPress={() => onVerify(user.id)} // Changed to onPress instead of onValueChange
                    >
                {user.is_verified ? (
                    <AntDesign name="checkcircle" size={24} color="green" style={styles.icon} />
                ) : (
                    <AntDesign name="checkcircle" size={24} color="gray" style={styles.icon} />
                )}
                </TouchableOpacity>
              </View>
    );
  };

  return (
    <View style={styles.container}>
    {renderDocumentModal()}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <UnverifiedUser user={item} onVerify={handleVerify} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 80,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  userDetails: {
    flex: 1,
  },
  userText: {
    fontSize: 16,
    color: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    width: 12,
    height: 12,
    backgroundColor: '#cc0000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalHeader: {
    fontSize: 20,
    marginBottom: 10,
  },
  documentImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default UnverifiedUsersScreen;

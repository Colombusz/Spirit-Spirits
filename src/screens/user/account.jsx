// Account.jsx
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  ActivityIndicator, 
  TouchableOpacity, 
  Text, 
  Modal,
  Alert
} from 'react-native';
import { Card, Title, Paragraph, Avatar, Button, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchCurrentUser, updateProfile } from '../../redux/actions/userAction';
import { logoutUser } from '../../redux/actions/authAction';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';
import Toasthelper from '../../components/common/toasthelper';
import { colors } from '../../components/common/theme';
import * as ImagePicker from "expo-image-picker";

const Account = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const db = useAsyncSQLiteContext();
  const { currentUser, loading, error } = useSelector(state => state.user);

  // Local state for edit mode and profile fields
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    userId: '',
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    address: { street: '', city: '', postalCode: '', country: '' },
    phone: '',
    image: {} // will store image info (uri)
  });
  // State for photo integration using ImagePicker
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      setEditedUser({
        _id: currentUser._id,
        firstname: currentUser.firstname || '',
        lastname: currentUser.lastname || '',
        username: currentUser.username || '',
        email: currentUser.email || '',
        address: currentUser.address || { street: '', city: '', postalCode: '', country: '' },
        phone: currentUser.phone || '',
        image: currentUser.image || {}
      });
    }
  }, [currentUser]);

  const handleLogout = () => {
    dispatch(logoutUser(db))
      .unwrap()
      .then(() => {
        Toasthelper.showSuccess('Logout Successful');
        navigation.navigate('Login');
      })
      .catch((error) => {
        Toasthelper.showError('Logout Failed', error.message);
      });
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (currentUser) {
      setEditedUser({
        _id: currentUser._id,
        firstname: currentUser.firstname || '',
        lastname: currentUser.lastname || '',
        username: currentUser.username || '',
        email: currentUser.email || '',
        address: currentUser.address || { street: '', city: '', postalCode: '', country: '' },
        phone: currentUser.phone || '',
        image: currentUser.image || {}
      });
    }
    setIsEditing(false);
    setModalVisible(false);
  };

  const handleSaveProfile = () => {
    dispatch(updateProfile({ db, user: editedUser }))
      .unwrap()
      .then((updatedUser) => {
        Toasthelper.showSuccess('Profile updated successfully');
        setIsEditing(false);
      })
      .catch((error) => {
        Toasthelper.showError('Profile update failed', error.message);
      });
  };

  // Use ImagePicker to launch the gallery
  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "You need to allow access to your gallery.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setCapturedPhoto(uri);
      setEditedUser(prev => ({ ...prev, image: { url: uri } }));
      setModalVisible(false);
    }
  };

  // Use ImagePicker to launch the camera
  const takePhotoWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "You need to allow access to your camera.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setCapturedPhoto(uri);
      setEditedUser(prev => ({ ...prev, image: { url: uri } }));
      setModalVisible(false);
    }
  };

  const renderAddress = () => {
    const { address } = currentUser;
    if (address && typeof address === 'object' && Object.keys(address).length > 0) {
      return (
        <>
          <Title>Address</Title>
          <Paragraph>{address.street || 'N/A'}</Paragraph>
          <Paragraph>{address.city || 'N/A'}</Paragraph>
          <Paragraph>{address.postalCode || 'N/A'}</Paragraph>
          <Paragraph>{address.country || 'N/A'}</Paragraph>
        </>
      );
    }
    return <Paragraph>No address available.</Paragraph>;
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Paragraph style={styles.errorText}>Error: {error}</Paragraph>
        <Button mode="contained" onPress={() => dispatch(fetchCurrentUser())}>
          Retry
        </Button>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Paragraph>No user data available.</Paragraph>
      </View>
    );
  }

  const { firstname, lastname, username, email, address, image } = currentUser;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title={`${firstname} ${lastname}`}
          subtitle={`@${username}`}
          left={(props) => (
            <>
              {isEditing ? (
                <Avatar.Image
                  {...props}
                  source={{
                    uri: capturedPhoto || image?.url || 'https://via.placeholder.com/150',
                  }}
                />
              ) : (
                <Avatar.Image
                  {...props}
                  source={{
                    uri: image?.url || 'https://via.placeholder.com/150',
                  }}
                />
              )}
            </>
          )}
        />
        <Card.Content>
          {isEditing ? (
            <>
              <Button
                onPress={() => setModalVisible(true)}
                mode="outlined"
                style={styles.updatePhotoButton}
              >
                Update Photo
              </Button>
              <TextInput
                label="First Name"
                value={editedUser.firstname}
                onChangeText={(text) => setEditedUser({ ...editedUser, firstname: text })}
                style={styles.input}
              />
              <TextInput
                label="Last Name"
                value={editedUser.lastname}
                onChangeText={(text) => setEditedUser({ ...editedUser, lastname: text })}
                style={styles.input}
              />
              <TextInput
                label="Username"
                value={editedUser.username}
                onChangeText={(text) => setEditedUser({ ...editedUser, username: text })}
                style={styles.input}
              />
              <TextInput
                label="Email"
                value={editedUser.email}
                onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
                style={styles.input}
              />
              <TextInput
                label="Street Address"
                value={editedUser.address.street}
                onChangeText={(text) =>
                  setEditedUser({ 
                    ...editedUser, 
                    address: { ...editedUser.address, street: text } 
                  })
                }
                style={styles.input}
              />
              <TextInput
                label="City"
                value={editedUser.address.city}
                onChangeText={(text) =>
                  setEditedUser({ 
                    ...editedUser, 
                    address: { ...editedUser.address, city: text } 
                  })
                }
                style={styles.input}
              />
              <TextInput
                label="Postal Code"
                value={editedUser.address.postalCode}
                onChangeText={(text) =>
                  setEditedUser({ 
                    ...editedUser, 
                    address: { ...editedUser.address, postalCode: text } 
                  })
                }
                style={styles.input}
              />
              <TextInput
                label="Country"
                value={editedUser.address.country}
                onChangeText={(text) =>
                  setEditedUser({ 
                    ...editedUser, 
                    address: { ...editedUser.address, country: text } 
                  })
                }
                style={styles.input}
              />
              <TextInput
                label="Phone"
                value={editedUser.phone}
                onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
                style={styles.input}
              />
            </>
          ) : (
            <>
              <Title>Email</Title>
              <Paragraph>{email}</Paragraph>
              {renderAddress()}
              <Title>Phone</Title>
              <Paragraph>{currentUser.phone || 'N/A'}</Paragraph>
            </>
          )}
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          {isEditing ? (
            <View style={styles.editButtonsContainer}>
              <Button
                mode="contained"
                onPress={handleSaveProfile}
                style={[styles.button, styles.saveButton]}
                labelStyle={styles.buttonLabel}
              >
                Save Profile
              </Button>
              <Button
                mode="outlined"
                onPress={handleCancelEdit}
                style={[styles.button, styles.cancelButton]}
                labelStyle={styles.buttonLabel}
              >
                Cancel
              </Button>
            </View>
          ) : (
            <Button mode="contained" onPress={handleEditProfile} style={styles.bronzeButton}>
              Edit Profile
            </Button>
          )}
          <Button mode="contained" onPress={handleLogout} style={styles.bronzeButton} color="red">
            Logout
          </Button>
        </Card.Actions>
      </Card>

      {/* Modal for image picker options */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Photo</Text>
            <TouchableOpacity style={styles.modalButton} onPress={takePhotoWithCamera}>
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={pickImageFromGallery}>
              <Text style={styles.modalButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Account;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    marginVertical: 10,
  },
  cardActions: {
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  button: {
    flex: 1,
    marginRight: 10,
    marginVertical: 5,
    borderColor: colors.secondary,
  },
  saveButton: {
    backgroundColor: colors.secondary,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: colors.secondary,
  },
  bronzeButton: {
    borderWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: colors.secondary,
    marginVertical: 5,
  },
  buttonLabel: {
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  updatePhotoButton: {
    marginBottom: 10,
  },
  // Modal styles (based on your reference)
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  modalCancelButton: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  modalCancelButtonText: {
    color: colors.primary,
    textAlign: 'center',
  },
});

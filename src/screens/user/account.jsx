// Account.jsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Avatar, Button, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchCurrentUser, updateProfile } from '../../redux/actions/userAction';
import { logoutUser } from '../../redux/actions/authAction';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';
import Toasthelper from '../../components/common/toasthelper';
import { colors } from '../../components/common/theme';

const Account = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const db = useAsyncSQLiteContext();
  const { currentUser, loading, error } = useSelector(state => state.user);

  // Local state to track edit mode and input values.
  // Include a userId field so it can be sent to the backend.
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    userId: '',
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    // Assuming address is an object with street, city, postalCode, country.
    address: { street: '', city: '', postalCode: '', country: '' },
    phone: '',
  });

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // When currentUser loads, initialize editedUser state (include userId)
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
    // Reset editedUser to currentUser data and exit edit mode.
    if (currentUser) {
      setEditedUser({
        _id: currentUser._id,
        firstname: currentUser.firstname || '',
        lastname: currentUser.lastname || '',
        username: currentUser.username || '',
        email: currentUser.email || '',
        address: currentUser.address || { street: '', city: '', postalCode: '', country: '' },
        phone: currentUser.phone || '',
      });
    }
    setIsEditing(false);
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

  // Destructure for display in view mode
  const { firstname, lastname, username, email, address, image } = currentUser;

  // Handle address rendering; adjust property names as needed.
  const renderAddress = () => {
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title={`${firstname} ${lastname}`}
          subtitle={`@${username}`}
          left={(props) => (
            <Avatar.Image
              {...props}
              source={{
                uri: image?.url || 'https://via.placeholder.com/150',
              }}
            />
          )}
        />
        <Card.Content>
          {isEditing ? (
            <>
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
              {/* Address Fields */}
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
    borderColor: colors.secondary, // Bronze border color
  },
  saveButton: {
    backgroundColor: colors.secondary, // Bronze background
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.secondary, // Bronze border
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
});

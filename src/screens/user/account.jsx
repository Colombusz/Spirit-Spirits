// Account.jsx
import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Avatar, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchCurrentUser } from '../../redux/actions/userAction';
import { logoutUser } from '../../redux/actions/authAction';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';
import Toasthelper from '../../components/common/toasthelper';

const Account = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const db = useAsyncSQLiteContext();
  const { currentUser, loading, error } = useSelector(state => state.user);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

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

  // Only display essential fields
  const { firstname, lastname, username, email, address } = currentUser;
  const showAddress = address && address !== 'N/A';

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
                uri: currentUser.image?.url || 'https://via.placeholder.com/150',
              }}
            />
          )}
        />
        <Card.Content>
          <Title>Email</Title>
          <Paragraph>{email}</Paragraph>
          {showAddress && (
            <>
              <Title>Address</Title>
              <Paragraph>{address}</Paragraph>
            </>
          )}
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button mode="contained" onPress={() => console.log('Edit Profile pressed')}>
            Edit Profile
          </Button>
          <Button mode="contained" onPress={handleLogout} color="red">
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
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    marginVertical: 10,
  },
  cardActions: {
    justifyContent: 'space-between',
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

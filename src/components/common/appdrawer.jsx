// AppDrawer.jsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Avatar, Title, Caption, Paragraph, IconButton } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getUserCredentials } from '../../utils/userStorage';

const AppDrawer = ({ closeDrawer }) => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  // Refresh user data every time the drawer is focused
  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        try {
          const userData = await getUserCredentials();
          console.log('Retrieved user from AsyncStorage:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };

      fetchUser();
    }, [])
  );

  return (
    <DrawerContentScrollView>
      <View style={styles.drawerContent}>
        {/* Close Button */}
        <IconButton
          icon="close"
          onPress={closeDrawer}
          style={{ alignSelf: 'flex-end' }}
        />

        {/* USER INFO SECTION */}
        <View style={styles.userInfoSection}>
          <View style={{ flexDirection: 'row', marginTop: 15 }}>
            <Avatar.Image
              source={{
                uri: user?.image?.url || 'https://via.placeholder.com/150',
              }}
              size={70}
            />
            <View style={{ marginLeft: 15, flexDirection: 'column' }}>
              <Title style={styles.title}>{user?.firstname || 'Guest'}</Title>
              <Caption style={styles.caption}>
                @{user?.username || 'guest_user'}
              </Caption>
            </View>
          </View>

          <View style={styles.row}>
            {/* <View style={styles.section}>
              <Paragraph style={[styles.paragraph, styles.caption]}>
                80
              </Paragraph>
              <Caption style={styles.caption}>Following</Caption>
            </View>
            <View style={styles.section}>
              <Paragraph style={[styles.paragraph, styles.caption]}>
                100
              </Paragraph>
              <Caption style={styles.caption}>Followers</Caption>
            </View> */}
          </View>
        </View>

        {/* NAVIGATION ITEMS */}
        <View style={styles.drawerSection}>
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="home" color={color} size={size} />
            )}
            label="Home"
            onPress={() => {
              navigation.navigate('Home');
              closeDrawer();
            }}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            )}
            label="Account"
            onPress={() => {
              navigation.navigate('Account');
              closeDrawer();
            }}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="alert-circle-outline" color={color} size={size} />
            )}
            label="About"
            onPress={() => {
              navigation.navigate('About');
              closeDrawer();
            }}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="cart-outline" color={color} size={size} />
            )}
            label="Cart"
            onPress={() => {
              navigation.navigate('Cart');
              closeDrawer();
            }}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="cart-outline" color={color} size={size} />
            )}
            label="Orders"
            onPress={() => {
              navigation.navigate('UserOrders');
              closeDrawer();
            }}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="list-outline" color={color} size={size} />
            )}
            label="More"
            onPress={() => {
              navigation.navigate('More');
              closeDrawer();
            }}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="card-outline" color={color} size={size} />
            )}
            label="Payments"
            onPress={() => {
              navigation.navigate('Payments');
              closeDrawer();
            }}
          />
          {/* Additional items for testing */}
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="card-outline" color={color} size={size} />
            )}
            label="Login: testing"
            onPress={() => {
              navigation.navigate('Login');
              closeDrawer();
            }}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="card-outline" color={color} size={size} />
            )}
            label="Signup: testing"
            onPress={() => {
              navigation.navigate('Signup');
              closeDrawer();
            }}
          />
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

export default AppDrawer;

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
});

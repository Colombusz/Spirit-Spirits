// AppDrawer.jsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Avatar, Title, Caption, IconButton, Divider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getUserCredentials } from '../../utils/userStorage';
import defaultAvatar from '../../../assets/ghost.png';
import { colors, spacing, fonts } from './theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

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

  const renderIcon = (name, focused) => {
    return (
      <View style={styles.iconContainer}>
        <Ionicons 
          name={name} 
          color={focused ? colors.primary : colors.bronzeShade7} 
          size={24} 
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.drawerContent}>
          {/* Close Button */}
          <IconButton
            icon="close"
            color={colors.bronzeShade7}
            size={28}
            onPress={closeDrawer}
            style={styles.closeButton}
          />

          {/* USER INFO SECTION */}
          <View style={styles.userInfoSection}>
            <View style={styles.avatarContainer}>
              <Avatar.Image
                source={
                  user?.image?.url
                    ? { uri: user.image.url }
                    : defaultAvatar
                }
                size={80}
                style={styles.avatar}
              />
              <View style={styles.userTextContainer}>
                <Title style={styles.title}>{user?.firstname || 'Guest'}</Title>
                <Caption style={styles.caption}>
                  @{user?.username || 'guest_user'}
                </Caption>
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* NAVIGATION ITEMS */}
          <View style={styles.drawerSection}>
            {/* Always show Home */}
            <DrawerItem
              icon={({ focused }) => renderIcon('home', focused)}
              label="Home"
              labelStyle={styles.drawerLabel}
              activeBackgroundColor={`${colors.ivory4}CC`}
              activeTintColor={colors.primary}
              inactiveTintColor={colors.bronzeShade8}
              onPress={() => {
                navigation.navigate('Home');
                closeDrawer();
              }}
            />

            {/* Guest Users Navigation */}
            {!user && (
              <>
                <DrawerItem
                  icon={({ focused }) => renderIcon('log-in-outline', focused)}
                  label="Login"
                  labelStyle={styles.drawerLabel}
                  activeBackgroundColor={`${colors.ivory4}CC`}
                  activeTintColor={colors.primary}
                  inactiveTintColor={colors.bronzeShade8}
                  onPress={() => {
                    navigation.navigate('Login');
                    closeDrawer();
                  }}
                />
                <DrawerItem
                  icon={({ focused }) => renderIcon('person-add-outline', focused)}
                  label="Signup"
                  labelStyle={styles.drawerLabel}
                  activeBackgroundColor={`${colors.ivory4}CC`}
                  activeTintColor={colors.primary}
                  inactiveTintColor={colors.bronzeShade8}
                  onPress={() => {
                    navigation.navigate('Signup');
                    closeDrawer();
                  }}
                />
                <DrawerItem
                  icon={({ focused }) => renderIcon('alert-circle-outline', focused)}
                  label="About"
                  labelStyle={styles.drawerLabel}
                  activeBackgroundColor={`${colors.ivory4}CC`}
                  activeTintColor={colors.primary}
                  inactiveTintColor={colors.bronzeShade8}
                  onPress={() => {
                    navigation.navigate('About');
                    closeDrawer();
                  }}
                />
              </>
            )}

            {/* Logged-in Users Navigation */}
            {user && (
              <>
                <DrawerItem
                  icon={({ focused }) => renderIcon('person-outline', focused)}
                  label="Account"
                  labelStyle={styles.drawerLabel}
                  activeBackgroundColor={`${colors.ivory4}CC`}
                  activeTintColor={colors.primary}
                  inactiveTintColor={colors.bronzeShade8}
                  onPress={() => {
                    navigation.navigate('Account');
                    closeDrawer();
                  }}
                />
                <DrawerItem
                  icon={({ focused }) => renderIcon('cart-outline', focused)}
                  label="Cart"
                  labelStyle={styles.drawerLabel}
                  activeBackgroundColor={`${colors.ivory4}CC`}
                  activeTintColor={colors.primary}
                  inactiveTintColor={colors.bronzeShade8}
                  onPress={() => {
                    navigation.navigate('Cart');
                    closeDrawer();
                  }}
                />
                <DrawerItem
                  icon={({ focused }) => renderIcon('receipt-outline', focused)}
                  label="Orders"
                  labelStyle={styles.drawerLabel}
                  activeBackgroundColor={`${colors.ivory4}CC`}
                  activeTintColor={colors.primary}
                  inactiveTintColor={colors.bronzeShade8}
                  onPress={() => {
                    navigation.navigate('UserOrders');
                    closeDrawer();
                  }}
                />
                <Divider style={styles.divider} />
              </>
            )}
          </View>

          {/* APP VERSION FOOTER */}
          <View style={styles.footer}>
            <Caption style={styles.versionText}>App Version 1.0.0</Caption>
          </View>
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

export default AppDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 240, 0.85)', // Semi-transparent ivory background
  },
  scrollContent: {
    minHeight: SCREEN_HEIGHT,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 40,
  },
  closeButton: {
    alignSelf: 'flex-end',
    margin: spacing.small,
    backgroundColor: `${colors.ivory3}CC`,
  },
  userInfoSection: {
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.large,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.medium,
  },
  avatar: {
    backgroundColor: colors.ivory4,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  userTextContainer: {
    marginLeft: spacing.medium,
    flexDirection: 'column',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.bronzeShade7,
    fontFamily: fonts.medium,
  },
  caption: {
    fontSize: 14,
    color: colors.bronzeShade5,
    fontFamily: fonts.regular,
  },
  divider: {
    height: 1,
    backgroundColor: colors.bronzeShade3,
    opacity: 0.3,
    marginVertical: spacing.medium,
    marginHorizontal: spacing.medium,
  },
  drawerSection: {
    marginTop: spacing.small,
  },
  drawerLabel: {
    fontSize: 16,
    fontFamily: fonts.regular,
    fontWeight: '500',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${colors.ivory3}CC`,
  },
  footer: {
    marginTop: 'auto',
    padding: spacing.medium,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: colors.bronzeShade4,
    fontFamily: fonts.light,
  },
});
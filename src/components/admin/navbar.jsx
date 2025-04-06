// AdminAppDrawer.jsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Avatar, Title, Caption, Paragraph, IconButton, Divider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getUserCredentials } from '../../utils/userStorage';
import defaultAvatar from '../../../assets/ghost.png';
import { colors, spacing, fonts } from '../common/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const AdminAppDrawer = ({ closeDrawer }) => {
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
                <Title style={styles.title}>{user?.firstname || 'Admin'}</Title>
                <Caption style={styles.caption}>
                  @{user?.username || 'admin_user'}
                </Caption>
                <View style={styles.adminBadge}>
                  <Caption style={styles.adminText}>Administrator</Caption>
                </View>
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* NAVIGATION ITEMS */}
          <View style={styles.drawerSection}>
            <DrawerItem
              icon={({ focused }) => renderIcon('grid-outline', focused)}
              label="Dashboard"
              labelStyle={styles.drawerLabel}
              activeBackgroundColor={`${colors.ivory4}CC`}
              activeTintColor={colors.primary}
              inactiveTintColor={colors.bronzeShade8}
              onPress={() => {
                navigation.navigate('Adminhome');
                closeDrawer();
              }}
            />
            
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
              icon={({ focused }) => renderIcon('clipboard-outline', focused)}
              label="Orders"
              labelStyle={styles.drawerLabel}
              activeBackgroundColor={`${colors.ivory4}CC`}
              activeTintColor={colors.primary}
              inactiveTintColor={colors.bronzeShade8}
              onPress={() => {
                navigation.navigate('AdminOrders');
                closeDrawer();
              }}
            />
             <DrawerItem
              icon={({ focused }) => renderIcon('pricetags-outline', focused)}
              label="Promo"
              labelStyle={styles.drawerLabel}
              activeBackgroundColor={`${colors.ivory4}CC`}
              activeTintColor={colors.primary}
              inactiveTintColor={colors.bronzeShade8}
              onPress={() => {
                navigation.navigate('PromoList');
                closeDrawer();
              }}
            />
            

          </View>
          
          <Divider style={styles.divider} />

          {/* APP VERSION FOOTER */}
          <View style={styles.footer}>
            <Caption style={styles.versionText}>Admin Panel v1.0.0</Caption>
          </View>
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

export default AdminAppDrawer;

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
    marginBottom: spacing.medium,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.medium,
  },
  avatar: {
    backgroundColor: colors.ivory4,
    borderWidth: 2,
    borderColor: colors.bronzeShade5,
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
  adminBadge: {
    backgroundColor: colors.bronzeShade4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  adminText: {
    color: colors.ivory2,
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: spacing.medium,
    backgroundColor: `${colors.ivory4}99`,
    borderRadius: 12,
    padding: spacing.medium,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.bronzeShade6,
  },
  statLabel: {
    fontSize: 12,
    color: colors.bronzeShade5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.bronzeShade3,
    opacity: 0.3,
    marginVertical: spacing.medium,
    marginHorizontal: spacing.medium,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: colors.bronzeShade3,
    opacity: 0.5,
    height: '100%',
  },
  drawerSection: {
    marginTop: spacing.small,
  },
  adminSection: {
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
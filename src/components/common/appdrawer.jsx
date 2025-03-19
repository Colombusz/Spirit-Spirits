import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import {
  Avatar,
  Title,
  Caption,
  Paragraph,
  Drawer,
  IconButton,
} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AppDrawer = ({ closeDrawer, navigation }) => {
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
                uri: 'https://cdn.donmai.us/sample/72/74/__hakurei_reimu_touhou_drawn_by_torajirou_toraneko_zirou__sample-72741d7d20b43596a12d296a599e96a3.jpg',
              }}
              size={70}
            />
            <View style={{ marginLeft: 15, flexDirection: 'column' }}>
              <Title style={styles.title}>John Doe</Title>
              <Caption style={styles.caption}>@j_doe</Caption>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.section}>
              <Paragraph style={[styles.paragraph, styles.caption]}>80</Paragraph>
              <Caption style={styles.caption}>Following</Caption>
            </View>
            <View style={styles.section}>
              <Paragraph style={[styles.paragraph, styles.caption]}>100</Paragraph>
              <Caption style={styles.caption}>Followers</Caption>
            </View>
          </View>
        </View>

        {/* NAVIGATION ITEMS */}
        <Drawer.Section style={styles.drawerSection}>
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="home" color={color} size={size} />
            )}
            label="Home"
            onPress={() => { navigation.navigate('Home'); closeDrawer(); }}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            )}
            label="Profile"
            onPress={() => { navigation.navigate('Profile'); closeDrawer(); }}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="chatbubble-outline" color={color} size={size} />
            )}
            label="Messages"
            onPress={() => { navigation.navigate('Messages'); closeDrawer(); }}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="list-outline" color={color} size={size} />
            )}
            label="More"
            onPress={() => { navigation.navigate('More'); closeDrawer(); }}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="card-outline" color={color} size={size} />
            )}
            label="Payments"
            onPress={() => { navigation.navigate('Payments'); closeDrawer(); }}
          />
        </Drawer.Section>
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

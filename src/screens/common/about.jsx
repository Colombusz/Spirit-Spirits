import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '../../components/common/theme';

const About = () => {
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>About Spirit & Spirits</Text>
          <Text style={styles.paragraph}>
            Welcome to Spirit & Spirits, your premier destination for fine wines, premium liquors, and craft spirits.
            We are passionate about bringing you the best selection of beverages from around the world, carefully curated
            to suit every taste and occasion.
          </Text>
          <Text style={styles.paragraph}>
            At Spirit & Spirits, we believe that every bottle tells a story. Whether you're celebrating a special moment,
            hosting a gathering, or simply enjoying a quiet evening, we are here to help you find the perfect drink to
            elevate your experience.
          </Text>
          <Text style={styles.paragraph}>
            Our knowledgeable team is dedicated to providing exceptional service and sharing their expertise to guide you
            through our extensive collection. From rare vintages to local favorites, we take pride in offering something
            for everyone.
          </Text>
          <Text style={styles.paragraph}>
            Thank you for choosing Spirit & Spirits. Cheers to great moments and unforgettable memories!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background, // Ivory background
    padding: spacing.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '90%',       // You can adjust this to limit text width
    maxWidth: 600,      // Maximum width for larger screens
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.medium,
    textAlign: 'center',
    color: colors.primary, // Main Bronze for title
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.small,
    color: colors.text, // Dark Bronze for text
    textAlign: 'center',  // Center paragraph text
  },
});

export default About;

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Animated, 
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Text,
  FlatList,
  Image
} from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  IconButton, 
  Surface,
  Provider as PaperProvider,
  DefaultTheme
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

// Custom theme using the color palette
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#cd7f32', // Primary copper color
    accent: '#a46628',   // Darker copper for accents
    background: '#f9f4e2', // Light cream background
    surface: '#f7f0d9',  // Slightly darker cream for cards
    text: '#3e260f',     // Dark brown for text
  },
};

// Carousel component for images
const ImageCarousel = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Handle when image changes
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  return (
    <View style={carouselStyles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={carouselStyles.imageContainer}>
            <Image 
              source={{ uri: item.url }} 
              style={carouselStyles.image}
              resizeMode="cover"
            />
          </View>
        )}
      />
      
      {/* Dot indicators */}
      <View style={carouselStyles.dotsContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              carouselStyles.dot,
              { backgroundColor: index === activeIndex ? '#cd7f32' : '#f5eccf' }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const carouselStyles = StyleSheet.create({
  container: {
    height: 180,
    position: 'relative',
  },
  imageContainer: {
    width: width - 40, // Account for padding
    height: 150,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

const TopDrawer = ({ state, promotions = [], onClose }) => {
  const translateY = useRef(new Animated.Value(state ? 0 : -height)).current; // Start off-screen
  const maxHeight = height * 0.85; // Maximum height for the drawer (85% of screen height)

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: state ? 0 : -height, // Fully visible or slide out
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [state]);

  return (
    <PaperProvider theme={theme}>
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateY }], // Adjust position dynamically
            maxHeight: maxHeight,
          },
        ]}
      >
        <Surface style={styles.drawerHeader}>
          <Title style={styles.drawerTitle}>Promotions</Title>
          <IconButton
            icon="close"
            size={24}
            color={theme.colors.text}
            onPress={onClose} // Call onClose when close button is pressed
            style={styles.closeButton}
          />
        </Surface>

        {/* Ensure ScrollView takes up available space */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={true}
          bounces={false}
        >
          {promotions.map((promo) => {
            const imageArray = Array.isArray(promo.images) 
              ? promo.images 
              : [{ url: promo.images }]; // Ensure we have objects with url property
              
            return (
              <Card key={promo.id} style={styles.card}>
                <ImageCarousel images={imageArray} />
                <Card.Content>
                  <Title style={styles.cardTitle}>{promo.title}</Title>
                  <Paragraph style={styles.cardDescription}>{promo.name}</Paragraph>
                  <Text style={styles.validUntil}>Valid until: {promo.description}</Text>
                </Card.Content>
                <Card.Actions>
                  <Button style={styles.cardButton} mode="outlined">
                   {promo.discount} %
                  </Button>
                  <Button style={styles.cardButton} mode="contained">
                    {promo.category}
                  </Button>
                </Card.Actions>
              </Card>
            );
          })}
        </ScrollView>

        <Surface style={styles.drawerFooter}>
          <TouchableOpacity onPress={onClose} style={styles.pullTab}>
            <MaterialCommunityIcons name="chevron-up" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </Surface>
      </Animated.View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f4e2', // Light cream background
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  openButton: {
    backgroundColor: '#cd7f32', // Primary copper color
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f7f0d9', // Slightly darker cream for drawer
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    flex: 1, // Allow the drawer to expand fully
    flexDirection: 'column',
    overflow: 'hidden', // Prevent content from spilling out
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#cd7f32', // Primary copper color
    borderBottomWidth: 1,
    borderBottomColor: '#b9722d', // Slightly darker copper
  },
  drawerTitle: {
    color: '#f6eed4', // Light cream for text on copper
    marginLeft: 10,
    fontWeight: 'bold',
  },
  closeButton: {
    margin: 0,
  },
  scrollView: {
    flex: 1, // Takes up all available space between header and footer
  },
  scrollViewContent: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  card: {
    marginBottom: 15,
    backgroundColor: '#f6eed4', // Cream color for cards
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f5eccf',
    padding: 10,
  },
  cardTitle: {
    color: '#674019', // Dark brown for titles
    fontWeight: 'bold',
    marginTop: 5,
  },
  cardDescription: {
    color: '#7b4c1e', // Medium brown for descriptions
    marginBottom: 8,
  },
  validUntil: {
    color: '#a46628', // Darker copper for validity text
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  cardButton: {
    marginHorizontal: 5,
  },
  drawerFooter: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#cd7f32', // Primary copper color
  },
  pullTab: {
    width: 50,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TopDrawer;
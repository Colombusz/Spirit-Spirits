import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { Card, Text, Title, useTheme, Menu, IconButton, Provider } from 'react-native-paper';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.8;
const ITEM_HEIGHT = 160;
const SPACING = 10;

// Create animated FlatList component
const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);

const CardItem = ({ liqour }) => {
  const theme = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Handle image carousel scroll events
  const handleOnScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / ITEM_WIDTH);
    setActiveIndex(index);
  };

  // Toggle dropdown menu
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  // Handle button actions
  const handleButtonOne = () => {
    // Add your button one action here
    console.log('Button One Pressed');
    closeMenu();
  };

  const handleButtonTwo = () => {
    // Add your button two action here
    console.log('Button Two Pressed');
    closeMenu();
  };

  // Render image in carousel
  const renderImage = ({ item, index }) => {
    const inputRange = [
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
      (index + 1) * ITEM_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={{
          width: ITEM_WIDTH,
          height: ITEM_HEIGHT,
          transform: [{ scale }],
          opacity,
        }}
      >
        <Card.Cover
          source={{ uri: item.url }}
          style={styles.productImage}
        />
      </Animated.View>
    );
  };

  // Render pagination dots
  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {liqour.images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              { backgroundColor: index === activeIndex ? theme.colors.primary : theme.colors.backdrop }
            ]}
          />
        ))}
      </View>
    );
  };

return (
    <Provider>
        <Card style={styles.cardItem}>
            <Card.Content>
                <View style={styles.headerContainer}>
                    <Title>{liqour.brand}</Title>
                    
                    <View style={styles.buttonGroup}> 
                        <IconButton
                            icon="pencil-outline"
                            onPress={() => console.log('Edit pressed')}
                            size={24}
                        />
                        <IconButton
                            icon="trash-can-outline"
                            onPress={() => console.log('Edit pressed')}
                            size={24}
                        />
                    </View>
                </View>
                
                <View style={styles.carouselContainer}>
                    <AnimatedFlatList
                        data={liqour.images}
                        keyExtractor={(_, index) => `image-${index}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={ITEM_WIDTH}
                        decelerationRate="fast"
                        pagingEnabled
                        bounces={false}
                        contentContainerStyle={styles.carouselContent}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: true, listener: handleOnScroll }
                        )}
                        renderItem={renderImage}
                    />
                    {renderPaginationDots()}
                </View>
                
                <View style={styles.textContainer}>
                    {liqour.description && (
                        <Text style={styles.descriptionText} numberOfLines={2}>
                            {liqour.description}
                        </Text>
                    )}
                    {liqour.price && (
                        <Text style={styles.priceText}>${liqour.price}</Text>
                    )}
                </View>
            </Card.Content>
        </Card>
    </Provider>
);
};

const styles = StyleSheet.create({
  cardItem: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -8, // Remove extra right padding
  },
  menuContent: {
    marginTop: 32, // Adjust this value to position the menu
    width: 150,
  },
  carouselContainer: {
    height: ITEM_HEIGHT + 20,
    position: 'relative',
  },
  carouselContent: {
    paddingHorizontal: SPACING / 2,
  },
  productImage: {
    flex: 1,
    borderRadius: 8,
    margin: SPACING / 2,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  textContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  descriptionText: {
    marginTop: 4,
    opacity: 0.7,
  },
  priceText: {
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CardItem;
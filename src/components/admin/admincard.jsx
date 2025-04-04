import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { Card, Text, Title, useTheme } from 'react-native-paper';

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
  
  // Handle image carousel scroll events
  const handleOnScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / ITEM_WIDTH);
    setActiveIndex(index);
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
    <Card style={styles.cardItem}>
      <Card.Content>
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
          <Title>{liqour.brand}</Title>
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
  );
};

const styles = StyleSheet.create({
  cardItem: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
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
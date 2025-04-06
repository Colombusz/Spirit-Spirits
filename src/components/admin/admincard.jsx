import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated, Alert } from 'react-native';
import { Card, Text, Title, useTheme, IconButton, Provider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.8;
const ITEM_HEIGHT = 160;
const SPACING = 10;

const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);

const CardItem = ({ liquor, onDelete }) => { // Receive handleDeleteLiquor as a prop
  const navigation = useNavigation();
  const theme = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

  const currentLiquor = useSelector((state) => state.liquor.currentLiquor);

  const handleOnScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / ITEM_WIDTH);
    setActiveIndex(index);
  };

  // Fetch liquor details by ID
  const handleCurrentLiquor = (liquor) => {
    navigation.navigate('EditLiquor', { liquor: liquor });
  };

  useEffect(() => {
    if (currentLiquor) {
      console.log(currentLiquor);
    }
  }, [currentLiquor]);

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
        <Card.Cover source={{ uri: item.url }} style={styles.productImage} />
      </Animated.View>
    );
  };

  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {liquor.images.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            {
              backgroundColor: index === activeIndex ? theme.colors.primary : theme.colors.backdrop,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <Provider>
      <Card style={styles.cardItem}>
        <Card.Content>
          <View style={styles.headerContainer}>
            <Title>{liquor.brand}</Title>
            <View style={styles.buttonGroup}>
              <IconButton
                icon="pencil-outline"
                onPress={() => handleCurrentLiquor(liquor)}
                size={24}
              />
              <IconButton
                icon="trash-can-outline"
                onPress={() => onDelete()} // Use the prop function here
                size={24}
              />
            </View>
          </View>

          <View style={styles.carouselContainer}>
            <AnimatedFlatList
              data={liquor.images}
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
            {liquor.description && (
              <Text style={styles.descriptionText} numberOfLines={2}>
                {liquor.description}
              </Text>
            )}
            {liquor.price && (
              <Text style={styles.priceText}>${liquor.price}</Text>
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
    marginRight: -8,
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

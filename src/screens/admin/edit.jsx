import * as React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider, TextInput, Button, Text, Menu, Portal, Modal, DefaultTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import styles from './createStyle';
import { useNavigation } from '@react-navigation/native';
import { updateLiquorById } from '../../redux/actions/liquorAction';

const bronzeTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#a46628',
    accent: '#cd7f32',
    background: '#fffff0',
    surface: '#f8f2dd',
    text: '#3e260f',
    placeholder: '#7b4c1e',
    backdrop: 'rgba(20, 13, 5, 0.5)',
  },
};

export default function EditLiquor({ route }) {
  const liquor = route.params?.liquor || {};
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [name, setName] = React.useState(liquor.name || '');
  const [price, setPrice] = React.useState(liquor.price ? liquor.price.toString() : '');
  const [description, setDescription] = React.useState(liquor.description || '');
  const [brand, setBrand] = React.useState(liquor.brand || '');
  const [stock, setStock] = React.useState(liquor.stock ? liquor.stock.toString() : '');
  const [category, setCategory] = React.useState(liquor.category || '');
  const [categoryVisible, setCategoryVisible] = React.useState(false);
  const [images, setImages] = React.useState(liquor.images || []);
  const [submitted, setSubmitted] = React.useState(false);
  const [imageModalVisible, setImageModalVisible] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const categories = [
    { value: 'Vodka', label: 'Vodka' },
    { value: 'Rum', label: 'Rum' },
    { value: 'Tequila', label: 'Tequila' },
    { value: 'Whiskey', label: 'Whiskey' },
    { value: 'Gin', label: 'Gin' },
    { value: 'Brandy', label: 'Brandy' },
    { value: 'Liqueur', label: 'Liqueur' },
    { value: 'Beer', label: 'Beer' },
    { value: 'Wine', label: 'Wine' },
    { value: 'Champagne', label: 'Champagne' },
    { value: 'Sake', label: 'Sake' },
    { value: 'Soju', label: 'Soju' },
    { value: 'Baijiu', label: 'Baijiu' },
    { value: 'Whisky', label: 'Whisky' },
    { value: 'Other', label: 'Other' },
  ];

  // Pick image from gallery
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0]]);
    }
  };

  // Take picture using camera
  const takePicture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0]]);
    }
  };

  // Remove an image from the list
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // View an image in full-screen modal
  const viewImage = (image) => {
    setSelectedImage(image);
    setImageModalVisible(true);
  };

  // Handle form submission
  const handleUpdate = async () => {
    if (!name || !price || !description || !brand || !stock || !category || images.length === 0) {
      alert('Please fill out all the fields and add at least one image.');
      return;
    }
  
    setIsLoading(true); // Start loading
  
    const formData = new FormData();
    formData.append('id', liquor._id);
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('brand', brand);
    formData.append('stock', stock);
    formData.append('category', category);
  
    images.forEach((img, index) => {
      if (img.uri) {
        const filename = img.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
  
        formData.append('images', {
          uri: img.uri,
          name: filename,
          type,
        });
      } else if (img.url) {
        formData.append('existingImages[]', img.url);
      }
    });
  
    try {
      const response = await dispatch(updateLiquorById({ liquorId: liquor._id, updatedData: formData }));
  
      // Set loading to false regardless of outcome
      setIsLoading(false);
      
      // Check if the action was rejected
      if (updateLiquorById.rejected.match(response)) {
        // Extract the error message from the payload
        const errorMessage = response.payload?.userMessage || 
                           response.payload?.message || 
                           'Failed to update liquor. Please try again.';
        alert(errorMessage);
      } else {
        // Success case
        setSubmitted(true);
        alert('Liquor updated successfully!');
        navigation.goBack(); // Optionally navigate back
      }
    } catch (error) {
      setIsLoading(false); // Make sure loading is turned off even if there's an error
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <PaperProvider theme={bronzeTheme}>
      {isLoading && (
        <View style={loadingStyles.overlay}>
          <View style={loadingStyles.container}>
            <ActivityIndicator size="large" color="#cd7f32" />
            <Text style={loadingStyles.text}>Updating liquor...</Text>
          </View>
        </View>
      )}
      
      <ScrollView style={styles.scroll}>
        <View style={styles.container}>
          <Text variant="headlineMedium" style={styles.title}>Edit Liquor</Text>

          <TextInput label="Liquor Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
          <TextInput
            label="Price (₱)"
            value={price}
            onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            mode="outlined"
            style={styles.input}
          />
          <TextInput label="Brand" value={brand} onChangeText={setBrand} mode="outlined" style={styles.input} />
          <TextInput
            label="Stock Quantity"
            value={stock}
            onChangeText={(text) => setStock(text.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            mode="outlined"
            style={styles.input}
          />

          <Text style={styles.sectionTitle}>Category</Text>
          <Menu visible={categoryVisible} onDismiss={() => setCategoryVisible(false)} anchor={
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setCategoryVisible(true)}>
              <Text style={styles.dropdownButtonText}>
                {category ? categories.find(cat => cat.value === category)?.label : 'Select Category'}
              </Text>
            </TouchableOpacity>
          }>
            {categories.map((cat, index) => (
              <Menu.Item key={index} title={cat.label} onPress={() => {
                setCategory(cat.value);
                setCategoryVisible(false);
              }} />
            ))}
          </Menu>

          <Text style={styles.sectionTitle}>Images</Text>
          <View style={styles.imageButtonsContainer}>
            <Button mode="outlined" icon="image" onPress={pickImage} style={styles.imageUploadButton}>Add Images</Button>
            <Button mode="outlined" icon="camera" onPress={takePicture} style={styles.imageUploadButton}>Take Picture</Button>
          </View>

          {images.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <TouchableOpacity onPress={() => viewImage(image)}>
                    <Image source={{ uri: image.uri || image.url }} style={styles.imagePreview} />
                  </TouchableOpacity>
                  <Button icon="close" mode="contained" compact onPress={() => removeImage(index)} style={styles.removeImageButton} />
                </View>
              ))}
            </View>
          )}

          <Button 
            mode="contained" 
            onPress={handleUpdate} 
            style={styles.submitButton}
            disabled={isLoading} // Disable button while loading
          >
            Complete Changes
          </Button>

          {submitted && (
            <View style={styles.resultContainer}>
              <Text variant="titleMedium" style={styles.resultTitle}>Product Details Updated:</Text>
              <Text style={styles.resultText}>Name: {name}</Text>
              <Text style={styles.resultText}>Price: ₱{price}</Text>
              <Text style={styles.resultText}>Brand: {brand}</Text>
              <Text style={styles.resultText}>Stock: {stock} units</Text>
              <Text style={styles.resultText}>Category: {categories.find(cat => cat.value === category)?.label}</Text>
              <Text style={styles.resultText}>Images: {images.length} uploaded</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Portal>
        <Modal visible={imageModalVisible} onDismiss={() => setImageModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          {selectedImage && (
            <View>
              <Image source={{ uri: selectedImage.uri || selectedImage.url }} style={styles.fullSizeImage} />
              <Button onPress={() => setImageModalVisible(false)} style={styles.closeModalButton}>Close</Button>
            </View>
          )}
        </Modal>
      </Portal>
    </PaperProvider>
  );
}

// Styles for the loading overlay
const loadingStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20, 13, 5, 0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    backgroundColor: '#f8f2dd',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    marginTop: 10,
    color: '#3e260f',
    fontSize: 16,
    fontWeight: '500',
  }
});
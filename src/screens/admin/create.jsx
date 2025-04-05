import * as React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Provider as PaperProvider, TextInput, Button, Text, Menu, Portal, Modal, DefaultTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { createLiquor } from '../../redux/slices/createLiqourSlice.js';
import * as ImagePicker from 'expo-image-picker';
import styles from './createStyle';
// Custom theme with bronze color palette
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

export default function App() {
    const dispatch = useDispatch();
  const [name, setname] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [brand, setBrand] = React.useState('');
  const [stock, setStock] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [categoryVisible, setCategoryVisible] = React.useState(false);
  const [images, setImages] = React.useState([]);
  const [submitted, setSubmitted] = React.useState(false);
  const [imageModalVisible, setImageModalVisible] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);

  // Categories for dropdown
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

  const pickImage = async () => {
    // Request media library permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
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

  const takePicture = async () => {
    // Request camera permissions
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
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

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const viewImage = (image) => {
    setSelectedImage(image);
    setImageModalVisible(true);
  };

    const handleSubmit = () => {
        // Validation: Check if all required fields are filled
        if (!name || !price || !description || !brand || !stock || !category || images.length === 0) {
            alert("Please fill out all the fields and add at least one image.");
            return;
        }
        const productDetails = {
            name,
            price,
            description,
            brand,
            stock,
            category,
            
          };
        
        
          // Dispatch the action to your Redux slice (createLiquorSlice)
          dispatch(createLiquor(productDetails, images));
        //   console.log("Product details submitted:", images);
          setSubmitted(true);
    }

  return (
    <PaperProvider theme={bronzeTheme}>
      <ScrollView style={styles.scroll}>
        <View style={styles.container}>
          <Text variant="headlineMedium" style={styles.title}>Liquor Details</Text>

          <TextInput
            label="Liquor Name"
            value={name}
            onChangeText={text => setname(text)}
            mode="outlined"
            style={styles.input}
            outlineColor="#b9722d"
            activeOutlineColor="#cd7f32"
            textColor="#3e260f"
          />

          <TextInput
            label="Price (₱)"
            value={price}
            onChangeText={text => setPrice(text.replace(/[^0-9.]/g, ''))}
            mode="outlined"
            keyboardType="decimal-pad"
            style={styles.input}
            outlineColor="#b9722d"
            activeOutlineColor="#cd7f32"
            textColor="#3e260f"
          />

          <TextInput
            label="Description"
            value={description}
            onChangeText={text => setDescription(text)}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            outlineColor="#b9722d"
            activeOutlineColor="#cd7f32"
            textColor="#3e260f"
          />

          <TextInput
            label="Brand"
            value={brand}
            onChangeText={text => setBrand(text)}
            mode="outlined"
            style={styles.input}
            outlineColor="#b9722d"
            activeOutlineColor="#cd7f32"
            textColor="#3e260f"
          />

          <TextInput
            label="Stock Quantity"
            value={stock}
            onChangeText={text => setStock(text.replace(/[^0-9]/g, ''))}
            mode="outlined"
            keyboardType="number-pad"
            style={styles.input}
            outlineColor="#b9722d"
            activeOutlineColor="#cd7f32"
            textColor="#3e260f"
          />

          {/* Category Dropdown */}
          <Text style={styles.sectionTitle}>Category</Text>
          <Menu
            visible={categoryVisible}
            onDismiss={() => setCategoryVisible(false)}
            contentStyle={styles.menuContent}
            anchor={
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setCategoryVisible(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {category ? categories.find(cat => cat.value === category)?.label : 'Select Category'}
                </Text>
              </TouchableOpacity>
            }
          >
            {categories.map((cat, index) => (
              <Menu.Item
                key={index}
                title={cat.label}
                titleStyle={styles.menuItemText}
                onPress={() => {
                  setCategory(cat.value);
                  setCategoryVisible(false);
                }}
              />
            ))}
          </Menu>

          {/* Image Upload Section */}
          <Text style={styles.sectionTitle}>Images</Text>
          <View style={styles.imageButtonsContainer}>
            <Button 
              mode="outlined" 
              icon="image" 
              onPress={pickImage} 
              style={styles.imageUploadButton}
              buttonColor="#f5eccf"
              textColor="#674019"
            >
              Add Images
            </Button>
            <Button 
              mode="outlined" 
              icon="camera" 
              onPress={takePicture} 
              style={styles.imageUploadButton}
              buttonColor="#f5eccf"
              textColor="#674019"
            >
              Take Picture
            </Button>
          </View>

          {/* Image Previews */}
          {images.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <TouchableOpacity onPress={() => viewImage(image)}>
                    <Image 
                      source={{ uri: image.uri }} 
                      style={styles.imagePreview} 
                    />
                    <View style={styles.imageBorder} />
                  </TouchableOpacity>
                  <Button 
                    icon="close" 
                    mode="contained" 
                    compact 
                    onPress={() => removeImage(index)}
                    style={styles.removeImageButton}
                    buttonColor="#a46628"
                  />
                </View>
              ))}
            </View>
          )}

          <Button 
            mode="contained" 
            onPress={handleSubmit} 
            style={styles.submitButton}
            buttonColor="#cd7f32"
            textColor="#fffff0"
          >
            Submit Product
          </Button>

          {submitted && (
            <View style={styles.resultContainer}>
              <Text variant="titleMedium" style={styles.resultTitle}>Product Details Submitted:</Text>
              <Text style={styles.resultText}>Name: {name}</Text>
              <Text style={styles.resultText}>Price: ${price}</Text>
              <Text style={styles.resultText}>Brand: {brand}</Text>
              <Text style={styles.resultText}>Stock: {stock} units</Text>
              <Text style={styles.resultText}>Category: {categories.find(cat => cat.value === category)?.label || 'Not selected'}</Text>
              <Text style={styles.resultText}>Images: {images.length} uploaded</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Image Preview Modal */}
      <Portal>
        <Modal 
          visible={imageModalVisible} 
          onDismiss={() => setImageModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedImage && (
            <View>
              <Image 
                source={{ uri: selectedImage.uri }} 
                style={styles.fullSizeImage} 
              />
              <Button 
                onPress={() => setImageModalVisible(false)}
                style={styles.closeModalButton}
                buttonColor="#cd7f32"
                textColor="#fffff0"
              >
                Close
              </Button>
            </View>
          )}
        </Modal>
      </Portal>
    </PaperProvider>
  );
}


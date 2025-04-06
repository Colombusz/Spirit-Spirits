import * as React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Provider as PaperProvider, TextInput, Button, Text, Menu, Portal, Modal, DefaultTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch } from 'react-redux';
import { createPromo } from '../../redux/actions/promoAction'; // Import the createPromo action
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

export default function DiscountProductForm() {
    const dispatch = useDispatch();
  const [name, setName] = React.useState('');
  const [discountRate, setDiscountRate] = React.useState('');
  const [description, setDescription] = React.useState('');
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
      aspect: [16, 9], // Landscape aspect ratio (width > height)
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
      aspect: [16, 9], // Landscape aspect ratio (width > height)
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
    if (!name || !discountRate || !category || images.length === 0) {
      alert("Please fill all required fields and add at least one image.");
      return;
    }
  
    const promoDetails = { name, discountRate, description, category };
  
    dispatch(createPromo({ promoDetails, images }))
      .unwrap()
      .then(() => {
        setSubmitted(true);
        // Reset form here if needed
      })
      .catch(err => {
        console.error("Failed to create promo:", err);
      });
  };

  // Calculate screen width for proper image display
  const screenWidth = Dimensions.get('window').width;
  const imageWidth = screenWidth * 0.9; // 90% of screen width
  const imageHeight = imageWidth * 9/16; // Maintain 16:9 aspect ratio

  return (
    <PaperProvider theme={bronzeTheme}>
      <ScrollView style={styles.scroll}>
        <View style={styles.container}>
          <Text variant="headlineMedium" style={styles.title}>Discount Item Form</Text>

          <TextInput
            label="Product Name*"
            value={name}
            onChangeText={text => setName(text)}
            mode="outlined"
            style={styles.input}
            outlineColor="#b9722d"
            activeOutlineColor="#cd7f32"
            textColor="#3e260f"
          />

          <TextInput
            label="Discount Rate (%)*"
            value={discountRate}
            onChangeText={text => {
              // Validate for numbers only and max 100%
              const numericValue = text.replace(/[^0-9.]/g, '');
              if (parseFloat(numericValue) <= 100) {
                setDiscountRate(numericValue);
              }
            }}
            mode="outlined"
            keyboardType="decimal-pad"
            style={styles.input}
            outlineColor="#b9722d"
            activeOutlineColor="#cd7f32"
            textColor="#3e260f"
            right={<TextInput.Affix text="%" />}
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

          {/* Category Dropdown */}
          <Text style={styles.sectionTitle}>Category*</Text>
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
          <Text style={styles.sectionTitle}>Images* (Landscape Oriented)</Text>
          <View style={styles.imageButtonsContainer}>
            <Button 
              mode="outlined" 
              icon="image" 
              onPress={pickImage} 
              style={styles.imageUploadButton}
              buttonColor="#f5eccf"
              textColor="#674019"
            >
              Gallery
            </Button>
            <Button 
              mode="outlined" 
              icon="camera" 
              onPress={takePicture} 
              style={styles.imageUploadButton}
              buttonColor="#f5eccf"
              textColor="#674019"
            >
              Camera
            </Button>
          </View>

          {/* Image Previews - Enforce landscape orientation */}
          {images.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <TouchableOpacity onPress={() => viewImage(image)}>
                    <Image 
                      source={{ uri: image.uri }} 
                      style={[styles.imagePreview, {width: imageWidth, height: imageHeight}]} 
                    />
                    <View style={[styles.imageBorder, {width: imageWidth, height: imageHeight}]} />
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

          <Text style={styles.helperText}>* Required fields</Text>

          <Button 
            mode="contained" 
            onPress={handleSubmit} 
            style={styles.submitButton}
            buttonColor="#cd7f32"
            textColor="#fffff0"
          >
            Submit
          </Button>

          {submitted && (
            <View style={styles.resultContainer}>
              <Text variant="titleMedium" style={styles.resultTitle}>Details Submitted:</Text>
              <Text style={styles.resultText}>Name: {name}</Text>
              <Text style={styles.resultText}>Discount Rate: {discountRate}%</Text>
              <Text style={styles.resultText}>Category: {categories.find(cat => cat.value === category)?.label || 'Not selected'}</Text>
              <Text style={styles.resultText}>Description: {description}</Text>
              <Text style={styles.resultText}>Images: {images.length} uploaded</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Image Preview Modal - Full screen with landscape orientation */}
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
                resizeMode="contain"
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

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#fffff0', // Lightest cream from palette
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
    paddingTop: 60,
    backgroundColor: '#fffff0',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#674019', // Medium bronze
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f9f4e2', // Light cream
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '500',
    color: '#674019', // Medium bronze
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#b9722d', // Medium bronze
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f7f0d9', // Light cream
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#523314', // Dark bronze
  },
  menuContent: {
    backgroundColor: '#f8f2dd', // Light cream
  },
  menuItemText: {
    color: '#523314', // Dark bronze
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageUploadButton: {
    marginBottom: 16,
    flex: 0.48,
    borderColor: '#a46628', // Medium-dark bronze
  },
  imagePreviewContainer: {
    flexDirection: 'column',
    marginBottom: 20,
    alignItems: 'center',
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  imagePreview: {
    borderRadius: 8,
  },
  imageBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 2,
    borderColor: '#cd7f32', // Bronze
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 12,
    width: 24,
    height: 24,
    padding: 0,
  },
  helperText: {
    marginBottom: 10,
    color: '#7b4c1e',
    fontStyle: 'italic',
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 6,
  },
  resultContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5eccf', // Light cream
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#cd7f32', // Bronze
  },
  resultTitle: {
    marginBottom: 8,
    color: '#674019', // Medium bronze
    fontWeight: 'bold',
  },
  resultText: {
    color: '#523314', // Dark bronze
    marginBottom: 4,
  },
  modalContainer: {
    backgroundColor: '#f8f2dd', // Light cream
    padding: 20,
    margin: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#cd7f32', // Bronze
  },
  fullSizeImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  closeModalButton: {
    marginTop: 16,
  }
});
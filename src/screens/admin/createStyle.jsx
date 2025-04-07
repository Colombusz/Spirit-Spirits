import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: '#fffff0', // Lightest cream from palette
      },
      container: {
        flex: 1,
        padding: 20,
        paddingBottom: 40,
        paddingTop: 100,
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
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        justifyContent: 'flex-start',
      },
      imagePreviewWrapper: {
        position: 'relative',
        margin: 4,
      },
      imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 4,
      },
      imageBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderWidth: 2,
        borderColor: '#cd7f32', // Bronze
        borderRadius: 4,
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
        resizeMode: 'contain',
      },
      closeModalButton: {
        marginTop: 16,
      }
        });
    
    export default styles;
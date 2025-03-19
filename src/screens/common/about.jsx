import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

// Trippings bukas nako magdesign

const About = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 15,
        color: '#555',
    },
});

export default About;
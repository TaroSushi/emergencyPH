import React from "react";
import { View, Button, StyleSheet, Alert } from "react-native";
import * as Linking from "expo-linking";
import axios from "axios";

export default function App() {
    const phoneNumber = "1234567890";
    const person = "Jane Diana";
    const service = "Emergency";


    // Function to open dialer
    const openDialer = (autoCall = false) => {
        console.log("open dialer");
        axios.post("http://localhost:3000/api/v1/emergency/call", {
            person: person,
            service: service,
            number: phoneNumber,
        }).then((response) => {
            console.log("API response:", response.data);
        });

        let url = autoCall ? `tel:${phoneNumber}` : `telprompt:${phoneNumber}`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (!supported) {
                    Alert.alert("Error", "Phone call feature not supported on this device.");
                } else {
                    return Linking.openURL(url);
                }
            })
            .catch((err) => console.error("An error occurred", err));
    };

    return (
        <View style={styles.container}>
            <Button title="Call Automatically" onPress={() => openDialer(true)} />
            <Button title="Open Dialer" onPress={() => openDialer(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
});

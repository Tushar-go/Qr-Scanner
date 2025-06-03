import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View, Image } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import * as Network from "expo-network";
import { PaperProvider, Card, Button, Text, ActivityIndicator } from "react-native-paper";

export default function ResultScreen() {
  const { id } = useLocalSearchParams();
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchItemData = async () => {
      if (!id) {
        setError("No ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check network connection
        const networkState = await Network.getNetworkStateAsync();
        if (!networkState.isConnected) {
          throw new Error("No internet connection. Please check your network and try again.");
        }

        // console.log("Fetching data for ID:", id);

        const apiUrl = `https://erp.ayaanmr.com/urlapi/api/url/getapi?APIKEY=TESTKEYITM&UID=API&UPW=ba1234&P1=${id}&P2=&P3=&P4=`;
        // console.log("API URL:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        // console.log("API Response:", result);

        if (result && Array.isArray(result) && result.length > 0) {
          setItemData(result[0]);
        } else if (result && typeof result === "object" && !Array.isArray(result)) {
          setItemData(result);
        } else {
          throw new Error("No item found for this ID.");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
        Alert.alert("Error", `Failed to fetch item data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
  }, [id]);

  const handleScanAnother = () => {
    router.push("/camera");
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const fetchData = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        if (!networkState.isConnected) {
          throw new Error("No internet connection. Please check your network and try again.");
        }

        const apiUrl = `https://erp.ayaanmr.com/urlapi/api/url/getapi?APIKEY=TESTKEYITM&UID=API&UPW=ba1234&P1=${id}&P2=&P3=&P4=`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result && Array.isArray(result) && result.length > 0) {
          setItemData(result[0]);
        } else if (result && typeof result === "object") {
          setItemData(result);
        } else {
          throw new Error("No item found for this ID.");
        }
      } catch (error) {
        setError(error.message);
        Alert.alert("Error", `Failed to fetch item data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  };

  if (loading) {
    return (
      <PaperProvider>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading item data...
          </Text>
        </View>
      </PaperProvider>
    );
  }

  if (error) {
    return (
      <PaperProvider>
        <View style={[styles.container, styles.centered]}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineSmall" style={styles.errorTitle}>
                Error
              </Text>
              <Text variant="bodyMedium" style={styles.errorText}>
                {error}
              </Text>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button mode="outlined" onPress={handleRetry}>
                Retry
              </Button>
              <Button mode="contained" onPress={handleScanAnother}>
                Scan Another
              </Button>
            </Card.Actions>
          </Card>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <ScrollView style={styles.container}>
        {itemData ? (
          <Card style={styles.card}>
            <Card.Title title="Item Details" subtitle={`ID: ${id}`} />
            <Card.Content>
              <View style={styles.dataRow}>
                <Text variant="labelLarge">Item ID:</Text>
                <Text variant="bodyMedium">{itemData.ItmID || "N/A"}</Text>
              </View>

              <View style={styles.dataRow}>
                <Text variant="labelLarge">Name:</Text>
                <Text variant="bodyMedium">{itemData.ItmNm || "N/A"}</Text>
              </View>

              {itemData.ItmThmbnl ? (
                <View style={styles.imageContainer}>
                  <Text variant="labelLarge" style={styles.imageLabel}>
                    Image:
                  </Text>
                  <Image
                    source={{ uri: `data:image/png;base64,${itemData.ItmThmbnl}` }}
                    style={styles.image}
                    onError={(error) => {
                      console.error("Image load error:", error);
                      Alert.alert("Error", "Failed to load image.");
                    }}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View style={styles.dataRow}>
                  <Text variant="labelLarge">Image:</Text>
                  <Text variant="bodyMedium" style={styles.noImageText}>
                    No image available
                  </Text>
                </View>
              )}
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
              <Button mode="contained" onPress={handleScanAnother} icon="qrcode-scan">
                Scan Another Item
              </Button>
            </Card.Actions>
          </Card>
        ) : (
          <View style={styles.centered}>
            <Text variant="bodyLarge" style={styles.noDataText}>
              No data available for ID: {id}
            </Text>
            <Button mode="contained" onPress={handleScanAnother} style={styles.scanButton}>
              Scan Another Item
            </Button>
          </View>
        )}
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginVertical: 10,
    elevation: 4,
  },
  cardActions: {
    justifyContent: "center",
    paddingVertical: 16,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
    flexWrap: "wrap",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  imageLabel: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  noImageText: {
    fontStyle: "italic",
    color: "#666",
  },
  loadingText: {
    marginTop: 16,
    textAlign: "center",
  },
  errorTitle: {
    color: "#d32f2f",
    marginBottom: 8,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 16 
  },
  noDataText: {
    textAlign: "center",
    marginBottom: 20,
  },
  scanButton: {
    marginTop: 16,
  },
});
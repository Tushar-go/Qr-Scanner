import { Link, useFocusEffect } from "expo-router";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import { Video } from "expo-av";
import { getMediaType } from "../utils/constants";

export default function HomeScreen() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadFiles();
    }, [])
  );

  const loadFiles = async () => {
    try {
      setLoading(true);
      
      if (!FileSystem.documentDirectory) {
        console.warn("Document directory not available");
        setImages([]);
        return;
      }

      const res = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory
      );

      // console.log("Found files:", res);

      const filteredFiles = res
        .map((file) => ({
          name: file,
          uri: FileSystem.documentDirectory + file,
          type: getMediaType(file),
        }))
        .filter((file) => {
          const extension = file.name.split(".").pop()?.toLowerCase();
          return ["jpg", "jpeg", "png", "mp4", "mov"].includes(extension || "");
        });

      // console.log("Filtered files:", filteredFiles);
      setImages(filteredFiles);
      
    } catch (error) {
      console.error("Error loading files:", error);
      Alert.alert("Error", "Failed to load files from storage");
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <Link href={`/${item.name}`} asChild>
      <Pressable style={styles.imageContainer}>
        {item.type === "image" && (
          <Image
            style={styles.mediaItem}
            source={{ uri: item.uri }}
            onError={(error) => {
              console.error("Error loading image:", error);
            }}
          />
        )}
        {item.type === "video" && (
          <View style={styles.videoContainer}>
            <Video
              style={styles.mediaItem}
              source={{ uri: item.uri }}
              resizeMode="cover"
              shouldPlay={false}
              isLooping={false}
              onError={(error) => {
                console.error("Error loading video:", error);
              }}
            />
            <MaterialIcons
              name="play-circle-outline"
              size={32}
              style={styles.playIcon}
              color="white"
            />
          </View>
        )}
        {item.type === "unknown" && (
          <View style={[styles.mediaItem, styles.unknownFile]}>
            <MaterialIcons name="insert-drive-file" size={32} color="gray" />
            <Text style={styles.fileName} numberOfLines={2}>
              {item.name}
            </Text>
          </View>
        )}
      </Pressable>
    </Link>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MaterialIcons name="photo-library" size={64} color="gray" />
        <Text style={styles.loadingText}>Loading media...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {images.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="photo-camera" size={64} color="gray" />
          <Text style={styles.emptyText}>No media files found</Text>
          <Text style={styles.emptySubtext}>
            Tap the camera button to capture your first photo or video
          </Text>
        </View>
      ) : (
        <FlatList
          data={images}
          numColumns={3}
          contentContainerStyle={styles.flatListContent}
          columnWrapperStyle={styles.row}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
          onRefresh={loadFiles}
          refreshing={loading}
        />
      )}

      <Link href={"/camera"} asChild>
        <Pressable style={styles.floatingButton}>
          <MaterialIcons name="photo-camera" size={30} color="white" />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContent: {
    gap: 10,
    padding: 10,
  },
  row: {
    gap: 10,
  },
  imageContainer: {
    flex: 1,
    maxWidth: "33.33%",
  },
  mediaItem: {
    aspectRatio: 3 / 4,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  videoContainer: {
    position: 'relative',
  },
  playIcon: {
    position: "absolute",
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  unknownFile: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  fileName: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
    color: 'gray',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gray',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: 'gray',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 16,
  },
  floatingButton: {
    backgroundColor: "royalblue",
    padding: 15,
    borderRadius: 50,
    position: "absolute",
    bottom: 30,
    right: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});


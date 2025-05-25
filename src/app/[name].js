import { View, Text, Image, TouchableOpacity, Pressable, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system";
import { router, Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { getMediaType } from "../utils/constants";
import * as MediaLibrary from "expo-media-library";
import { useVideoPlayer, VideoView } from "expo-video";

export default function ImageScreen() {
  const { name } = useLocalSearchParams();
  const fulluri = (FileSystem.documentDirectory || "") + (name || "");
  const type = getMediaType(fulluri);

  const player = useVideoPlayer(fulluri, (player) => {
    player.loop = true;
    player.play();
  });

  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const onSave = async () => {
    try {
      if (permissionResponse?.status !== "granted") {
        const permission = await requestPermission();
        if (!permission.granted) {
          Alert.alert("Permission Required", "Please grant permission to save to gallery.");
          return;
        }
      }
      
      const asset = await MediaLibrary.createAssetAsync(fulluri);
      Alert.alert("Success", "Saved to gallery.");
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", `Failed to save media: ${error.message}`);
    }
  };

  const onDelete = async () => {
    Alert.alert(
      "Delete File",
      "Are you sure you want to delete this file?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const fileInfo = await FileSystem.getInfoAsync(fulluri);
              if (!fileInfo.exists) {
                Alert.alert("Error", "File does not exist.");
                return;
              }
              
              await FileSystem.deleteAsync(fulluri, { idempotent: true });
              router.back();
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", `Delete failed: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Media",
          headerRight: () => (
            <View style={{ gap: 10, flexDirection: "row" }}>
              <Pressable
                onPress={onDelete}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="delete" size={26} color="crimson" />
              </Pressable>
              <Pressable
                onPress={onSave}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="save" size={26} color="dimgray" />
              </Pressable>
            </View>
          ),
        }}
      />
      
      {type === "image" && (
        <View style={{ flex: 1 }}>
          <Image
            style={{ width: "100%", height: "100%" }}
            source={{ uri: fulluri }}
            resizeMode="contain"
          />
        </View>
      )}
      
      {type === "video" && (
        <VideoView
          player={player}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
      )}
      
      {type === "unknown" && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="error" size={64} color="gray" />
          <Text style={{ marginTop: 16, fontSize: 18, color: 'gray' }}>
            Unsupported file type
          </Text>
        </View>
      )}
    </View>
  );
}

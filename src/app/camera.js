import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Button, Pressable, SafeAreaView, StyleSheet, Text, View, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { validateQRCode } from "../utils/constants";

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [facing, setFacing] = useState("back");
  const [cameraMode, setCameraMode] = useState("qr"); 
  const [hasScanned, setHasScanned] = useState(false); 
  const camera = useRef(null);

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const toggleCameraMode = () => {
    setCameraMode((prev) => {
      setHasScanned(false); 
      if (prev === "picture") return "video";
      if (prev === "video") return "qr";
      return "picture";
    });
  };

  const handleQRCodeScanned = ({ data }) => {
    if (hasScanned || !data) return; // Prevent multiple scans

    setHasScanned(true);
    // console.log("QR Code scanned:", data);

    const validation = validateQRCode(data);

    if (validation.isValid) {
      // console.log("Valid QR code found, navigating to result with ID:", validation.id);
      router.push({
        pathname: "/result",
        params: { id: validation.id.toString() },
      });
    } else {
      Alert.alert("Invalid QR Code", validation.error, [
        { text: "OK", onPress: () => setHasScanned(false) },
      ]);
    }
  };

  function onTestClick (){
    const testId = 18
    router.push({
        pathname: "/result",
        params: { id: testId.toString() }
      });
  }

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
    if (microphonePermission && !microphonePermission.granted && microphonePermission.canAskAgain) {
      requestMicrophonePermission();
    }
  }, [permission, microphonePermission]);

  if (!permission?.granted) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "white" }}>Requesting camera permission...</Text>
        {permission?.canAskAgain && (
          <Button title="Grant Permission" onPress={requestPermission} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={camera}
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={
          cameraMode === "qr"
            ? {
                barcodeTypes: ["qr"],
                interval: 500, 
              }
            : undefined
        }
        onBarcodeScanned={cameraMode === "qr" ? handleQRCodeScanned : undefined}
      >
        {cameraMode === "qr" && (
          <View style={styles.qrOverlay}>
            <Pressable onPress={onTestClick} style={{backgroundColor:"white",paddingHorizontal:10,borderRadius:12,paddingVertical:4,marginBottom:14}}>
          <Text>Test ID</Text>
        </Pressable>
            <View style={styles.qrFrame} />
            <Text style={styles.qrText}>
              {hasScanned ? "Processing..." : "Point camera at QR code"}
            </Text>
            <Text style={styles.qrSubText}>
              QR code must contain a numeric ID
            </Text>
          </View>
        )}
      </CameraView>

      <View style={styles.footer}>
        <MaterialIcons
          onPress={toggleCameraMode}
          name={
            cameraMode === "picture" ? "videocam" :
            cameraMode === "video" ? "qr-code" : "camera"
          }
          size={30}
          color="white"
        />

        
        
        <MaterialIcons
          onPress={toggleCameraFacing}
          name="flip-camera-ios"
          size={30}
          color="white"
        />
      </View>

      <MaterialIcons
        name="close"
        color="white"
        style={styles.close}
        size={30}
        onPress={() => router.back()}
      />

      <View style={styles.modeIndicator}>
        <Text style={styles.modeText}>
          {cameraMode.toUpperCase()} MODE
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "black",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  close: {
    position: "absolute",
    top: 50,
    left: 25,
    zIndex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#00000099",
    padding: 20,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  qrOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  qrFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "transparent",
  },
  qrText: {
    color: "white",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
  qrSubText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
    opacity: 0.8,
  },
  modeIndicator: {
    position: "absolute",
    top: 50,
    right: 25,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  modeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});


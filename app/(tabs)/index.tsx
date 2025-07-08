import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Stack } from 'expo-router';

export default function Camera() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermissionResponse, requestMediaPermission] = MediaLibrary.usePermissions();

  const [facing, setFacing] = useState<CameraType>('back');
  const [recentImageUri, setRecentImageUri] = useState<string | null>(null);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const cameraRef = useRef<Camera | null>(null);
  const navigation = useNavigation();
  const [toggleValue, setToggleValue] = useState<'X' | 'Y'>('X');

  useEffect(() => {
    (async () => {
      if (!mediaPermissionResponse?.granted) {
        const response = await requestMediaPermission();
        if (!response.granted) return;
      }

      const assets = await MediaLibrary.getAssetsAsync({ first: 1, sortBy: [["creationTime", false]], mediaType: 'photo' });

      if (assets.assets.length > 0) {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(assets.assets[0]);
        if (assetInfo.localUri) {
          setRecentImageUri(assetInfo.localUri);
        }
      }
    })();
  }, [mediaPermissionResponse]);

  async function controlCameraCapture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      const asset = await MediaLibrary.createAssetAsync(photo.uri);
      const info = await MediaLibrary.getAssetInfoAsync(asset);

      if (info.localUri) {
        setRecentImageUri(info.localUri);
      }
    }
  }

  function controlCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  async function controlCameraGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setRecentImageUri(result.assets[0].uri);
    }
  }

  function controlCameraFlash() {
    setFlash((prev) => (prev === 'off' ? 'on' : 'off'));
  }

  function controlCameraClose() {
    navigation.goBack();
  }

  function toggleXY() {
    setToggleValue(prev => (prev === 'X' ? 'Y' : 'X'));
  }

  if (!cameraPermission) {
    return (
      <SafeAreaView style={styles.containerCamera}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Loading camera...</Text>
      </SafeAreaView>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <SafeAreaView style={styles.containerCamera}>
        <Text style={{ color: 'white', textAlign: 'center', marginBottom: 10 }}>
          We need your permission to access the camera
        </Text>
        <Button onPress={requestCameraPermission} title="Grant Camera Permission" />
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.containerCamera}>
        <View style={styles.cameraWrapper}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            flash={flash}
          />

          {/* All UI overlays go here */}
          <TouchableOpacity onPress={controlCameraFlash} style={styles.controlCameraFlash}>
            <Ionicons
              name={flash === 'on' ? 'flash' : 'flash-off'}
              style={styles.cameraFlashIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={controlCameraClose} style={styles.controlCameraClose}>
            <Ionicons name="close" style={styles.cameraCloseIcon} />
          </TouchableOpacity>

          <View style={styles.containerToggleXY}>
            <TouchableOpacity
              style={[styles.toggleXYOption, toggleValue === 'X' && styles.toggleXYOptionActive]}
              onPress={() => setToggleValue('X')}
            >
              <Text style={styles.toggleXYText}>X</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleXYOption, toggleValue === 'Y' && styles.toggleXYOptionActive]}
              onPress={() => setToggleValue('Y')}
            >
              <Text style={styles.toggleXYText}>Y</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.containerControl}>
            <TouchableOpacity onPress={controlCameraGallery} style={styles.controlCameraGallery}>
              {recentImageUri ? (
                <Image source={{ uri: recentImageUri }} style={styles.galleryThumbnail} />
              ) : (
                <View style={styles.galleryThumbnail} />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={controlCameraCapture} style={styles.controlCameraCapture}>
              <View style={styles.cameraCaptureElement} />
            </TouchableOpacity>

            <TouchableOpacity onPress={controlCameraFacing} style={styles.controlCameraFacing}>
              <Ionicons name="camera-reverse" style={styles.cameraFacingIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

    </>
  );
}

const styles = StyleSheet.create({
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },

  containerCamera: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
    paddingBottom: 130,
  },

  containerControl: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 130,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121212',
    paddingHorizontal: 25,
    paddingTop: 15,
    paddingBottom: 30,
  },

  controlCameraGallery: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 100,
    overflow: 'hidden',
  },
  galleryThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  controlCameraCapture: {
    width: 80,
    height: 80,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraCaptureElement: {
    width: 65,
    height: 65,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
  },
  controlCameraFacing: {
    alignItems: 'center',
  },
  cameraFacingIcon: {
    fontSize: 47.5,
    color: '#FFFFFF',
  },

  controlCameraFlash: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    width: 35,
    height: 35,
    top: 20,
    left: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 100,
  },

  cameraFlashIcon: {
    fontSize: 17.5,
    color: '#FFFFFF',
  },

  controlCameraClose: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    width: 45,
    height: 45,
    top: 20,
    right: 15,
  },

  cameraCloseIcon: {
    fontSize: 35,
    color: '#FFFFFF',
  },

  containerToggleXY: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: 135,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 100,
    alignSelf: 'center',
    marginVertical: 10,
  },

  toggleXYOption: {
    paddingVertical: 5,
    paddingHorizontal: 35,
    backgroundColor: 'rgba(255, 255, 255, 0)',
    borderRadius: 100,
  },

  toggleXYOptionActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },

  toggleXYText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

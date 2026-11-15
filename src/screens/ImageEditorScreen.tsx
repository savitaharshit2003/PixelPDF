import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  Image,
  FlatList,
  Alert,
} from 'react-native';

import type { Asset } from 'react-native-image-picker';

interface ImageEditorScreenProps {
  images: Asset[];
  initialRotations?: Record<string, number>;
  onBack: (images: Asset[], rotations: Record<string, number>) => void;
  onContinue: (images: Asset[], rotations: Record<string, number>) => void;
}

const ImageEditorScreen: React.FC<ImageEditorScreenProps> = ({
  images: initialImages,
  initialRotations = {},
  onBack,
  onContinue,
}) => {
  const [images, setImages] = useState<Asset[]>(initialImages);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [rotations, setRotations] =
    useState<Record<string, number>>(initialRotations);

  const currentImage = images[selectedIndex];

  const getRotation = (uri?: string) => {
    return uri ? rotations[uri] || 0 : 0;
  };

  const rotateImage = () => {
    if (!currentImage?.uri) return;

    setRotations(previous => ({
      ...previous,
      [currentImage.uri!]: ((previous[currentImage.uri!] || 0) + 90) % 360,
    }));
  };

  const removeImage = () => {
    if (!currentImage) return;

    Alert.alert('Remove Image', 'Do you want to remove this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const updatedImages = images.filter(
            (_, index) => index !== selectedIndex,
          );

          setImages(updatedImages);

          if (updatedImages.length === 0) {
            onBack([], rotations);
            return;
          }

          setSelectedIndex(Math.min(selectedIndex, updatedImages.length - 1));
        },
      },
    ]);
  };

  const renderThumbnail = ({ item, index }: { item: Asset; index: number }) => {
    const isSelected = selectedIndex === index;

    return (
      <Pressable
        onPress={() => setSelectedIndex(index)}
        style={[styles.thumbnailCard, isSelected && styles.selectedThumbnail]}
      >
        <Image
          source={{ uri: item.uri }}
          style={[
            styles.thumbnail,
            {
              transform: [{ rotate: `${getRotation(item.uri)}deg` }],
            },
          ]}
        />

        <View style={styles.thumbnailNumber}>
          <Text style={styles.thumbnailNumberText}>{index + 1}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#F7F8FC" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => onBack(images, rotations)}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Image Editor</Text>
          <Text style={styles.headerSubtitle}>Edit before creating PDF</Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.headerCount}>{images.length}</Text>
        </View>
      </View>

      {/* Main Preview */}
      <View style={styles.previewSection}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>Preview Image</Text>

          <Text style={styles.imagePosition}>
            {selectedIndex + 1} of {images.length}
          </Text>
        </View>

        <View style={styles.previewContainer}>
          {currentImage?.uri && (
            <Image
              source={{ uri: currentImage.uri }}
              resizeMode="contain"
              style={[
                styles.previewImage,
                {
                  transform: [
                    { rotate: `${getRotation(currentImage.uri)}deg` },
                  ],
                },
              ]}
            />
          )}
        </View>

        <Text style={styles.imageInfo}>
          {currentImage?.fileName || 'Selected Image'}
        </Text>
      </View>

      {/* Editing Tools */}
      <View style={styles.toolsSection}>
        <Text style={styles.toolsHeading}>Editing Tools</Text>

        <View style={styles.toolsRow}>
          <Pressable style={styles.toolButton} onPress={rotateImage}>
            <Text style={styles.toolEmoji}>↻</Text>
            <Text style={styles.toolLabel}>Rotate 90°</Text>
          </Pressable>

          <Pressable style={styles.toolButton} onPress={removeImage}>
            <Text style={styles.deleteEmoji}>✕</Text>
            <Text style={styles.toolLabel}>Remove</Text>
          </Pressable>
        </View>

        <Text style={styles.toolNote}>
          Rotation is saved for the PDF page arrangement step.
        </Text>
      </View>

      {/* Image Thumbnails */}
      <View style={styles.thumbnailSection}>
        <View style={styles.thumbnailHeader}>
          <Text style={styles.toolsHeading}>All Images</Text>

          <Text style={styles.imageCount}>{images.length} photos</Text>
        </View>

        <FlatList
          data={images}
          horizontal
          keyExtractor={(item, index) => item.uri || String(index)}
          renderItem={renderThumbnail}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailList}
        />
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <Pressable
          style={[
            styles.continueButton,
            images.length === 0 && styles.disabledButton,
          ]}
          disabled={images.length === 0}
          onPress={() => onContinue(images, rotations)}
        >
          <Text style={styles.continueText}>Continue to Arrange Pages</Text>

          <Text style={styles.continueArrow}>→</Text>
        </Pressable>

        <Text style={styles.bottomNote}>
          Your original photos remain unchanged.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    fontSize: 32,
    color: '#17213B',
    lineHeight: 37,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#17213B',
  },

  headerSubtitle: {
    fontSize: 10,
    color: '#9299AA',
    marginTop: 3,
  },

  headerRight: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E7EDFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerCount: {
    fontSize: 14,
    color: '#3563E9',
    fontWeight: '800',
  },

  previewSection: {
    paddingHorizontal: 20,
    marginTop: 12,
  },

  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  previewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#17213B',
  },

  imagePosition: {
    fontSize: 12,
    color: '#3563E9',
    fontWeight: '700',
  },

  previewContainer: {
    height: 245,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8EBF3',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },

  previewImage: {
    width: '100%',
    height: '100%',
  },

  imageInfo: {
    fontSize: 11,
    color: '#9299AA',
    marginTop: 8,
  },

  toolsSection: {
    paddingHorizontal: 20,
    marginTop: 22,
  },

  toolsHeading: {
    color: '#17213B',
    fontSize: 15,
    fontWeight: '800',
  },

  toolsRow: {
    flexDirection: 'row',
    marginTop: 13,
  },

  toolButton: {
    flex: 1,
    height: 75,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDF0F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  toolEmoji: {
    fontSize: 26,
    color: '#3563E9',
  },

  deleteEmoji: {
    fontSize: 23,
    color: '#E14C5A',
  },

  toolLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#17213B',
    marginTop: 5,
  },

  toolNote: {
    fontSize: 10,
    color: '#9299AA',
    marginTop: 9,
  },

  thumbnailSection: {
    marginTop: 23,
  },

  thumbnailHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  imageCount: {
    fontSize: 11,
    color: '#9299AA',
  },

  thumbnailList: {
    paddingHorizontal: 15,
    paddingBottom: 8,
  },

  thumbnailCard: {
    width: 75,
    height: 75,
    borderRadius: 13,
    overflow: 'hidden',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#E5E8F0',
  },

  selectedThumbnail: {
    borderColor: '#3563E9',
  },

  thumbnail: {
    width: '100%',
    height: '100%',
  },

  thumbnailNumber: {
    position: 'absolute',
    left: 5,
    top: 5,
    backgroundColor: '#3563E9',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  thumbnailNumberText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  bottomContainer: {
    marginTop: 'auto',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 13,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
  },

  continueButton: {
    height: 53,
    backgroundColor: '#3563E9',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    backgroundColor: '#B8C5E9',
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  continueArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 8,
  },

  bottomNote: {
    textAlign: 'center',
    color: '#9299AA',
    fontSize: 10,
    marginTop: 8,
  },
});

export default ImageEditorScreen;

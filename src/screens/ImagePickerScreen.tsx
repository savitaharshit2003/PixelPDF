
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  FlatList,
  Image,
  Alert,
} from 'react-native';

import {
  launchImageLibrary,
  Asset,
} from 'react-native-image-picker';

const MAX_IMAGES = 100;

interface ImagePickerScreenProps {
  onBack: () => void;
  onContinue: (images: Asset[]) => void;
  initialImages?: Asset[];
}

const ImagePickerScreen: React.FC<ImagePickerScreenProps> = ({
  onBack,
  onContinue,
  initialImages = [],
}) => {
  const [images, setImages] = useState<Asset[]>(initialImages);
  const [loading, setLoading] = useState(false);

  const openGallery = async () => {
    const remaining = MAX_IMAGES - images.length;

    if (remaining <= 0) {
      Alert.alert(
        'Limit reached',
        'You can select a maximum of 100 images.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: remaining,
        includeBase64: false,
        includeExtra: false,
      });

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert(
          'Gallery Error',
          response.errorMessage || 'Unable to open gallery.'
        );
        return;
      }

      const newImages = (response.assets || []).filter(
        (asset) => !!asset.uri
      );

      if (newImages.length === 0) {
        return;
      }

      setImages((previousImages) => {
        const existingUris = new Set(
          previousImages.map((image) => image.uri)
        );

        const uniqueImages = newImages.filter(
          (image) => !existingUris.has(image.uri)
        );

        const availableSlots = MAX_IMAGES - previousImages.length;

        return [
          ...previousImages,
          ...uniqueImages.slice(0, availableSlots),
        ];
      });
    } catch (error) {
      Alert.alert(
        'Error',
        'Something went wrong while selecting images.'
      );
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (uri?: string) => {
    if (!uri) return;

    setImages((previousImages) =>
      previousImages.filter((image) => image.uri !== uri)
    );
  };

  const clearImages = () => {
    Alert.alert(
      'Clear all images?',
      'Are you sure you want to remove all selected images?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => setImages([]),
        },
      ]
    );
  };

  const renderImage = ({
    item,
    index,
  }: {
    item: Asset;
    index: number;
  }) => {
    return (
      <View style={styles.imageCard}>
        <Image
          source={{ uri: item.uri }}
          style={styles.thumbnail}
        />

        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>
            {index + 1}
          </Text>
        </View>

        <Pressable
          style={styles.removeButton}
          onPress={() => removeImage(item.uri)}
        >
          <Text style={styles.removeText}>×</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#F7F8FC"
        barStyle="dark-content"
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          Select Images
        </Text>

        <View style={styles.headerPlaceholder} />
      </View>

      {/* Selection Info */}
      <View style={styles.infoSection}>
        <Text style={styles.title}>
          Choose your photos
        </Text>

        <Text style={styles.subtitle}>
          Select multiple images to create a single PDF document.
        </Text>

        <View style={styles.counterRow}>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {images.length} / {MAX_IMAGES} selected
            </Text>
          </View>

          {images.length > 0 && (
            <Pressable onPress={clearImages}>
              <Text style={styles.clearText}>
                Clear all
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Gallery Button */}
      <Pressable
        style={({ pressed }) => [
          styles.galleryButton,
          pressed && { opacity: 0.8 },
          loading && { opacity: 0.6 },
        ]}
        onPress={openGallery}
        disabled={loading}
      >
        <View style={styles.galleryIcon}>
          <Text style={styles.galleryEmoji}>＋</Text>
        </View>

        <View style={styles.galleryContent}>
          <Text style={styles.galleryTitle}>
            {loading ? 'Opening gallery...' : 'Choose from Gallery'}
          </Text>

          <Text style={styles.gallerySubtitle}>
            Select up to {MAX_IMAGES - images.length} more photos
          </Text>
        </View>

        <Text style={styles.galleryArrow}>›</Text>
      </Pressable>

      {/* Selected Images */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Selected Photos
        </Text>

        <Text style={styles.photoCount}>
          {images.length} photos
        </Text>
      </View>

      {images.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🖼️</Text>

          <Text style={styles.emptyTitle}>
            No images selected
          </Text>

          <Text style={styles.emptySubtitle}>
            Tap the button above to select photos from your gallery.
          </Text>

          <Pressable
            style={styles.emptyButton}
            onPress={openGallery}
          >
            <Text style={styles.emptyButtonText}>
              Browse Photos
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item, index) =>
            item.uri || String(index)
          }
          renderItem={renderImage}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        />
      )}

      {/* Bottom Continue Button */}
      <View style={styles.bottomContainer}>
        <Pressable
          style={[
            styles.continueButton,
            images.length === 0 && styles.disabledButton,
          ]}
          disabled={images.length === 0}
          onPress={() => onContinue(images)}
        >
          <Text style={styles.continueText}>
            Continue · {images.length} images
          </Text>

          <Text style={styles.continueArrow}>→</Text>
        </Pressable>

        <Text style={styles.bottomNote}>
          Your photos stay on your device.
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    fontSize: 32,
    color: '#17213B',
    lineHeight: 37,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#17213B',
  },

  headerPlaceholder: {
    width: 42,
  },

  infoSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },

  title: {
    fontSize: 25,
    fontWeight: '900',
    color: '#17213B',
  },

  subtitle: {
    fontSize: 13,
    color: '#858DA1',
    lineHeight: 21,
    marginTop: 8,
  },

  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 18,
  },

  counterBadge: {
    backgroundColor: '#E7EDFF',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  counterText: {
    color: '#3563E9',
    fontSize: 12,
    fontWeight: '800',
  },

  clearText: {
    color: '#E14C5A',
    fontSize: 13,
    fontWeight: '700',
  },

  galleryButton: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7EBF5',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  galleryIcon: {
    width: 47,
    height: 47,
    backgroundColor: '#E9F0FF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  galleryEmoji: {
    color: '#3563E9',
    fontSize: 29,
    fontWeight: '500',
  },

  galleryContent: {
    flex: 1,
    marginLeft: 13,
  },

  galleryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#17213B',
  },

  gallerySubtitle: {
    fontSize: 11,
    color: '#9299AA',
    marginTop: 5,
  },

  galleryArrow: {
    color: '#3563E9',
    fontSize: 27,
  },

  sectionHeader: {
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#17213B',
  },

  photoCount: {
    fontSize: 12,
    color: '#9299AA',
  },

  grid: {
    paddingHorizontal: 13,
    paddingBottom: 15,
  },

  imageCard: {
    flex: 1,
    aspectRatio: 1,
    margin: 5,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E5E8F0',
  },

  thumbnail: {
    width: '100%',
    height: '100%',
  },

  numberBadge: {
    position: 'absolute',
    top: 7,
    left: 7,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#3563E9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  numberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeText: {
    fontSize: 20,
    color: '#E14C5A',
    lineHeight: 23,
    fontWeight: '700',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
    paddingBottom: 35,
  },

  emptyEmoji: {
    fontSize: 54,
    marginBottom: 15,
  },

  emptyTitle: {
    color: '#17213B',
    fontSize: 17,
    fontWeight: '800',
  },

  emptySubtitle: {
    color: '#9299AA',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 9,
  },

  emptyButton: {
    backgroundColor: '#E7EDFF',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },

  emptyButtonText: {
    color: '#3563E9',
    fontSize: 13,
    fontWeight: '800',
  },

  bottomContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
  },

  continueButton: {
    height: 54,
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
    fontSize: 14,
    fontWeight: '800',
  },

  continueArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 9,
  },

  bottomNote: {
    color: '#9299AA',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 9,
  },
});

export default ImagePickerScreen;

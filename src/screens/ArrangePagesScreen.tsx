
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  Image,
  Alert,
} from 'react-native';

import type { Asset } from 'react-native-image-picker';

import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist';

interface ArrangePagesScreenProps {
  images: Asset[];
  rotations: Record<string, number>;
  onBack: (images: Asset[], rotations: Record<string, number>) => void;
  onAddMore: () => void;
  onContinue: (images: Asset[], rotations: Record<string, number>) => void;
}

const ArrangePagesScreen: React.FC<ArrangePagesScreenProps> = ({
  images: initialImages,
  rotations: initialRotations,
  onBack,
  onAddMore,
  onContinue,
}) => {
  const [images, setImages] = useState<Asset[]>(initialImages);
  const [rotations, setRotations] =
    useState<Record<string, number>>(initialRotations);

  const rotateImage = (uri?: string) => {
    if (!uri) return;

    setRotations(previous => ({
      ...previous,
      [uri]: ((previous[uri] || 0) + 90) % 360,
    }));
  };

  const removeImage = (uri?: string) => {
    if (!uri) return;

    Alert.alert(
      'Remove Page',
      'Do you want to remove this page from your PDF?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setImages(previous =>
              previous.filter(image => image.uri !== uri),
            );
          },
        },
      ],
    );
  };

  const renderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: {
    item: Asset;
    drag: () => void;
    isActive: boolean;
    getIndex: () => number | undefined;
  }) => {
    const index = getIndex() ?? 0;
    const rotation = item.uri ? rotations[item.uri] || 0 : 0;

    return (
      <ScaleDecorator>
        <View
          style={[
            styles.pageCard,
            isActive && styles.activePageCard,
          ]}
        >
          {/* Thumbnail */}
          <View style={styles.thumbnailContainer}>
            {item.uri ? (
              <Image
                source={{ uri: item.uri }}
                resizeMode="cover"
                style={[
                  styles.thumbnail,
                  {
                    transform: [{ rotate: `${rotation}deg` }],
                  },
                ]}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text>📄</Text>
              </View>
            )}

            <View style={styles.pageBadge}>
              <Text style={styles.pageBadgeText}>
                {index + 1}
              </Text>
            </View>
          </View>

          {/* Page Information */}
          <View style={styles.pageInformation}>
            <Text style={styles.pageTitle}>
              Page {index + 1}
            </Text>

            <Text style={styles.pageFileName} numberOfLines={2}>
              {item.fileName || 'Selected image'}
            </Text>

            <View style={styles.pageActions}>
              <Pressable
                style={styles.actionButton}
                onPress={() => rotateImage(item.uri)}
              >
                <Text style={styles.rotateText}>↻</Text>
                <Text style={styles.actionText}>Rotate</Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => removeImage(item.uri)}
              >
                <Text style={styles.deleteText}>×</Text>
                <Text style={styles.actionText}>Remove</Text>
              </Pressable>
            </View>
          </View>

          {/* Drag Handle */}
          <Pressable
            onLongPress={drag}
            delayLongPress={150}
            style={styles.dragHandle}
          >
            <Text style={styles.dragIcon}>☰</Text>
            <Text style={styles.dragLabel}>Drag</Text>
          </Pressable>
        </View>
      </ScaleDecorator>
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
          onPress={() => onBack(images, rotations)}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Arrange Pages</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      {/* Heading */}
      <View style={styles.headingSection}>
        <Text style={styles.heading}>Organize your PDF</Text>

        <Text style={styles.subtitle}>
          Press and hold the drag handle to change page order.
        </Text>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryNumber}>
              {images.length}
            </Text>
            <Text style={styles.summaryLabel}>Total Pages</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View>
            <Text style={styles.summaryNumber}>A4</Text>
            <Text style={styles.summaryLabel}>Default Size</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View>
            <Text style={styles.summaryNumber}>PDF</Text>
            <Text style={styles.summaryLabel}>Output Format</Text>
          </View>
        </View>
      </View>

      {/* Page List Header */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>PDF Pages</Text>

        <Pressable onPress={onAddMore}>
          <Text style={styles.addMoreText}>+ Add more</Text>
        </Pressable>
      </View>

      {/* Scrollable Page List */}
      <View style={styles.pagesListContainer}>
        {images.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📄</Text>

            <Text style={styles.emptyTitle}>
              No pages available
            </Text>

            <Text style={styles.emptySubtitle}>
              Add some images to continue creating your PDF.
            </Text>

            <Pressable
              style={styles.addButton}
              onPress={onAddMore}
            >
              <Text style={styles.addButtonText}>
                Add Images
              </Text>
            </Pressable>
          </View>
        ) : (
          <DraggableFlatList
            data={images}
            keyExtractor={(item, index) =>
              item.uri || String(index)
            }
            renderItem={renderItem}
            onDragEnd={({ data }) => setImages(data)}
            activationDistance={10}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <Pressable
          style={[
            styles.continueButton,
            images.length === 0 && styles.disabledButton,
          ]}
          disabled={images.length === 0}
          onPress={() => onContinue(images, rotations)}
        >
          <Text style={styles.continueText}>
            Preview PDF · {images.length} Pages
          </Text>

          <Text style={styles.continueArrow}>→</Text>
        </Pressable>

        <Text style={styles.bottomNote}>
          Drag pages to arrange your document.
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
    justifyContent: 'center',
    alignItems: 'center',
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

  headingSection: {
    paddingHorizontal: 20,
    marginTop: 15,
  },

  heading: {
    fontSize: 24,
    fontWeight: '900',
    color: '#17213B',
  },

  subtitle: {
    fontSize: 12,
    color: '#858DA1',
    marginTop: 8,
    lineHeight: 19,
  },

  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 15,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#EDF0F6',
  },

  summaryNumber: {
    color: '#3563E9',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },

  summaryLabel: {
    color: '#9299AA',
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
  },

  summaryDivider: {
    height: 35,
    width: 1,
    backgroundColor: '#EEF0F5',
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 23,
    marginBottom: 12,
  },

  listTitle: {
    color: '#17213B',
    fontSize: 16,
    fontWeight: '800',
  },

  addMoreText: {
    color: '#3563E9',
    fontSize: 12,
    fontWeight: '800',
  },

  // Important: This container gives the list its own screen space.
  pagesListContainer: {
    flex: 1,
    minHeight: 100,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 20,
  },

  pageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#EDF0F6',
  },

  activePageCard: {
    borderColor: '#3563E9',
    backgroundColor: '#F0F4FF',
  },

  thumbnailContainer: {
    width: 78,
    height: 88,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E8F0',
  },

  thumbnail: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pageBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#3563E9',
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  pageBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  pageInformation: {
    flex: 1,
    marginLeft: 12,
  },

  pageTitle: {
    color: '#17213B',
    fontSize: 14,
    fontWeight: '800',
  },

  pageFileName: {
    color: '#9299AA',
    fontSize: 10,
    marginTop: 4,
  },

  pageActions: {
    flexDirection: 'row',
    marginTop: 9,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 13,
  },

  rotateText: {
    color: '#3563E9',
    fontSize: 19,
    fontWeight: '700',
  },

  deleteText: {
    color: '#E14C5A',
    fontSize: 20,
    fontWeight: '700',
  },

  actionText: {
    color: '#737D93',
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '600',
  },

  dragHandle: {
    width: 39,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },

  dragIcon: {
    color: '#8992A5',
    fontSize: 22,
  },

  dragLabel: {
    color: '#9299AA',
    fontSize: 9,
    marginTop: 3,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyEmoji: {
    fontSize: 50,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#17213B',
    marginTop: 15,
  },

  emptySubtitle: {
    fontSize: 12,
    color: '#9299AA',
    textAlign: 'center',
    marginTop: 8,
  },

  addButton: {
    backgroundColor: '#E7EDFF',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 18,
  },

  addButtonText: {
    color: '#3563E9',
    fontWeight: '800',
    fontSize: 13,
  },

  bottomContainer: {
    flexShrink: 0,
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

export default ArrangePagesScreen;

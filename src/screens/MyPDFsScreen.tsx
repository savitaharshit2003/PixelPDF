
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  FlatList,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import RNBlobUtil from 'react-native-blob-util';

interface PDFFile {
  name: string;
  path: string;
  size: number;
  lastModified: number;
}

interface PDFInfo {
  name: string;
  size: string;
  pages: string;
  location: string;
}

interface MyPDFsScreenProps {
  onBack: () => void;
  onOpenPDF: (pdf: PDFFile) => void;
}

type SortOption =
  | 'newest'
  | 'oldest'
  | 'nameAsc'
  | 'nameDesc'
  | 'largest'
  | 'smallest';

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'Name A–Z', value: 'nameAsc' },
  { label: 'Name Z–A', value: 'nameDesc' },
  { label: 'Largest first', value: 'largest' },
  { label: 'Smallest first', value: 'smallest' },
];

const MyPDFsScreen: React.FC<MyPDFsScreenProps> = ({
  onBack,
  onOpenPDF,
}) => {
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search and sort
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Rename
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameTarget, setRenameTarget] = useState<PDFFile | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [renaming, setRenaming] = useState(false);

  // PDF information
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const loadPDFs = useCallback(async () => {
    try {
      const directory = RNBlobUtil.fs.dirs.DocumentDir;
      const files = await RNBlobUtil.fs.ls(directory);

      const pdfFiles: PDFFile[] = [];

      for (const fileName of files) {
        if (!fileName.toLowerCase().endsWith('.pdf')) {
          continue;
        }

        const filePath = `${directory}/${fileName}`;

        try {
          const exists = await RNBlobUtil.fs.exists(filePath);

          if (!exists) {
            continue;
          }

          const stat = await RNBlobUtil.fs.stat(filePath);

          pdfFiles.push({
            name: fileName,
            path: filePath,
            size: Number(stat.size) || 0,
            lastModified: Number(stat.lastModified) || 0,
          });
        } catch (fileError) {
          console.log('Unable to read PDF file:', fileName, fileError);
        }
      }

      setPdfs(pdfFiles);
    } catch (error) {
      console.log('PDF loading error:', error);
      Alert.alert('Error', 'Unable to load your PDF files.');
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await loadPDFs();
      setLoading(false);
    };

    initialize();
  }, [loadPDFs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPDFs();
    setRefreshing(false);
  };

  // Search and sort the PDF list
  const filteredPDFs = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    const result = pdfs.filter(pdf =>
      pdf.name.toLowerCase().includes(search),
    );

    return result.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return b.lastModified - a.lastModified;

        case 'oldest':
          return a.lastModified - b.lastModified;

        case 'nameAsc':
          return a.name.localeCompare(b.name);

        case 'nameDesc':
          return b.name.localeCompare(a.name);

        case 'largest':
          return b.size - a.size;

        case 'smallest':
          return a.size - b.size;

        default:
          return b.lastModified - a.lastModified;
      }
    });
  }, [pdfs, searchText, sortOption]);

  const selectedSortLabel =
    SORT_OPTIONS.find(option => option.value === sortOption)?.label ??
    'Newest first';

  // Open PDF
  const handleOpenPDF = (pdf: PDFFile) => {
    onOpenPDF(pdf);
  };

  // Delete PDF
  const handleDeletePDF = (pdf: PDFFile) => {
    Alert.alert(
      'Delete PDF',
      `Are you sure you want to delete "${pdf.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await RNBlobUtil.fs.unlink(pdf.path);
              await loadPDFs();

              Alert.alert('Deleted', 'PDF deleted successfully.');
            } catch (error) {
              console.log('PDF delete error:', error);
              Alert.alert('Error', 'Unable to delete this PDF.');
            }
          },
        },
      ],
    );
  };

  // Open rename modal
  const openRenameModal = (pdf: PDFFile) => {
    setRenameTarget(pdf);
    setNewFileName(pdf.name.replace(/\.pdf$/i, ''));
    setRenameModalVisible(true);
  };

  // Rename PDF
  const handleRenamePDF = async () => {
    if (!renameTarget) {
      return;
    }

    const trimmedName = newFileName.trim();

    if (!trimmedName) {
      Alert.alert('Invalid Name', 'Please enter a PDF filename.');
      return;
    }

    const cleanName = trimmedName
      .replace(/\.pdf$/i, '')
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
      .trim();

    if (!cleanName) {
      Alert.alert('Invalid Name', 'Please enter a valid filename.');
      return;
    }

    const finalName = `${cleanName}.pdf`;
    const directory = RNBlobUtil.fs.dirs.DocumentDir;
    const newPath = `${directory}/${finalName}`;

    try {
      setRenaming(true);

      if (finalName.toLowerCase() !== renameTarget.name.toLowerCase()) {
        const destinationExists = await RNBlobUtil.fs.exists(newPath);

        if (destinationExists) {
          Alert.alert(
            'Name Already Exists',
            'A PDF with this name already exists. Please choose another name.',
          );
          return;
        }
      }

      await RNBlobUtil.fs.mv(renameTarget.path, newPath);

      setRenameModalVisible(false);
      setRenameTarget(null);
      setNewFileName('');

      await loadPDFs();

      Alert.alert('Success', 'PDF renamed successfully.');
    } catch (error) {
      console.log('PDF rename error:', error);
      Alert.alert('Error', 'Unable to rename this PDF.');
    } finally {
      setRenaming(false);
    }
  };

  // PDF information
  const openPDFInfo = async (pdf: PDFFile) => {
    setInfoModalVisible(true);
    setInfoLoading(true);
    setPdfInfo(null);

    try {
      const stat = await RNBlobUtil.fs.stat(pdf.path);
      const fileSize = Number(stat.size) || 0;

      let pageCount = 'Unavailable';

      try {
        const content = await RNBlobUtil.fs.readFile(pdf.path, 'utf8');
        const matches = content.match(/\/Type\s*\/Page\b/g);

        if (matches && matches.length > 0) {
          pageCount = String(matches.length);
        }
      } catch (pageError) {
        console.log('PDF page count error:', pageError);
      }

      setPdfInfo({
        name: pdf.name,
        size: formatFileSize(fileSize),
        pages: pageCount,
        location: pdf.path,
      });
    } catch (error) {
      console.log('PDF information error:', error);
      Alert.alert('Error', 'Unable to read PDF information.');
      setInfoModalVisible(false);
    } finally {
      setInfoLoading(false);
    }
  };

  const renderPDFItem = ({ item }: { item: PDFFile }) => (
    <View style={styles.pdfCard}>
      <Pressable
        style={styles.pdfMain}
        onPress={() => handleOpenPDF(item)}
      >
        <View style={styles.pdfIcon}>
          <Text style={styles.pdfIconText}>PDF</Text>
        </View>

        <View style={styles.pdfDetails}>
          <Text style={styles.pdfName} numberOfLines={1}>
            {item.name}
          </Text>

          <Text style={styles.pdfSize}>
            {formatFileSize(item.size)}
          </Text>
        </View>

        <Text style={styles.openArrow}>›</Text>
      </Pressable>

      <View style={styles.actionRow}>
        <Pressable
          style={styles.renameButton}
          onPress={() => openRenameModal(item)}
        >
          <Text style={styles.renameButtonText}>✎ Rename</Text>
        </Pressable>

        <Pressable
          style={styles.infoButton}
          onPress={() => openPDFInfo(item)}
        >
          <Text style={styles.infoButtonText}>ⓘ Info</Text>
        </Pressable>

        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDeletePDF(item)}
        >
          <Text style={styles.deleteButtonText}>× Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#101827" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My PDFs</Text>
          <Text style={styles.headerSubtitle}>
            Your saved PDF documents
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{pdfs.length}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search PDFs by name..."
          placeholderTextColor="#8A94A6"
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText('')}>
            <Text style={styles.clearSearch}>×</Text>
          </Pressable>
        )}
      </View>

      {/* Sort and results */}
      <View style={styles.toolbar}>
        <Text style={styles.resultsText}>
          {filteredPDFs.length} PDF
          {filteredPDFs.length === 1 ? '' : 's'} found
        </Text>

        <Pressable
          style={styles.sortButton}
          onPress={() => setSortModalVisible(true)}
        >
          <Text style={styles.sortIcon}>☷</Text>
          <Text style={styles.sortButtonText}>Sort</Text>
          <Text style={styles.sortArrow}>⌄</Text>
        </Pressable>
      </View>

      {/* PDF List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading your PDFs...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPDFs}
          keyExtractor={item => item.path}
          renderItem={renderPDFItem}
          contentContainerStyle={[
            styles.listContent,
            filteredPDFs.length === 0 && styles.emptyListContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6C63FF"
              colors={['#6C63FF']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📄</Text>

              <Text style={styles.emptyTitle}>
                {searchText.trim()
                  ? 'No matching PDFs'
                  : 'No PDFs yet'}
              </Text>

              <Text style={styles.emptySubtitle}>
                {searchText.trim()
                  ? 'Try another filename or clear your search.'
                  : 'Your generated PDFs will appear here.'}
              </Text>

              {searchText.length > 0 && (
                <Pressable
                  style={styles.clearButton}
                  onPress={() => setSearchText('')}
                >
                  <Text style={styles.clearButtonText}>
                    Clear Search
                  </Text>
                </Pressable>
              )}
            </View>
          }
        />
      )}

      {/* Sort Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSortModalVisible(false)}
        >
          <Pressable
            style={styles.sortModal}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort PDFs</Text>

              <Pressable
                onPress={() => setSortModalVisible(false)}
              >
                <Text style={styles.modalClose}>×</Text>
              </Pressable>
            </View>

            {SORT_OPTIONS.map(option => {
              const selected = sortOption === option.value;

              return (
                <Pressable
                  key={option.value}
                  style={[
                    styles.sortOption,
                    selected && styles.selectedSortOption,
                  ]}
                  onPress={() => {
                    setSortOption(option.value);
                    setSortModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      selected && styles.selectedSortOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>

                  {selected && (
                    <Text style={styles.selectedCheck}>✓</Text>
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Rename Modal */}
      <Modal
        visible={renameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.renameModal}>
            <Text style={styles.modalTitle}>Rename PDF</Text>

            <Text style={styles.modalDescription}>
              Enter a new name for your PDF file.
            </Text>

            <TextInput
              style={styles.renameInput}
              value={newFileName}
              onChangeText={setNewFileName}
              placeholder="Enter PDF name"
              placeholderTextColor="#8993A4"
              autoFocus
              selectTextOnFocus
              autoCapitalize="sentences"
            />

            <Text style={styles.extensionText}>.pdf will be added automatically</Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setRenameModalVisible(false)}
                disabled={renaming}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.saveButton}
                onPress={handleRenamePDF}
                disabled={renaming}
              >
                {renaming ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* PDF Information Modal */}
      <Modal
        visible={infoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModal}>
            <View style={styles.infoModalHeader}>
              <View style={styles.infoModalIcon}>
                <Text style={styles.infoModalIconText}>PDF</Text>
              </View>

              <View style={styles.infoTitleContainer}>
                <Text style={styles.modalTitle}>PDF Information</Text>
                <Text style={styles.modalDescription}>
                  Document details
                </Text>
              </View>

              <Pressable onPress={() => setInfoModalVisible(false)}>
                <Text style={styles.modalClose}>×</Text>
              </Pressable>
            </View>

            {infoLoading ? (
              <View style={styles.infoLoading}>
                <ActivityIndicator size="large" color="#6C63FF" />
                <Text style={styles.infoLoadingText}>
                  Reading PDF information...
                </Text>
              </View>
            ) : pdfInfo ? (
              <ScrollView
                style={styles.infoDetails}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>File name</Text>
                  <Text style={styles.infoValue}>{pdfInfo.name}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>File size</Text>
                  <Text style={styles.infoValue}>{pdfInfo.size}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Pages</Text>
                  <Text style={styles.infoValue}>{pdfInfo.pages}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>File type</Text>
                  <Text style={styles.infoValue}>PDF Document</Text>
                </View>

                <View style={styles.infoLocation}>
                  <Text style={styles.infoLabel}>File location</Text>
                  <Text style={styles.locationValue}>
                    {pdfInfo.location}
                  </Text>
                </View>
              </ScrollView>
            ) : null}

            <Pressable
              style={styles.infoCloseButton}
              onPress={() => setInfoModalVisible(false)}
            >
              <Text style={styles.infoCloseButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101827',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#202B3D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 36,
    marginTop: -4,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#9BA7B9',
    fontSize: 12,
    marginTop: 3,
  },

  countBadge: {
    minWidth: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#292B55',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  countText: {
    color: '#A8A4FF',
    fontSize: 15,
    fontWeight: '800',
  },

  searchContainer: {
    height: 52,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: '#202B3D',
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchIcon: {
    color: '#A8A4FF',
    fontSize: 27,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 0,
  },

  clearSearch: {
    color: '#B8C1D0',
    fontSize: 25,
    paddingHorizontal: 5,
  },

  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },

  resultsText: {
    color: '#9BA7B9',
    fontSize: 13,
    fontWeight: '600',
  },

  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#292B55',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 11,
  },

  sortIcon: {
    color: '#B4B0FF',
    fontSize: 17,
    marginRight: 7,
  },

  sortButtonText: {
    color: '#D5D3FF',
    fontSize: 12,
    fontWeight: '700',
  },

  sortArrow: {
    color: '#D5D3FF',
    fontSize: 16,
    marginLeft: 8,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  pdfCard: {
    backgroundColor: '#1B2637',
    borderRadius: 17,
    padding: 15,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#2A374B',
  },

  pdfMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pdfIcon: {
    width: 49,
    height: 55,
    borderRadius: 12,
    backgroundColor: '#3A2635',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  pdfIconText: {
    color: '#FF777F',
    fontSize: 13,
    fontWeight: '900',
  },

  pdfDetails: {
    flex: 1,
  },

  pdfName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  pdfSize: {
    color: '#929FB2',
    fontSize: 12,
    marginTop: 6,
  },

  openArrow: {
    color: '#A8A4FF',
    fontSize: 28,
    paddingLeft: 8,
  },

  actionRow: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2B3749',
    justifyContent: 'space-between',
  },

  renameButton: {
    flex: 1,
    backgroundColor: '#252F48',
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
    marginRight: 6,
  },

  renameButtonText: {
    color: '#B7B3FF',
    fontSize: 11,
    fontWeight: '700',
  },

  infoButton: {
    flex: 1,
    backgroundColor: '#203A43',
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
    marginHorizontal: 3,
  },

  infoButtonText: {
    color: '#79D8D0',
    fontSize: 11,
    fontWeight: '700',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#422833',
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
    marginLeft: 6,
  },

  deleteButtonText: {
    color: '#FF8990',
    fontSize: 11,
    fontWeight: '700',
  },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#AAB4C4',
    marginTop: 14,
    fontSize: 13,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 55,
    marginBottom: 18,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  emptySubtitle: {
    color: '#929FB2',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 9,
  },

  clearButton: {
    backgroundColor: '#625CF0',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 20,
  },

  clearButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },

  sortModal: {
    width: '100%',
    backgroundColor: '#1B2637',
    borderRadius: 20,
    padding: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  modalTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  modalClose: {
    color: '#AAB4C4',
    fontSize: 29,
    paddingHorizontal: 5,
  },

  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 13,
    borderRadius: 11,
    marginTop: 5,
  },

  selectedSortOption: {
    backgroundColor: '#292B55',
  },

  sortOptionText: {
    color: '#C1CAD7',
    fontSize: 14,
    fontWeight: '600',
  },

  selectedSortOptionText: {
    color: '#B8B4FF',
  },

  selectedCheck: {
    color: '#A8A4FF',
    fontSize: 17,
    fontWeight: '800',
  },

  renameModal: {
    width: '100%',
    backgroundColor: '#1B2637',
    borderRadius: 20,
    padding: 22,
  },

  modalDescription: {
    color: '#9BA7B9',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 19,
  },

  renameInput: {
    height: 50,
    backgroundColor: '#101827',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#39465C',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 14,
    marginTop: 20,
  },

  extensionText: {
    color: '#8995A8',
    fontSize: 11,
    marginTop: 8,
  },

  modalActions: {
    flexDirection: 'row',
    marginTop: 23,
  },

  cancelButton: {
    flex: 1,
    height: 47,
    backgroundColor: '#303B4D',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  cancelButtonText: {
    color: '#D4DCE7',
    fontSize: 13,
    fontWeight: '700',
  },

  saveButton: {
    flex: 1,
    height: 47,
    backgroundColor: '#625CF0',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  infoModal: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#1B2637',
    borderRadius: 20,
    padding: 20,
  },

  infoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  infoModalIcon: {
    width: 48,
    height: 52,
    backgroundColor: '#3A2635',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoModalIconText: {
    color: '#FF777F',
    fontSize: 13,
    fontWeight: '900',
  },

  infoTitleContainer: {
    flex: 1,
  },

  infoDetails: {
    maxHeight: 360,
  },

  infoRow: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#2B3749',
  },

  infoLabel: {
    color: '#8F9CB0',
    fontSize: 12,
    marginBottom: 6,
  },

  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  infoLocation: {
    paddingVertical: 14,
  },

  locationValue: {
    color: '#B7B3FF',
    fontSize: 11,
    lineHeight: 18,
  },

  infoLoading: {
    paddingVertical: 35,
    alignItems: 'center',
  },

  infoLoadingText: {
    color: '#AAB4C4',
    marginTop: 13,
    fontSize: 13,
  },

  infoCloseButton: {
    height: 47,
    backgroundColor: '#625CF0',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  infoCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default MyPDFsScreen;

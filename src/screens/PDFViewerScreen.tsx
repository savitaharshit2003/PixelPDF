
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';

import Pdf from 'react-native-pdf';
import Share from 'react-native-share';
import RNBlobUtil from 'react-native-blob-util';

interface PDFViewerScreenProps {
  fileName: string;
  filePath: string;
  onBack: () => void;
}

const PDFViewerScreen: React.FC<PDFViewerScreenProps> = ({
  fileName,
  filePath,
  onBack,
}) => {
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const source = {
    uri: `file://${filePath}`,
    cache: false,
  };
  
 
const handleSharePDF = async () => {
  try {
    // Remove file:// if it is already present.
    const originalPath = filePath.replace(/^file:\/\//, '');

    // Verify that the original PDF exists.
    const fileExists = await RNBlobUtil.fs.exists(originalPath);

    if (!fileExists) {
      Alert.alert('File Not Found', 'This PDF is no longer available.');
      return;
    }

    // Copy the PDF into the app cache directory.
    const cacheDirectory = RNBlobUtil.fs.dirs.CacheDir;
    const cachePath = `${cacheDirectory}/${fileName}`;

    // Avoid copying a file onto itself.
    if (originalPath !== cachePath) {
      await RNBlobUtil.fs.cp(originalPath, cachePath);
    }

    // Verify the copied PDF.
    const cachedFileExists = await RNBlobUtil.fs.exists(cachePath);

    if (!cachedFileExists) {
      throw new Error('Unable to prepare the PDF for sharing.');
    }

    const shareUri = `file://${cachePath}`;

    console.log('Original PDF:', originalPath);
    console.log('Sharing PDF:', shareUri);

    await Share.open({
      title: 'Share PDF',
      subject: fileName,
      message: `Sharing ${fileName}`,
      url: shareUri,
      type: 'application/pdf',
      filename: fileName,
      useInternalStorage: true,
      failOnCancel: false,
    });

  } catch (error) {
    console.error('PDF sharing error:', error);

    Alert.alert(
      'Sharing Failed',
      error instanceof Error
        ? error.message
        : 'Unable to share this PDF. Please try again.',
    );
  }
};




  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#F7F8FC"
        barStyle="dark-content"
      />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {fileName}
          </Text>
          <Text style={styles.subtitle}>
            {totalPages > 0
              ? `Page ${currentPage} of ${totalPages}`
              : 'PDF Document'}
          </Text>
        </View>

        <Pressable
  style={styles.shareButton}
  onPress={handleSharePDF}
>
  <Text style={styles.shareIcon}>↗</Text>
</Pressable>
      </View>

      <View style={styles.viewerContainer}>
        {!error && (
          <Pdf
            source={source}
            style={styles.pdf}
            horizontal={false}
            enablePaging={false}
            spacing={8}
            onLoadComplete={(numberOfPages) => {
              setTotalPages(numberOfPages);
              setLoading(false);
            }}
            onPageChanged={(page) => {
              setCurrentPage(page);
            }}
            onError={(pdfError) => {
              console.log('PDF viewer error:', pdfError);
              setLoading(false);
              setError(true);
            }}
          />
        )}

        {loading && !error && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3563E9" />
            <Text style={styles.loadingText}>
              Loading your PDF...
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>📄</Text>
            <Text style={styles.errorTitle}>
              Unable to open PDF
            </Text>
            <Text style={styles.errorDescription}>
              This document may be damaged or unavailable.
            </Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => {
                setError(false);
                setLoading(true);
              }}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        )}
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
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#F7F8FC',
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
    lineHeight: 37,
    color: '#17213B',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 13,
  },
  title: {
    color: '#17213B',
    fontSize: 13,
    fontWeight: '800',
  },
  subtitle: {
    color: '#9299AA',
    fontSize: 11,
    marginTop: 4,
  },
  pdfBadge: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 9,
  },
  pdfBadgeText: {
    color: '#E14C5A',
    fontSize: 11,
    fontWeight: '900',
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: '#E8EBF2',
  },
  pdf: {
    flex: 1,
    width: '100%',
    backgroundColor: '#E8EBF2',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#68738A',
    fontSize: 13,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorTitle: {
    color: '#17213B',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 15,
  },
  errorDescription: {
    color: '#9299AA',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#3563E9',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  shareButton: {
  width: 42,
  height: 42,
  borderRadius: 14,
  backgroundColor: '#EAF0FF',
  alignItems: 'center',
  justifyContent: 'center',
},

shareIcon: {
  color: '#3563E9',
  fontSize: 25,
  fontWeight: '800',
},
});

export default PDFViewerScreen;

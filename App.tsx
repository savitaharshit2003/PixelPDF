
import React, { useState } from 'react';

import {
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import type { Asset } from 'react-native-image-picker';

import HomeScreen from './src/screens/HomeScreen';
import ImagePickerScreen from './src/screens/ImagePickerScreen';
import ImageEditorScreen from './src/screens/ImageEditorScreen';
import ArrangePagesScreen from './src/screens/ArrangePagesScreen';
import PDFPreviewScreen, {
  PDFSettings,
} from './src/screens/PDFPreviewScreen';
import MyPDFsScreen from './src/screens/MyPDFsScreen';
import PDFViewerScreen from './src/screens/PDFViewerScreen';

import { generatePDF } from './src/utils/pdfGenerator';

type Screen =
  | 'home'
  | 'picker'
  | 'editor'
  | 'arrange'
  | 'preview'
  | 'mypdfs'
  | 'pdfviewer'
  | 'generating'
  | 'success';

const GeneratingScreen = ({
  progress,
  message,
}: {
  progress: number;
  message: string;
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.centerContent}>
        <View style={styles.iconCircle}>
          <Text style={styles.documentIcon}>📄</Text>
        </View>

        <Text style={styles.screenTitle}>Creating your PDF</Text>

        <Text style={styles.subtitle}>
          Please wait while PixelPDF prepares your document.
        </Text>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Generation progress</Text>
            <Text style={styles.progressPercentage}>{progress}%</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(0, Math.min(progress, 100))}%` },
              ]}
            />
          </View>

          <View style={styles.messageRow}>
            <ActivityIndicator size="small" color="#635BFF" />
            <Text style={styles.progressMessage}>{message}</Text>
          </View>
        </View>

        <View style={styles.tipContainer}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            Keep PixelPDF open until your document is ready.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const PDFSuccessScreen = ({
  fileName,
  pageCount,
  onOpenPDF,
  onViewPDFs,
  onCreateAnother,
}: {
  fileName: string;
  pageCount: number;
  onOpenPDF: () => void;
  onViewPDFs: () => void;
  onCreateAnother: () => void;
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.centerContent}>
        <View style={styles.successCircle}>
          <Text style={styles.successIcon}>✓</Text>
        </View>

        <Text style={styles.screenTitle}>PDF Created!</Text>

        <Text style={styles.subtitle}>
          Your document has been successfully generated and saved.
        </Text>

        <View style={styles.fileCard}>
          <View style={styles.fileIconContainer}>
            <Text style={styles.fileIcon}>📕</Text>
          </View>

          <View style={styles.fileDetails}>
            <Text style={styles.fileName} numberOfLines={2}>
              {fileName}
            </Text>

            <Text style={styles.filePages}>
              {pageCount} {pageCount === 1 ? 'page' : 'pages'} · PDF document
            </Text>
          </View>

          <Text style={styles.checkMark}>✓</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onOpenPDF}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Open PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onViewPDFs}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>View My PDFs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createAnotherButton}
          onPress={onCreateAnother}
          activeOpacity={0.85}
        >
          <Text style={styles.createAnotherText}>＋ Create Another PDF</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const [pickerReturnTo, setPickerReturnTo] = useState<'home' | 'arrange'>(
    'home',
  );

  const [selectedImages, setSelectedImages] = useState<Asset[]>([]);

  const [imageRotations, setImageRotations] = useState<Record<string, number>>(
    {},
  );

  const [selectedPDF, setSelectedPDF] = useState<{
    name: string;
    path: string;
  } | null>(null);

  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationMessage, setGenerationMessage] = useState(
    'Preparing your document...',
  );

  const handleImageSelection = (images: Asset[]) => {
    setSelectedImages(images);
    setCurrentScreen('editor');
  };

  const handleEditorBack = (
    images: Asset[],
    rotations: Record<string, number>,
  ) => {
    setSelectedImages(images);
    setImageRotations(rotations);
    setPickerReturnTo('home');
    setCurrentScreen('picker');
  };

  const handleEditorContinue = (
    images: Asset[],
    rotations: Record<string, number>,
  ) => {
    setSelectedImages(images);
    setImageRotations(rotations);
    setCurrentScreen('arrange');
  };

  const handleArrangeBack = (
    images: Asset[],
    rotations: Record<string, number>,
  ) => {
    setSelectedImages(images);
    setImageRotations(rotations);
    setCurrentScreen('editor');
  };

  const handleAddMore = () => {
    setPickerReturnTo('arrange');
    setCurrentScreen('picker');
  };

  const handleArrangeContinue = (
    images: Asset[],
    rotations: Record<string, number>,
  ) => {
    setSelectedImages(images);
    setImageRotations(rotations);
    setCurrentScreen('preview');
  };

  const handleCreatePDF = async (settings: PDFSettings) => {
    try {
      if (selectedImages.length === 0) {
        Alert.alert('No images', 'Please select images first.');
        return;
      }

      setGenerationProgress(0);
      setGenerationMessage('Preparing your document...');
      setCurrentScreen('generating');

      const pdfPath = await generatePDF(
        selectedImages,
        imageRotations,
        settings,
        (progress, message) => {
          setGenerationProgress(progress);
          setGenerationMessage(message);
        },
      );

      const fileName = pdfPath.split('/').pop() || 'PixelPDF.pdf';

      setSelectedPDF({
        name: fileName,
        path: pdfPath,
      });

      setCurrentScreen('success');

      console.log('Generated PDF:', pdfPath);
    } catch (error) {
      console.error('PDF generation error:', error);

      setCurrentScreen('preview');

      Alert.alert(
        'PDF Generation Failed',
        error instanceof Error
          ? error.message
          : 'Something went wrong while creating your PDF.',
      );
    }
  };

  const handleCreateAnother = () => {
    setSelectedImages([]);
    setImageRotations({});
    setSelectedPDF(null);
    setCurrentScreen('home');
  };

  const renderScreen = () => {
    if (currentScreen === 'generating') {
      return (
        <GeneratingScreen
          progress={generationProgress}
          message={generationMessage}
        />
      );
    }

    if (currentScreen === 'success' && selectedPDF) {
      return (
        <PDFSuccessScreen
          fileName={selectedPDF.name}
          pageCount={selectedImages.length}
          onOpenPDF={() => setCurrentScreen('pdfviewer')}
          onViewPDFs={() => setCurrentScreen('mypdfs')}
          onCreateAnother={handleCreateAnother}
        />
      );
    }

    if (currentScreen === 'pdfviewer' && selectedPDF) {
      return (
        <PDFViewerScreen
          fileName={selectedPDF.name}
          filePath={selectedPDF.path}
          onBack={() => setCurrentScreen('mypdfs')}
        />
      );
    }

    if (currentScreen === 'mypdfs') {
      return (
        <MyPDFsScreen
          onBack={() => setCurrentScreen('home')}
          onOpenPDF={pdf => {
            setSelectedPDF(pdf);
            setCurrentScreen('pdfviewer');
          }}
        />
      );
    }

    if (currentScreen === 'picker') {
      return (
        <ImagePickerScreen
          initialImages={selectedImages}
          onBack={() => setCurrentScreen(pickerReturnTo)}
          onContinue={handleImageSelection}
        />
      );
    }

    if (currentScreen === 'preview') {
      return (
        <PDFPreviewScreen
          images={selectedImages}
          rotations={imageRotations}
          onBack={() => setCurrentScreen('arrange')}
          onCreatePDF={handleCreatePDF}
        />
      );
    }

    if (currentScreen === 'editor') {
      return (
        <ImageEditorScreen
          images={selectedImages}
          initialRotations={imageRotations}
          onBack={handleEditorBack}
          onContinue={handleEditorContinue}
        />
      );
    }

    if (currentScreen === 'arrange') {
      return (
        <ArrangePagesScreen
          images={selectedImages}
          rotations={imageRotations}
          onBack={handleArrangeBack}
          onAddMore={handleAddMore}
          onContinue={handleArrangeContinue}
        />
      );
    }

    return (
      <HomeScreen
        onSelectImages={() => {
          setPickerReturnTo('home');
          setCurrentScreen('picker');
        }}
        onOpenPDFs={() => setCurrentScreen('mypdfs')}
      />
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {renderScreen()}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#EDEBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  documentIcon: {
    fontSize: 43,
  },
  screenTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#172033',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#7B8496',
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 30,
  },
  progressCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9ECF2',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344054',
  },
  progressPercentage: {
    fontSize: 17,
    fontWeight: '800',
    color: '#635BFF',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#ECEBFA',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#635BFF',
    borderRadius: 10,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  progressMessage: {
    fontSize: 13,
    color: '#667085',
    marginLeft: 10,
    flex: 1,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    paddingHorizontal: 10,
  },
  tipIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  tipText: {
    color: '#7B8496',
    fontSize: 12,
    flex: 1,
  },
  successCircle: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  successIcon: {
    fontSize: 55,
    fontWeight: '800',
    color: '#16A34A',
  },
  fileCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E9ECF2',
    padding: 15,
    marginBottom: 25,
  },
  fileIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIcon: {
    fontSize: 25,
  },
  fileDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  fileName: {
    color: '#172033',
    fontSize: 14,
    fontWeight: '700',
  },
  filePages: {
    color: '#8791A2',
    fontSize: 12,
    marginTop: 5,
  },
  checkMark: {
    fontSize: 21,
    color: '#16A34A',
    fontWeight: '800',
  },
  primaryButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#635BFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D9DCE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#344054',
    fontSize: 15,
    fontWeight: '700',
  },
  createAnotherButton: {
    padding: 12,
    marginTop: 3,
  },
  createAnotherText: {
    color: '#635BFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default App;

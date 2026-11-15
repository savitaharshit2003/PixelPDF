
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

interface PDFGenerationScreenProps {
  status: 'generating' | 'success';
  progress: number;
  message: string;
  fileName?: string;
  pageCount: number;
  onOpenPDF: () => void;
  onMyPDFs: () => void;
  onCreateAnother: () => void;
}

const PDFGenerationScreen: React.FC<PDFGenerationScreenProps> = ({
  status,
  progress,
  message,
  fileName,
  pageCount,
  onOpenPDF,
  onMyPDFs,
  onCreateAnother,
}) => {
  const isSuccess = status === 'success';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FC" />

      <View style={styles.content}>
        {isSuccess ? (
          <>
            <View style={styles.successIcon}>
              <Text style={styles.checkmark}>✓</Text>
            </View>

            <Text style={styles.title}>PDF Created!</Text>
            <Text style={styles.subtitle}>
              Your document is ready. All your selected images have been
              converted successfully.
            </Text>

            <View style={styles.fileCard}>
              <View style={styles.fileIcon}>
                <Text style={styles.pdfIcon}>PDF</Text>
              </View>

              <View style={styles.fileDetails}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {fileName || 'Your PDF'}
                </Text>
                <Text style={styles.fileInfo}>
                  {pageCount} {pageCount === 1 ? 'page' : 'pages'} · PDF document
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onOpenPDF}
              activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Open PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onMyPDFs}
              activeOpacity={0.85}>
              <Text style={styles.secondaryButtonText}>Go to My PDFs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.textButton}
              onPress={onCreateAnother}>
              <Text style={styles.textButtonText}>Create Another PDF</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.loadingIcon}>
              <Text style={styles.loadingIconText}>PDF</Text>
            </View>

            <Text style={styles.title}>Creating Your PDF</Text>
            <Text style={styles.subtitle}>
              Please wait while PixelPDF prepares your document.
            </Text>

            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{message}</Text>
                <Text style={styles.percentage}>{progress}%</Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, Math.max(0, progress))}%` },
                  ]}
                />
              </View>

              <Text style={styles.waitText}>
                Please keep the app open until the process finishes.
              </Text>
            </View>
          </>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    alignItems: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  checkmark: {
    color: '#16A34A',
    fontSize: 55,
    fontWeight: '700',
  },
  loadingIcon: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  loadingIconText: {
    color: '#6D4AFF',
    fontSize: 27,
    fontWeight: '900',
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#172033',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#788196',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  progressCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressLabel: {
    color: '#46516A',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  percentage: {
    color: '#6D4AFF',
    fontSize: 16,
    fontWeight: '800',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#ECEEF4',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6D4AFF',
    borderRadius: 10,
  },
  waitText: {
    fontSize: 12,
    color: '#929BAD',
    marginTop: 16,
    lineHeight: 19,
  },
  fileCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 25,
  },
  fileIcon: {
    width: 52,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  pdfIcon: {
    color: '#DC2626',
    fontWeight: '900',
    fontSize: 15,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    color: '#172033',
    fontSize: 14,
    fontWeight: '700',
  },
  fileInfo: {
    color: '#929BAD',
    fontSize: 12,
    marginTop: 6,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#6D4AFF',
    paddingVertical: 17,
    borderRadius: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 17,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 13,
    borderWidth: 1,
    borderColor: '#E6E8EF',
  },
  secondaryButtonText: {
    color: '#343D52',
    fontSize: 15,
    fontWeight: '700',
  },
  textButton: {
    padding: 18,
    marginTop: 5,
  },
  textButtonText: {
    color: '#6D4AFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default PDFGenerationScreen;

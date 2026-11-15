
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import type { Asset } from 'react-native-image-picker';

export type PDFSettings = {
  pageSize: 'A4' | 'A3' | 'Letter';
  orientation: 'Portrait' | 'Landscape';
  imageFit: 'contain' | 'cover';
  margin: number;
};

interface PDFPreviewScreenProps {
  images: Asset[];
  rotations: Record<string, number>;
  onBack: () => void;
  onCreatePDF: (settings: PDFSettings) => void;
}

const PDFPreviewScreen: React.FC<PDFPreviewScreenProps> = ({
  images,
  rotations,
  onBack,
  onCreatePDF,
}) => {
  const [pageSize, setPageSize] = useState<PDFSettings['pageSize']>('A4');
  const [orientation, setOrientation] =
    useState<PDFSettings['orientation']>('Portrait');
  const [imageFit, setImageFit] =
    useState<PDFSettings['imageFit']>('contain');
  const [margin, setMargin] = useState(20);

  const Option = ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.option, selected && styles.selectedOption]}
    >
      <Text style={[styles.optionText, selected && styles.selectedText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>PDF Preview</Text>
          <Text style={styles.headerSubtitle}>
            Customize your document
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <View>
            <Text style={styles.summaryLabel}>YOUR DOCUMENT</Text>
            <Text style={styles.summaryTitle}>Ready to export</Text>
          </View>
          <View style={styles.pageCount}>
            <Text style={styles.pageCountNumber}>{images.length}</Text>
            <Text style={styles.pageCountLabel}>PAGES</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Page preview</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.previewList}
        >
          {images.map((item, index) => (
            <View key={item.uri || String(index)} style={styles.previewItem}>
              <View
                style={[
                  styles.paper,
                  orientation === 'Landscape' && styles.landscapePaper,
                  { padding: margin / 2 },
                ]}
              >
                {item.uri ? (
                  <Image
                    source={{ uri: item.uri }}
                    style={[
                      styles.previewImage,
                      { resizeMode: imageFit },
                      {
                        transform: [
                          { rotate: `${rotations[item.uri] || 0}deg` },
                        ],
                      },
                    ]}
                  />
                ) : null}
              </View>
              <Text style={styles.pageLabel}>Page {index + 1}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Page size</Text>
        <View style={styles.optionRow}>
          {(['A4', 'A3', 'Letter'] as const).map(size => (
            <Option
              key={size}
              label={size}
              selected={pageSize === size}
              onPress={() => setPageSize(size)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Orientation</Text>
        <View style={styles.optionRow}>
          {(['Portrait', 'Landscape'] as const).map(value => (
            <Option
              key={value}
              label={value}
              selected={orientation === value}
              onPress={() => setOrientation(value)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Image fitting</Text>
        <View style={styles.optionRow}>
          <Option
            label="Fit to page"
            selected={imageFit === 'contain'}
            onPress={() => setImageFit('contain')}
          />
          <Option
            label="Fill page"
            selected={imageFit === 'cover'}
            onPress={() => setImageFit('cover')}
          />
        </View>

        <Text style={styles.sectionTitle}>Page margins</Text>
        <View style={styles.optionRow}>
          {[0, 20, 40].map(value => (
            <Option
              key={value}
              label={value === 0 ? 'None' : value === 20 ? 'Normal' : 'Wide'}
              selected={margin === value}
              onPress={() => setMargin(value)}
            />
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Document summary</Text>
          <Text style={styles.infoText}>Total pages: {images.length}</Text>
          <Text style={styles.infoText}>Paper: {pageSize}</Text>
          <Text style={styles.infoText}>Orientation: {orientation}</Text>
          <Text style={styles.infoText}>
            Margins: {margin === 0 ? 'None' : margin === 20 ? 'Normal' : 'Wide'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() =>
            onCreatePDF({
              pageSize,
              orientation,
              imageFit,
              margin,
            })
          }
          activeOpacity={0.85}
        >
          <Text style={styles.createButtonText}>Continue to Create PDF →</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EEF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  backText: { fontSize: 32, color: '#5146E5', lineHeight: 36 },
  headerTitle: { fontSize: 19, fontWeight: '800', color: '#17182B' },
  headerSubtitle: { fontSize: 12, color: '#85879A', marginTop: 3 },
  summary: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#5146E5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#DCD9FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 7,
  },
  pageCount: {
    width: 62,
    height: 62,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageCountNumber: { color: '#5146E5', fontSize: 23, fontWeight: '900' },
  pageCountLabel: {
    color: '#77728F',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#22243A',
    marginHorizontal: 20,
    marginTop: 23,
    marginBottom: 12,
  },
  previewList: { paddingHorizontal: 20, gap: 13 },
  previewItem: { alignItems: 'center' },
  paper: {
    width: 125,
    height: 165,
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
    padding: 10,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  landscapePaper: {
    width: 165,
    height: 125,
  },
  previewImage: { width: '100%', height: '100%' },
  pageLabel: {
    fontSize: 11,
    color: '#77798C',
    fontWeight: '700',
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 9,
  },
  option: {
    paddingHorizontal: 17,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E9F1',
  },
  selectedOption: {
    backgroundColor: '#EFEDFF',
    borderColor: '#5146E5',
  },
  optionText: { color: '#65677B', fontSize: 12, fontWeight: '700' },
  selectedText: { color: '#5146E5' },
  infoBox: {
    margin: 20,
    marginTop: 25,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEEF5',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#22243A',
    marginBottom: 10,
  },
  infoText: { fontSize: 12, color: '#77798C', marginTop: 6 },
  createButton: {
    marginHorizontal: 20,
    backgroundColor: '#5146E5',
    borderRadius: 15,
    paddingVertical: 17,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default PDFPreviewScreen;

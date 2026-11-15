
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Pressable,
  Alert,
  useWindowDimensions,
} from 'react-native';

interface HomeScreenProps {
  onSelectImages: () => void;
  onOpenPDFs: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectImages,
  onOpenPDFs,
}) => {
  const { width } = useWindowDimensions();

  const horizontalPadding = width < 360 ? 16 : 22;

  const showComingSoon = (feature: string) => {
    Alert.alert(
      feature,
      'This feature is coming soon. Stay tuned for future PixelPDF updates!',
    );
  };

  const tools = [
    {
      title: 'Compress PDF',
      description: 'Reduce file size',
      emoji: '📦',
      color: '#EAF0FF',
      onPress: () => showComingSoon('Compress PDF'),
    },
    {
      title: 'PDF to Image',
      description: 'Extract PDF pages',
      emoji: '🖼️',
      color: '#FFF0E5',
      onPress: () => showComingSoon('PDF to Image'),
    },
    {
      title: 'Merge PDF',
      description: 'Combine documents',
      emoji: '📑',
      color: '#F0EAFE',
      onPress: () => showComingSoon('Merge PDF'),
    },
    {
      title: 'Recent Files',
      description: 'Browse your PDFs',
      emoji: '🕘',
      color: '#E5F7EF',
      onPress: onOpenPDFs,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#F6F8FD"
        barStyle="dark-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>P</Text>
            </View>

            <View>
              <Text style={styles.brandName}>PixelPDF</Text>
              <Text style={styles.brandTagline}>
                DOCUMENTS MADE SIMPLE
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.profileButton,
              pressed && styles.pressed,
            ]}
            onPress={() => showComingSoon('Profile')}
          >
            <Text style={styles.profileText}>H</Text>
          </Pressable>
        </View>

        {/* WELCOME SECTION */}
        <View style={styles.welcomeSection}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Hello, Harshit</Text>
            <Text style={styles.wave}> 👋</Text>
          </View>

          <Text style={styles.welcomeTitle}>
            What would you like{'\n'}
            <Text style={styles.highlightText}>to create today?</Text>
          </Text>

          <Text style={styles.welcomeDescription}>
            Your all-in-one PDF companion. Convert, organize
            and manage your documents with ease.
          </Text>
        </View>

        {/* MAIN CONVERSION CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroDecoration} />

          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Text style={styles.heroIconText}>▧</Text>
            </View>

            <View style={styles.offlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.offlineText}>OFFLINE READY</Text>
            </View>
          </View>

          <Text style={styles.heroEyebrow}>
            MOST POPULAR TOOL
          </Text>

          <Text style={styles.heroTitle}>
            Images to PDF
          </Text>

          <Text style={styles.heroDescription}>
            Transform your favorite photos into a professional
            PDF document in just a few taps.
          </Text>

          <View style={styles.heroFeatures}>
            <View style={styles.featureItem}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>Multiple images</Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>Up to 100 images</Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>Custom PDF settings</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={onSelectImages}
          >
            <Text style={styles.primaryButtonText}>
              Create PDF
            </Text>

            <View style={styles.buttonArrowContainer}>
              <Text style={styles.buttonArrow}>→</Text>
            </View>
          </Pressable>

          <Text style={styles.heroFooter}>
            Fast  •  Secure  •  No internet required
          </Text>
        </View>

        {/* QUICK TOOLS */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Quick Tools</Text>
            <Text style={styles.sectionDescription}>
              Everything you need in one place
            </Text>
          </View>

          <View style={styles.toolsCount}>
            <Text style={styles.toolsCountText}>04 TOOLS</Text>
          </View>
        </View>

        <View style={styles.toolsGrid}>
          {tools.map((tool, index) => (
            <Pressable
              key={tool.title}
              style={({ pressed }) => [
                styles.toolCard,
                pressed && styles.toolCardPressed,
              ]}
              onPress={tool.onPress}
            >
              <View
                style={[
                  styles.toolIcon,
                  { backgroundColor: tool.color },
                ]}
              >
                <Text style={styles.toolEmoji}>
                  {tool.emoji}
                </Text>
              </View>

              <View style={styles.toolTextContainer}>
                <Text style={styles.toolTitle}>
                  {tool.title}
                </Text>

                <Text style={styles.toolDescription}>
                  {tool.description}
                </Text>
              </View>

              <Text style={styles.toolArrow}>↗</Text>
            </Pressable>
          ))}
        </View>

        {/* RECENT DOCUMENTS */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Recent Documents
            </Text>

            <Text style={styles.sectionDescription}>
              Access your saved PDF files
            </Text>
          </View>

          <Pressable
            onPress={onOpenPDFs}
            style={({ pressed }) => [
              styles.viewAllButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.viewAll}>View all →</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.emptyCard,
            pressed && styles.emptyCardPressed,
          ]}
          onPress={onOpenPDFs}
        >
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📄</Text>
          </View>

          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyTitle}>
              Open your PDF library
            </Text>

            <Text style={styles.emptyDescription}>
              View, search, rename, share and manage your
              saved documents.
            </Text>
          </View>

          <Text style={styles.emptyArrow}>›</Text>
        </Pressable>

        {/* BOTTOM INFO */}
        <View style={styles.bottomInfo}>
          <View style={styles.bottomDivider} />

          <View style={styles.footerLogo}>
            <View style={styles.footerLogoIcon}>
              <Text style={styles.footerLogoText}>P</Text>
            </View>

            <Text style={styles.footerBrand}>
              PixelPDF
            </Text>
          </View>

          <Text style={styles.footerText}>
            Made with ♥ for simpler documents
          </Text>

          <Text style={styles.versionText}>
            VERSION 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FD',
  },

  scrollContent: {
    paddingTop: 12,
    paddingBottom: 35,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#3563E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
    elevation: 4,
    shadowColor: '#3563E9',
    shadowOpacity: 0.22,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
  },

  brandName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#17213B',
    letterSpacing: -0.5,
  },

  brandTagline: {
    fontSize: 8,
    letterSpacing: 1.2,
    color: '#929BAE',
    fontWeight: '800',
    marginTop: 4,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#E8EDFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE4FF',
  },

  profileText: {
    fontSize: 18,
    color: '#3563E9',
    fontWeight: '900',
  },

  // WELCOME
  welcomeSection: {
    marginBottom: 23,
  },

  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  greeting: {
    fontSize: 14,
    color: '#3563E9',
    fontWeight: '800',
  },

  wave: {
    fontSize: 15,
  },

  welcomeTitle: {
    fontSize: 30,
    lineHeight: 39,
    color: '#17213B',
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  highlightText: {
    color: '#3563E9',
  },

  welcomeDescription: {
    fontSize: 13,
    color: '#858FA3',
    marginTop: 10,
    lineHeight: 21,
  },

  // HERO CARD
  heroCard: {
    backgroundColor: '#3563E9',
    borderRadius: 25,
    padding: 21,
    marginBottom: 32,
    overflow: 'hidden',
    elevation: 7,
    shadowColor: '#3563E9',
    shadowOpacity: 0.23,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 7 },
  },

  heroDecoration: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.055)',
    right: -65,
    top: 85,
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 21,
  },

  heroIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroIconText: {
    color: '#FFFFFF',
    fontSize: 29,
  },

  offlineBadge: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#79F5BA',
    marginRight: 7,
  },

  offlineText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  heroEyebrow: {
    color: '#C5D4FF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 8,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  heroDescription: {
    color: '#E0E8FF',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 9,
  },

  heroFeatures: {
    marginTop: 17,
    marginBottom: 20,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  featureCheck: {
    color: '#8CFFC7',
    fontSize: 14,
    fontWeight: '900',
    marginRight: 9,
  },

  featureText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    minHeight: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  primaryButtonText: {
    color: '#3563E9',
    fontSize: 15,
    fontWeight: '900',
  },

  buttonArrowContainer: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  buttonArrow: {
    color: '#3563E9',
    fontSize: 19,
    fontWeight: '800',
    marginTop: -7,
  },

  heroFooter: {
    color: '#D6E0FF',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '600',
  },

  // SECTION HEADERS
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#17213B',
    letterSpacing: -0.3,
  },

  sectionDescription: {
    color: '#929BAE',
    fontSize: 11,
    marginTop: 5,
  },

  toolsCount: {
    backgroundColor: '#E9EEFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
  },

  toolsCountText: {
    color: '#3563E9',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // QUICK TOOLS
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 27,
  },

  toolCard: {
    width: '48%',
    minHeight: 145,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEF0F6',
    elevation: 2,
    shadowColor: '#17213B',
    shadowOpacity: 0.035,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  toolCardPressed: {
    backgroundColor: '#F0F3FF',
    transform: [{ scale: 0.97 }],
  },

  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },

  toolEmoji: {
    fontSize: 22,
  },

  toolTextContainer: {
    flex: 1,
  },

  toolTitle: {
    color: '#17213B',
    fontSize: 13,
    fontWeight: '900',
  },

  toolDescription: {
    color: '#929BAE',
    fontSize: 10,
    marginTop: 6,
  },

  toolArrow: {
    position: 'absolute',
    right: 14,
    top: 14,
    color: '#A0A9BB',
    fontSize: 16,
  },

  // RECENT DOCUMENTS
  viewAllButton: {
    paddingVertical: 8,
    paddingLeft: 8,
  },

  viewAll: {
    color: '#3563E9',
    fontSize: 12,
    fontWeight: '900',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#17213B',
    shadowOpacity: 0.035,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  emptyCardPressed: {
    backgroundColor: '#F0F3FF',
  },

  emptyIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  emptyIcon: {
    fontSize: 23,
  },

  emptyTextContainer: {
    flex: 1,
  },

  emptyTitle: {
    color: '#17213B',
    fontSize: 13,
    fontWeight: '900',
  },

  emptyDescription: {
    color: '#929BAE',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },

  emptyArrow: {
    color: '#3563E9',
    fontSize: 26,
    marginLeft: 8,
  },

  // FOOTER
  bottomInfo: {
    alignItems: 'center',
    marginTop: 30,
  },

  bottomDivider: {
    height: 1,
    backgroundColor: '#E8EBF2',
    width: '100%',
    marginBottom: 22,
  },

  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  footerLogoIcon: {
    width: 23,
    height: 23,
    borderRadius: 7,
    backgroundColor: '#3563E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  footerLogoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  footerBrand: {
    color: '#17213B',
    fontSize: 14,
    fontWeight: '900',
  },

  footerText: {
    color: '#929BAE',
    fontSize: 11,
    marginTop: 9,
  },

  versionText: {
    color: '#B0B7C5',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 10,
  },

  pressed: {
    opacity: 0.7,
  },
});

export default HomeScreen;

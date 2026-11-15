
import { createPdf } from 'react-native-images-to-pdf';
import RNBlobUtil from 'react-native-blob-util';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import type { Asset } from 'react-native-image-picker';

import type { PDFSettings } from '../screens/PDFPreviewScreen';

const PAGE_DIMENSIONS = {
  A4: { width: 794, height: 1123 },
  A3: { width: 1123, height: 1587 },
  Letter: { width: 816, height: 1056 },
};

export type PDFGenerationProgress = (
  progress: number,
  message: string,
) => void;

const toFileUri = (path: string) => {
  if (path.startsWith('file://')) return path;
  return `file://${path}`;
};

export const generatePDF = async (
  images: Asset[],
  rotations: Record<string, number>,
  settings: PDFSettings,
  onProgress?: PDFGenerationProgress,
): Promise<string> => {
  if (!images.length) {
    throw new Error('Please select at least one image.');
  }

  const dimensions = PAGE_DIMENSIONS[settings.pageSize];

  const pageWidth =
    settings.orientation === 'Landscape'
      ? dimensions.height
      : dimensions.width;

  const pageHeight =
    settings.orientation === 'Landscape'
      ? dimensions.width
      : dimensions.height;

  const pages: {
    imagePath: string;
    width: number;
    height: number;
    imageFit: 'contain' | 'cover';
    backgroundColor: string;
  }[] = [];

  const temporaryFiles: string[] = [];

  try {
    onProgress?.(2, 'Preparing your document...');

    // Process images one by one to limit memory usage.
    for (let index = 0; index < images.length; index++) {
      const image = images[index];

      if (!image.uri) {
        throw new Error('One of the selected images has an invalid URI.');
      }

      if (image.uri.startsWith('content://')) {
        throw new Error(
          'An image has an unsupported content URI. Please select it again.',
        );
      }

      onProgress?.(
        Math.round(5 + (index / images.length) * 65),
        `Processing image ${index + 1} of ${images.length}...`,
      );

      const rotation = ((rotations[image.uri] || 0) % 360 + 360) % 360;

      let imagePath = image.uri;

      // Apply the rotation to the actual image file.
      if (rotation !== 0) {
        const resized = await ImageResizer.createResizedImage(
          image.uri,
          2400,
          3200,
          'JPEG',
          92,
          rotation,
          undefined,
          false,
          {
            mode: 'contain',
            onlyScaleDown: true,
          },
        );

        imagePath = resized.path;
        temporaryFiles.push(resized.path);
      }

      pages.push({
        imagePath: toFileUri(imagePath),
        width: pageWidth,
        height: pageHeight,
        imageFit: settings.imageFit,
        backgroundColor: '#FFFFFF',
      });

      const processedProgress = Math.round(
        5 + ((index + 1) / images.length) * 65,
      );

      onProgress?.(
        processedProgress,
        `Processed ${index + 1} of ${images.length} images`,
      );
    }

    onProgress?.(80, 'Creating your PDF document...');

    const fileName = `PixelPDF_${Date.now()}.pdf`;
    const outputPath = `file://${RNBlobUtil.fs.dirs.DocumentDir}/${fileName}`;

    const generatedPath = await createPdf({
      pages,
      outputPath,
    });

    onProgress?.(100, 'PDF created successfully!');

    return generatedPath;
  } finally {
    // Remove only the temporary rotated copies.
    for (const path of temporaryFiles) {
      try {
        await RNBlobUtil.fs.unlink(path);
      } catch {
        // Ignore cleanup errors; the generated PDF remains intact.
      }
    }
  }
};

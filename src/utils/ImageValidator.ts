/**
 * Image validation utility for frontend
 * Validates passport photo requirements:
 * - Type: JPG, JPEG, PNG only
 * - Size: 10 KB - 300 KB
 * - Dimensions: Portrait orientation (height > width)
 * - Aspect ratio: Suitable for passport photos
 */

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface ImageDimensions {
  width: number;
  height: number;
}

export class ImageValidator {
  // Allowed file types
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png'];
  private static readonly ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

  // File size limits (in bytes)
 private static readonly MIN_FILE_SIZE = 15 * 1024; // 15 KB ✅

private static readonly MAX_FILE_SIZE = 200 * 1024; // 200 KB

  // Exact passport photo dimensions
  private static readonly PASSPORT_WIDTH = 413;
  private static readonly PASSPORT_HEIGHT = 531;
  private static readonly PASSPORT_ASPECT_RATIO = 413 / 531; // 0.778
  private static readonly ASPECT_RATIO_TOLERANCE = 0.02; // Allow 2% tolerance

  // Acceptable aspect ratio range for passport photos (portrait) - legacy
  private static readonly MIN_ASPECT_RATIO = 0.7; // Allow some flexibility
  private static readonly MAX_ASPECT_RATIO = 0.85;

  /**
   * BEFORE CROP: Validate file type, max size, and if image is corrupt
   */
  static async validateBeforeCrop(file: File): Promise<ValidationResult> {
    if (!file) {
      return {
        valid: false,
        error: 'No file selected'
      };
    }

    // Check MIME type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid image format. Only JPG, JPEG, and PNG are allowed.'
      };
    }

    // Check file extension
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: 'Invalid file extension. Only .jpg, .jpeg, and .png are allowed.'
      };
    }

    // Check maximum file size only (before crop)
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Image too large. Maximum size: ${this.MAX_FILE_SIZE / 1024} KB`
      };
    }

    // Check if image is corrupt by trying to load it
    try {
      await this.getImageDimensions(file);
    } catch (error) {
      return {
        valid: false,
        error: 'Image file is corrupt or cannot be read. Please try another image.'
      };
    }

    return { valid: true };
  }

  /**
   * AFTER CROP: Validate dimensions, aspect ratio, and orientation
   */
  static async validateAfterCrop(file: File): Promise<ValidationResult> {
    // Check minimum file size (after crop)
    if (file.size < this.MIN_FILE_SIZE) {
      return {
        valid: false,
        error: `Image too small. Minimum size: ${this.MIN_FILE_SIZE / 1024} KB`
      };
    }

    // Get image dimensions
    let dimensions: ImageDimensions;
    try {
      dimensions = await this.getImageDimensions(file);
    } catch (error) {
      return {
        valid: false,
        error: 'Unable to validate image dimensions. Please try another image.'
      };
    }

    // Validate dimensions, orientation, and aspect ratio
    return this.validateDimensionsAndAspectRatio(dimensions);
  }

  /**
   * Validate file type and size
   */
  static validateFileTypeAndSize(file: File): ValidationResult {
    if (!file) {
      return {
        valid: false,
        error: 'No file selected'
      };
    }

    // Check MIME type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid image format. Only JPG, JPEG, and PNG are allowed.'
      };
    }

    // Check file extension
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: 'Invalid file extension. Only .jpg, .jpeg, and .png are allowed.'
      };
    }

    // Check file size
    if (file.size < this.MIN_FILE_SIZE) {
      return {
        valid: false,
        error: `Image too small. Minimum size: ${this.MIN_FILE_SIZE / 1024} KB`
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Image too large. Maximum size: ${this.MAX_FILE_SIZE / 1024} KB`
      };
    }

    return { valid: true };
  }

  /**
   * Get image dimensions
   */
  static getImageDimensions(file: File): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        };

        img.onerror = () => {
          reject(new Error('Unable to read image dimensions'));
        };

        img.src = event.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate image dimensions and aspect ratio for passport photo (exact 413:531 ratio)
   */
  static validateDimensionsAndAspectRatio(
  dimensions: ImageDimensions
): ValidationResult {
  const { width, height } = dimensions;

  // STRICT passport size check
  if (width !== this.PASSPORT_WIDTH || height !== this.PASSPORT_HEIGHT) {
    return {
      valid: false,
      error: `Cropped image must be exactly ${this.PASSPORT_WIDTH} × ${this.PASSPORT_HEIGHT} pixels`
    };
  }

  return { valid: true };
}

  /**
   * Validate image dimensions for passport photo (legacy - with flexible ratio)
   */
  static validateDimensions(dimensions: ImageDimensions): ValidationResult {
    const { width, height } = dimensions;

    // Check if image is in portrait orientation
    if (width > height) {
      return {
        valid: false,
        error: 'Image must be in portrait orientation (height > width)'
      };
    }

    // Calculate aspect ratio
    const aspectRatio = width / height;

    // Check if aspect ratio is within acceptable range
    if (aspectRatio < this.MIN_ASPECT_RATIO || aspectRatio > this.MAX_ASPECT_RATIO) {
      return {
        valid: false,
        error: `Image aspect ratio not suitable for passport photo. Please upload a portrait-oriented photo.`
      };
    }

    return { valid: true };
  }

  /**
   * Complete validation: file properties + dimensions
   */
  static async validateImage(file: File): Promise<ValidationResult> {
    // Step 1: Validate file properties
    const fileValidation = this.validateFileTypeAndSize(file);
    if (!fileValidation.valid) {
      return fileValidation;
    }

    // Step 2: Get image dimensions
    let dimensions: ImageDimensions;
    try {
      dimensions = await this.getImageDimensions(file);
    } catch (error) {
      return {
        valid: false,
        error: 'Unable to validate image dimensions. Please try another image.'
      };
    }

    // Step 3: Validate dimensions
    const dimensionValidation = this.validateDimensions(dimensions);
    if (!dimensionValidation.valid) {
      return dimensionValidation;
    }

    return { valid: true };
  }

  /**
   * Get file size in KB
   */
  static getFileSizeKB(file: File): number {
    return Math.round(file.size / 1024);
  }
}

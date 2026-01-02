/**
 * Image validation utility for frontend
 * Validates passport photo requirements:
 * - Type: JPG, JPEG, PNG only
 * - Size: 30 KB - 300 KB
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
  private static readonly MIN_FILE_SIZE = 30 * 1024; // 30 KB
  private static readonly MAX_FILE_SIZE = 300 * 1024; // 300 KB

  // Acceptable aspect ratio range for passport photos (portrait)
  // Passport ratio is 413:531 = 0.778
  private static readonly MIN_ASPECT_RATIO = 0.7; // Allow some flexibility
  private static readonly MAX_ASPECT_RATIO = 0.85;

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
   * Validate image dimensions for passport photo
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

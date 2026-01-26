/**
 * @interface IImage
 * @description Defines the structure for an image.
 */
export interface IImage {
  id: string;
  path: string;
  alt_text: string | null;
  created_at: Date;
}

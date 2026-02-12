// lib/cloudinary-loader.ts
const cloudinaryLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  // Ensure src is a valid Cloudinary URL
  if (!src.startsWith('https://res.cloudinary.com/')) {
    console.warn(`Invalid Cloudinary URL provided to loader: ${src}`);
    return src; // Fallback to original src if not a Cloudinary URL
  }

  // Extract the base Cloudinary URL parts before the /upload/ segment
  const parts = src.split('/upload/');
  if (parts.length < 2) {
    console.warn(`Could not parse Cloudinary URL for transformations: ${src}`);
    return src;
  }

  const baseUrl = parts[0];
  const publicIdPath = parts[1]; // e.g., v1770827013/b2b-wholesale/file_gd87tl.jpg

  const params = ['f_auto', 'q_auto']; // Automatic format and quality
  if (width) {
    params.push(`w_${width}`); // Requested width
  }
  if (quality) {
    params.push(`q_${quality}`); // Requested quality
  }

  // Construct the new URL with transformations
  return `${baseUrl}/upload/${params.join(',')}/${publicIdPath}`;
};

export default cloudinaryLoader;

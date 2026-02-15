// lib/cloudinary-loader.ts
const cloudinaryLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (!src.startsWith('https://res.cloudinary.com/')) {
    console.warn(`Invalid Cloudinary URL provided to loader: ${src}`);
    return src;
  }

  const params = ['f_auto', 'q_auto', 'dpr_auto'];

  // next/image passes width=0 for fill. Cloudinary needs a specific width for w_ param.
  // Use a reasonable max default if width is 0 or undefined for fill.
  const finalWidth = width && width !== 0 ? width : 1200; // Use 1200px as a reasonable max default

  params.push(`w_${finalWidth}`);

  // Use provided quality or a default
  const finalQuality = quality || 75;
  params.push(`q_${finalQuality}`);

  // Insert transformations after '/upload/' and before any version segment or public_id
  // This regex targets /upload/ followed by an optional 'v' segment (version) and a slash
  // and inserts the transformations there.
  return src.replace(/\/upload\/(v\d+)?\/?/, `/upload/${params.join(',')}/$1/`);
};

export default cloudinaryLoader;

// File: D:\mugundhan\GLgenie\GL_Genie_Complete_Updated\frontend\src\reportWebVitals.js

// This function logs web vital metrics to the console.
// You can also send them to an analytics endpoint if needed.

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Dynamically import 'web-vitals' to ensure it's only loaded when needed.
    // This library helps measure performance metrics like CLS, FID, FCP, LCP, TTFB.
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);   // Cumulative Layout Shift
      getFID(onPerfEntry);   // First Input Delay
      getFCP(onPerfEntry);   // First Contentful Paint
      getLCP(onPerfEntry);   // Largest Contentful Paint
      getTTFB(onPerfEntry);  // Time to First Byte
    });
  }
};

export default reportWebVitals; // Export the function for use in index.js

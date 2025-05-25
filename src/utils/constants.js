// const videoExtensions = [".m4v", ".mp4", ".mov"];

//   export const getMediaType = (filename) => {
//     // Get the last part after the last dot (extension)
//     const extension = filename.slice(filename.lastIndexOf(".")).toLowerCase();
//     return videoExtensions.includes(extension) ? "video" : "image";
//   };


  export const getMediaType = (filename) => {
  if (!filename) return "unknown";
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
    return "image";
  }
  
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', '3gp'].includes(extension)) {
    return "video";
  }
  
  return "unknown";
};

export const validateQRCode = (data) => {
  if (!data) {
    return {
      isValid: false,
      error: "QR code data is empty"
    };
  }

  // Check if the data is a valid number
  const id = parseInt(data.trim());
  
  if (isNaN(id)) {
    return {
      isValid: false,
      error: "QR code must contain a valid numeric ID"
    };
  }

  if (id <= 0) {
    return {
      isValid: false,
      error: "ID must be a positive number"
    };
  }

  return {
    isValid: true,
    id: id
  };
};
export const formatDate = (dateString) => {
  if (!dateString) return '';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return new Date(dateString).toLocaleDateString('en-US', options);
};

export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';

  return Number(num).toLocaleString();
};

export const formatFileSize = (bytes) => {
  if (typeof bytes === 'string') return bytes;

  if (!bytes) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    parseFloat(
      (bytes / Math.pow(k, i)).toFixed(1)
    ) +
    ' ' +
    sizes[i]
  );
};

// Format MIME type / file type thành tên ngắn gọn để hiển thị UI.
// Ví dụ:
// application/pdf
// -> PDF
// application/vnd.openxmlformats-officedocument.wordprocessingml.document
// -> DOCX
// application/vnd.openxmlformats-officedocument.presentationml.presentation
// -> PPTX
export const formatFileType = (fileType = '') => {
  const type = String(fileType)
    .trim()
    .toLowerCase();

  if (!type) return 'FILE';

  // PDF
  if (type.includes('pdf')) {
    return 'PDF';
  }

  // DOCX
  if (
    type.includes('wordprocessingml') ||
    type.includes('docx')
  ) {
    return 'DOCX';
  }

  // DOC
  if (
    type.includes('msword') ||
    type === 'doc'
  ) {
    return 'DOC';
  }

  // PPTX
  if (
    type.includes('presentationml') ||
    type.includes('pptx')
  ) {
    return 'PPTX';
  }

  // PPT
  if (
    type.includes('powerpoint') ||
    type === 'ppt'
  ) {
    return 'PPT';
  }

  // XLSX
  if (
    type.includes('spreadsheetml') ||
    type.includes('xlsx')
  ) {
    return 'XLSX';
  }

  // XLS
  if (
    type.includes('excel') ||
    type === 'xls'
  ) {
    return 'XLS';
  }

  // Fallback:
  // application/zip -> ZIP
  // text/plain -> PLAIN
  const lastPart = type
    .split('/')
    .pop();

  return lastPart
    ? lastPart.toUpperCase()
    : 'FILE';
};

// Chỉ format title khi HIỂN THỊ.


// Không làm thay đổi document.title thật từ Backend.
export const formatDocumentTitle = (title = '') => {
  if (!title) return '';

  return String(title)
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};
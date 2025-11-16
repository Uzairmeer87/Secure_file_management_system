import React from 'react';
function FileMetadata({ meta }) {
  if (!meta) return null;
  return (
    <div className="meta-box">
      <pre>{JSON.stringify(meta, null, 2)}</pre>
    </div>
  );
}
export default FileMetadata;

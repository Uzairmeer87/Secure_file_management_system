import React from 'react';
import { Link } from 'react-router-dom';

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (["txt", "md", "log"].includes(ext)) return '📝';
  if (["png","jpg","jpeg","gif","bmp","svg","webp"].includes(ext)) return "🖼️";
  if (["doc","docx"].includes(ext)) return "📄";
  if (["xls","xlsx"].includes(ext)) return "📊";
  if (["ppt","pptx"].includes(ext)) return "📈";
  if (["pdf"].includes(ext)) return "📕";
  if (["zip","rar","7z","tar","gz"].includes(ext)) return "🗜️";
  if (["cpp","c","h","hpp","py","js","jsx","json","ts","tsx","java","rb","cs","go"].includes(ext)) return "💻";
  return "📁";
}
function getFileType(name) {
  const ext = name.split('.').pop();
  if (!ext || ext === name) return 'File';
  return ext.toUpperCase();
}
function formatBytes(bytes) {
  if (!bytes) return ''; let i = 0, k = 1024, sizes = ['B','KB','MB','GB'];
  while (bytes >= k && i < sizes.length-1) bytes /= k, i++;
  return `${bytes.toFixed(i?1:0)} ${sizes[i]}`;
}
function FileList({ files, onRefresh }) {
  return (
    <div style={{marginTop:24}}>
      <button className="btn btn-secondary" style={{marginBottom:10}} onClick={onRefresh}>Refresh</button>
      <div className="file-list" style={{padding:0}}>
        <table className="file-table" style={{width:'100%',borderCollapse:'collapse',fontSize:'1.06em'}}>
          <thead>
            <tr style={{background:'rgba(30,46,66,0.78)',borderBottom:'2px solid #232946',textAlign:'left'}}>
              <th style={{padding:'8px 12px'}}>Name</th>
              <th style={{padding:'8px 12px'}}>Type</th>
              <th style={{padding:'8px 12px'}}>Size</th>
              <th style={{padding:'8px 12px'}}>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 && (
              <tr><td colSpan={5} style={{textAlign:'center',color:'#ffffff80',padding:'2em'}}>No files uploaded.</td></tr>
            )}
            {files.map(file => (
              <tr key={file.name} className="file-row" style={{borderBottom:'1px solid #252c43',transition:'background 0.14s'}}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(37, 56, 78, 0.16)'}
                onMouseOut={e => e.currentTarget.style.background = ''}
              >
                <td style={{padding:'8px 12px',display:'flex',alignItems:'center',gap:8}}>
                  <span className="file-icon" style={{fontSize:'1.18em'}}>{getFileIcon(file.name)}</span>
                  <span className="file-name" style={{color:'#fff',fontWeight:500}}>{file.name}</span>
                </td>
                <td style={{padding:'8px 12px',color:'#ffe066',fontSize:'0.98em',fontWeight:400}}>{getFileType(file.name)}</td>
                <td style={{padding:'8px 12px',color:'#16ff7a'}}>{formatBytes(file.size)}</td>
                <td style={{padding:'8px 12px',fontSize:'0.93em'}}>{file.updatedAt ? new Date(file.updatedAt).toLocaleString() : ''}</td>
                <td style={{padding:'8px'}}>
                  <Link className="btn btn-link" to={`/files/${file.name}`}>Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default FileList;

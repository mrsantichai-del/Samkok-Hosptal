const fs = require('fs');

const file = 'src/app/dashboard/users/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add handleDeleteImage function
const handleDeleteImageMethod = `
  const handleDeleteImage = async (type: 'image' | 'signature') => {
    if (!currentUser) return;
    if (!confirm(\`คุณต้องการลบ\${type === 'image' ? 'รูปโปรไฟล์' : 'ลายเซ็น'}ใช่หรือไม่?\`)) return;

    setUploading(true);
    const toastId = toast.loading(\`กำลังลบ\${type === 'image' ? 'รูปโปรไฟล์' : 'ลายเซ็น'}...\`);
    try {
      const token = Cookies.get("token");
      await axios.delete(\`\${API_URL}/users/\${currentUser.id}/\${type}\`, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      toast.success("ลบสำเร็จ", { id: toastId });
      fetchData(); // Refresh list
      
      // Update currentUser to reflect immediately
      const res = await axios.get(\`\${API_URL}/users/\${currentUser.id}\`, { headers: { Authorization: \`Bearer \${token}\` } });
      setCurrentUser(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการลบ", { id: toastId });
    } finally {
      setUploading(false);
    }
  };
`;

if (!content.includes('const handleDeleteImage = async')) {
  content = content.replace(
    'const handleDelete = async',
    handleDeleteImageMethod + '\n  const handleDelete = async'
  );
}

// Update UI to add Delete buttons
const oldProfileImg = '<img src={currentUser.imgUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover border" />';
const newProfileImg = `
                      <div className="relative group">
                        <img src={currentUser.imgUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover border" />
                        <button onClick={() => handleDeleteImage('image')} disabled={uploading} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="ลบรูปโปรไฟล์">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
`;
content = content.replace(oldProfileImg, newProfileImg);

const oldSignatureImg = '<img src={currentUser.signatureUrl} alt="Signature" className="h-12 object-contain border bg-white p-1" />';
const newSignatureImg = `
                      <div className="relative group">
                        <img src={currentUser.signatureUrl} alt="Signature" className="h-12 object-contain border bg-white p-1" />
                        <button onClick={() => handleDeleteImage('signature')} disabled={uploading} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="ลบลายเซ็น">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
`;
content = content.replace(oldSignatureImg, newSignatureImg);

fs.writeFileSync(file, content);
console.log("Updated users/page.tsx with delete image buttons");

const fs = require('fs');

const file = 'src/app/dashboard/users/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add upload state
if (!content.includes('const [uploading, setUploading]')) {
  content = content.replace(
    'const [empComboboxOpen, setEmpComboboxOpen] = useState(false);',
    `const [empComboboxOpen, setEmpComboboxOpen] = useState(false);
  const [uploading, setUploading] = useState(false);`
  );
}

// 2. Add handleUpload method
const handleUploadMethod = `
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'signature') => {
    if (!e.target.files || !e.target.files[0]) return;
    if (!currentUser) return toast.error("กรุณาบันทึกข้อมูลผู้ใช้งานก่อนอัปโหลดรูป");

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    const toastId = toast.loading(\`กำลังอัปโหลด\${type === 'image' ? 'รูปโปรไฟล์' : 'ลายเซ็น'}...\`);
    try {
      const token = Cookies.get("token");
      await axios.post(\`\${API_URL}/users/\${currentUser.id}/upload-\${type}\`, formData, {
        headers: { Authorization: \`Bearer \${token}\`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success("อัปโหลดสำเร็จ", { id: toastId });
      fetchData(); // Refresh to get new image URL
      
      // Update currentUser to reflect immediately
      const res = await axios.get(\`\${API_URL}/users/\${currentUser.id}\`, { headers: { Authorization: \`Bearer \${token}\` } });
      setCurrentUser(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการอัปโหลด", { id: toastId });
    } finally {
      setUploading(false);
      e.target.value = ''; // reset
    }
  };
`;

if (!content.includes('const handleImageUpload')) {
  content = content.replace(
    'const handleDelete = async',
    handleUploadMethod + '\n  const handleDelete = async'
  );
}

// 3. Add UI elements to the Edit Dialog
const uploadUI = `
            {isEditOpen && currentUser && (
              <>
                <hr className="my-2" />
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">รูปโปรไฟล์</Label>
                  <div className="col-span-3 flex items-center gap-4">
                    {currentUser.imgUrl && (
                      <img src={currentUser.imgUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover border" />
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image')} disabled={uploading} className="text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">ลายเซ็น</Label>
                  <div className="col-span-3 flex items-center gap-4">
                    {currentUser.signatureUrl && (
                      <img src={currentUser.signatureUrl} alt="Signature" className="h-12 object-contain border bg-white p-1" />
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'signature')} disabled={uploading} className="text-sm" />
                  </div>
                </div>
              </>
            )}
`;

if (!content.includes('handleImageUpload(e, \'image\')')) {
  content = content.replace(
    '<hr className="my-2" />',
    uploadUI + '\n            <hr className="my-2" />'
  );
}

fs.writeFileSync(file, content);
console.log("Updated users/page.tsx");

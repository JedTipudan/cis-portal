'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Upload, Trash2, Download } from 'lucide-react'

const categories = ['Report', 'Form', 'Policy', 'Financial', 'Other']

export default function ReportsClient({ documents, isAdmin }: { documents: any[]; isAdmin: boolean }) {
  const [docs, setDocs] = useState(documents)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Report')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function upload() {
    const file = fileRef.current?.files?.[0]
    if (!file || !title) return
    setUploading(true)
    const path = `documents/${Date.now()}_${file.name}`
    const { data: storageData } = await supabase.storage.from('documents').upload(path, file)
    if (storageData) {
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
      const { data: doc } = await supabase.from('documents').insert({
        title, category, file_url: urlData.publicUrl
      }).select().single()
      if (doc) setDocs([doc, ...docs])
    }
    setTitle('')
    setCategory('Report')
    if (fileRef.current) fileRef.current.value = ''
    setUploading(false)
  }

  async function deleteDoc(id: string) {
    await supabase.from('documents').delete().eq('id', id)
    setDocs(docs.filter(d => d.id !== id))
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Reports, Documents & Issuances</h1>
        <p className="text-gray-500 text-sm">School reports and official documents</p>
      </div>

      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Upload Document</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Title</label>
              <input className="border rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-[#7C9A6E]"
                value={title} onChange={e => setTitle(e.target.value)} placeholder="Document title" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Category</label>
              <select className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A6E]"
                value={category} onChange={e => setCategory(e.target.value)}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">File</label>
              <input ref={fileRef} type="file" className="text-sm" />
            </div>
            <button onClick={upload} disabled={uploading || !title}
              className="flex items-center gap-2 bg-[#7C9A6E] text-white px-4 py-1.5 rounded-lg text-sm hover:bg-[#5a7a52] disabled:opacity-50">
              <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {docs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <FileText size={40} className="mx-auto mb-2 opacity-30" />
            <p>No documents uploaded yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#7C9A6E] text-white">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-center">Category</th>
                <th className="px-4 py-2 text-center">Date</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d, i) => (
                <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <FileText size={14} className="text-[#7C9A6E]" /> {d.title}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{d.category}</span>
                  </td>
                  <td className="px-4 py-2 text-center text-gray-500">
                    {new Date(d.uploaded_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {d.file_url && (
                        <a href={d.file_url} target="_blank" rel="noopener noreferrer"
                          className="text-[#7C9A6E] hover:text-[#5a7a52]">
                          <Download size={14} />
                        </a>
                      )}
                      {isAdmin && (
                        <button onClick={() => deleteDoc(d.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

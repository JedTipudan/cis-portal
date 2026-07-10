'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export const GRADE_LEVELS = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10']
export const CRLA_GRADES = ['Grade 1','Grade 2','Grade 3']
export const PHILIRI_GRADES = ['Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10']
export const READING_PERIODS = ['BoSy','MoSY','EoSY']

const C = (colors: Record<string,string>) => colors
const LEVELS_CRLA = ['Low Emerging','High Emerging','Developing','Transition','Grade Level Reader']
const LEVELS_RMA  = ['Not Proficient','Low Proficient','Nearly Proficient','Proficient','Highly Proficient']

export const CRLA_SUBCATS = [
  { key:'overall', label:'Overall',                  fields:['overall_low_emerging','overall_high_emerging','overall_developing','overall_transition','overall_grade_level_reader'], levels:LEVELS_CRLA, colors:C({'Low Emerging':'#EF4444','High Emerging':'#F97316','Developing':'#F59E0B','Transition':'#3B82F6','Grade Level Reader':'#7C9A6E'}) },
  { key:'sb',      label:'Sinugbuanong Binisaya',     fields:['sb_low_emerging','sb_high_emerging','sb_developing','sb_transition','sb_grade_level_reader'],                         levels:LEVELS_CRLA, colors:C({'Low Emerging':'#EF4444','High Emerging':'#F97316','Developing':'#F59E0B','Transition':'#3B82F6','Grade Level Reader':'#7C9A6E'}) },
  { key:'fil',     label:'Filipino',                  fields:['fil_low_emerging','fil_high_emerging','fil_developing','fil_transition','fil_grade_level_reader'],                     levels:LEVELS_CRLA, colors:C({'Low Emerging':'#EF4444','High Emerging':'#F97316','Developing':'#F59E0B','Transition':'#3B82F6','Grade Level Reader':'#7C9A6E'}) },
  { key:'eng',     label:'English',                   fields:['eng_low_emerging','eng_high_emerging','eng_developing','eng_transition','eng_grade_level_reader'],                     levels:LEVELS_CRLA, colors:C({'Low Emerging':'#EF4444','High Emerging':'#F97316','Developing':'#F59E0B','Transition':'#3B82F6','Grade Level Reader':'#7C9A6E'}) },
]

export const PHILIRI_SUBCATS = [
  { key:'overall', label:'Overall',                   fields:['three_levels_down','two_levels_down','grade_ready'],                                                                   levels:['3-Levels Down','2-Levels Down','Grade Ready'],   colors:C({'3-Levels Down':'#EF4444','2-Levels Down':'#F59E0B','Grade Ready':'#7C9A6E'}) },
  { key:'tld_fil', label:'3-Levels Down (Filipino)',  fields:['tld_fil_frustration','tld_fil_instructional','tld_fil_independent'],                                                   levels:['Frustration','Instructional','Independent'],      colors:C({'Frustration':'#EF4444','Instructional':'#3B82F6','Independent':'#7C9A6E'}) },
  { key:'tld_eng', label:'3-Levels Down (English)',   fields:['tld_eng_frustration','tld_eng_instructional','tld_eng_independent'],                                                   levels:['Frustration','Instructional','Independent'],      colors:C({'Frustration':'#EF4444','Instructional':'#3B82F6','Independent':'#7C9A6E'}) },
  { key:'twd_fil', label:'2-Levels Down (Filipino)',  fields:['twd_fil_frustration','twd_fil_instructional','twd_fil_independent'],                                                   levels:['Frustration','Instructional','Independent'],      colors:C({'Frustration':'#EF4444','Instructional':'#3B82F6','Independent':'#7C9A6E'}) },
  { key:'twd_eng', label:'2-Levels Down (English)',   fields:['twd_eng_frustration','twd_eng_instructional','twd_eng_independent'],                                                   levels:['Frustration','Instructional','Independent'],      colors:C({'Frustration':'#EF4444','Instructional':'#3B82F6','Independent':'#7C9A6E'}) },
]

export const RMA_SUBCATS = [
  { key:'overall', label:'Overall', fields:['not_proficient','low_proficient','nearly_proficient','proficient','highly_proficient'], levels:LEVELS_RMA, colors:C({'Not Proficient':'#EF4444','Low Proficient':'#F97316','Nearly Proficient':'#F59E0B','Proficient':'#3B82F6','Highly Proficient':'#7C9A6E'}) },
]

export const NEGATIVE_KPIS = new Set(['Dropout/School Leaver Rate','Repetition Rate'])

export function kpiStatus(indicator: string, value: number) {
  if (NEGATIVE_KPIS.has(indicator)) {
    if (value <= 1) return { label:'Excellent', cls:'bg-green-100 text-green-700' }
    if (value <= 3) return { label:'Acceptable', cls:'bg-yellow-100 text-yellow-700' }
    return { label:'Critical', cls:'bg-red-100 text-red-700' }
  }
  if (value >= 95) return { label:'Excellent', cls:'bg-green-100 text-green-700' }
  if (value >= 85) return { label:'Good', cls:'bg-blue-100 text-blue-700' }
  if (value >= 75) return { label:'Fair', cls:'bg-yellow-100 text-yellow-700' }
  return { label:'Needs Attention', cls:'bg-red-100 text-red-700' }
}

export function ReadingTable({ data, fields, levels, colors, editing, onUpdate, grades }: {
  data: any[]; fields: string[]; levels: string[]; colors: Record<string,string>
  editing: boolean; onUpdate: (id:string,f:string,v:string)=>void; grades: string[]
}) {
  const rows = grades.map(g => data.find(r => r.grade_level === g)).filter(Boolean)
  const totals = fields.map(f => rows.reduce((s,r) => s + Number(r[f]||0), 0))
  const grand = totals.reduce((s,v) => s+v, 0)
  const chartData = rows.map(r => {
    const obj: any = { name: r.grade_level.replace('Grade ','G') }
    fields.forEach((f,i) => { obj[levels[i]] = Number(r[f]||0) })
    return obj
  })
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {levels.map(l => (
          <div key={l} className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-full" style={{backgroundColor:colors[l]}} />
            <span className="text-gray-600">{l}</span>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-[#7C9A6E] text-white">
            <tr>
              <th className="px-3 py-2 text-left">Grade</th>
              {levels.map(l => <th key={l} className="px-3 py-2 text-center text-xs whitespace-nowrap">{l}</th>)}
              <th className="px-3 py-2 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i) => {
              const rowTotal = fields.reduce((s,f) => s + Number(r[f]||0), 0)
              return (
                <tr key={r.id} className={i%2===0?'bg-white':'bg-gray-50'}>
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{r.grade_level}</td>
                  {fields.map((f,fi) => (
                    <td key={f} className="px-3 py-2 text-center">
                      {editing
                        ? <input type="number" className="w-14 border rounded px-1 text-center text-xs" value={r[f]||0} onChange={e => onUpdate(r.id,f,e.target.value)} />
                        : <span className="font-semibold" style={{color:colors[levels[fi]]}}>{r[f]||0}</span>}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center font-bold">{rowTotal}</td>
                </tr>
              )
            })}
            <tr className="bg-[#F5C842]/20 font-bold border-t-2 border-gray-300">
              <td className="px-3 py-2">TOTAL</td>
              {totals.map((t,i) => <td key={i} className="px-3 py-2 text-center" style={{color:colors[levels[i]]}}>{t}</td>)}
              <td className="px-3 py-2 text-center">{grand}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-xl border p-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{top:5,right:10,left:-10,bottom:5}}>
            <XAxis dataKey="name" tick={{fontSize:10}} />
            <YAxis tick={{fontSize:10}} />
            <Tooltip />
            <Legend wrapperStyle={{fontSize:'10px'}} />
            {levels.map((l,i) => (
              <Bar key={l} dataKey={l} stackId="a" fill={colors[l]} radius={i===levels.length-1?[3,3,0,0]:[0,0,0,0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

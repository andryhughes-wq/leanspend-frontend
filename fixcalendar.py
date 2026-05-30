import re

with open('components/calendar/CalendarTab.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Pass all stores if preferredStores is empty, so deals always show
content = content.replace(
    "queryFn: () => dealsApi.getWeeklyAds(profile.preferredStores),",
    "queryFn: () => dealsApi.getWeeklyAds(profile.preferredStores?.length ? profile.preferredStores : undefined),"
)

# Fix 2: Change radius default from 10 to null (no default radius filter)
content = content.replace(
    "const [radius, setRadius] = useState(10)",
    "const [radius, setRadius] = useState<number|null>(null)"
)

with open('components/calendar/CalendarTab.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed deal fetching')

# Now add radius selector UI - find where activeFilter UI is and add radius after it
with open('components/calendar/CalendarTab.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

radius_ui = """
      {/* Radius selector */}
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,flexWrap:'wrap'}}>
        <span style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>Radius:</span>
        {[null,5,10,25,50].map(r=>(
          <button key={String(r)} onClick={()=>setRadius(r)} style={{
            padding:'4px 12px',borderRadius:20,fontSize:12,cursor:'pointer',
            border:radius===r?'1px solid rgba(0,255,200,0.5)':'1px solid rgba(255,255,255,0.15)',
            background:radius===r?'rgba(0,255,200,0.1)':'transparent',
            color:radius===r?'#00ffcc':'rgba(255,255,255,0.4)'
          }}>
            {r===null?'Any':`${r}mi`}
          </button>
        ))}
      </div>"""

# Insert radius UI after the filters row
if 'Radius:' not in content:
    content = content.replace(
        "{FILTERS.map(",
        radius_ui + "\n      {FILTERS.map("
    )
    with open('components/calendar/CalendarTab.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Added radius selector UI')
else:
    print('Radius UI already present')

print('Done. Run: npm run build')

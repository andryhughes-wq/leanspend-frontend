with open('components/calendar/CalendarTab.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Always load deals even with no preferred stores
DEFAULT_STORES = "['kroger','walmart','heb','target','aldi','costco','samsclub','safeway','randalls']"
content = content.replace(
    "queryFn: () => dealsApi.getWeeklyAds(profile.preferredStores),",
    f"queryFn: () => dealsApi.getWeeklyAds(profile.preferredStores?.length ? profile.preferredStores : {DEFAULT_STORES}),"
)

# Fix 2: Replace just the radius number display with button row
# Find the radius slider input line and replace with buttons
lines = content.split('\n')
new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    # Skip the old radius slider div (contains type="range" or type='range')
    if ("type=\"range\"" in line or "type='range'" in line):
        # Go back and remove the wrapping div too
        if new_lines and '<div' in new_lines[-1]:
            new_lines.pop()
        if new_lines and '<div' in new_lines[-1]:
            new_lines.pop()
        # Skip until closing divs
        depth = 0
        while i < len(lines):
            if '<div' in lines[i]: depth += 1
            if '</div>' in lines[i]:
                if depth <= 0: break
                depth -= 1
            i += 1
        # Add radius buttons instead
        new_lines.append("      <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap',marginBottom:8}}>")
        new_lines.append("        <span style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>Radius:</span>")
        new_lines.append("        {([0,5,10,25,50] as number[]).map((r:number)=>(")
        new_lines.append("          <button key={r} onClick={()=>setRadius(r)} style={{")
        new_lines.append("            padding:'4px 12px',borderRadius:20,fontSize:12,cursor:'pointer',")
        new_lines.append("            border:radius===r?'1px solid rgba(0,255,200,0.5)':'1px solid rgba(255,255,255,0.15)',")
        new_lines.append("            background:radius===r?'rgba(0,255,200,0.1)':'transparent',")
        new_lines.append("            color:radius===r?'#00ffcc':'rgba(255,255,255,0.4)'")
        new_lines.append("          }}>")
        new_lines.append("            {r===0?'Any':`${r}mi`}")
        new_lines.append("          </button>")
        new_lines.append("        ))}")
        new_lines.append("      </div>")
    else:
        new_lines.append(line)
    i += 1

content = '\n'.join(new_lines)

with open('components/calendar/CalendarTab.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')

with open('components/calendar/CalendarTab.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Always fetch deals - use all stores when none selected
DEFAULT_STORES = "['kroger','walmart','heb','target','aldi','costco','samsclub','safeway','randalls']"
content = content.replace(
    "queryFn: () => dealsApi.getWeeklyAds(profile.preferredStores?.length ? profile.preferredStores : undefined),",
    f"queryFn: () => dealsApi.getWeeklyAds(profile.preferredStores?.length ? profile.preferredStores : {DEFAULT_STORES}),"
)
# Also catch original version
content = content.replace(
    "queryFn: () => dealsApi.getWeeklyAds(profile.preferredStores),",
    f"queryFn: () => dealsApi.getWeeklyAds(profile.preferredStores?.length ? profile.preferredStores : {DEFAULT_STORES}),"
)

# Fix 2: Replace the radius slider with buttons
# Find and replace the slider section
import re

# Replace slider with button group
slider_pattern = r'<div[^>]*>[^<]*<span[^>]*>Radius<\/span>.*?<\/div>\s*<input[^>]*type=["\']range["\'][^>]*>.*?<span[^>]*>\{radius\}.*?<\/div>'
button_ui = """<div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
        <span style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginRight:4}}>Radius:</span>
        {([0,5,10,25,50] as number[]).map(r=>(
          <button key={r} onClick={()=>setRadius(r)} style={{
            padding:'5px 12px',borderRadius:20,fontSize:12,cursor:'pointer',
            border:radius===r?'1px solid rgba(0,255,200,0.5)':'1px solid rgba(255,255,255,0.15)',
            background:radius===r?'rgba(0,255,200,0.12)':'transparent',
            color:radius===r?'#00ffcc':'rgba(255,255,255,0.4)',
            transition:'all 0.2s'
          }}>
            {r===0?'Any':`${r}mi`}
          </button>
        ))}
      </div>"""

new_content = re.sub(slider_pattern, button_ui, content, flags=re.DOTALL)
if new_content != content:
    content = new_content
    print('Replaced slider with buttons')
else:
    # Try simpler approach - find the radius div
    print('Slider pattern not matched - trying direct replacement')
    # Look for the radius input range
    if 'type="range"' in content or "type='range'" in content:
        # Find the containing div
        lines = content.split('\n')
        new_lines = []
        skip = False
        i = 0
        while i < len(lines):
            line = lines[i]
            if 'type="range"' in line or "type='range'" in line:
                # Remove this line and surrounding radius div
                skip = True
            elif skip and '</div>' in line:
                skip = False
                i += 1
                continue
            if not skip:
                new_lines.append(line)
            i += 1
        content = '\n'.join(new_lines)

        # Now add button UI after the filter buttons
        content = content.replace(
            '{FILTERS.map(',
            button_ui + '\n      {FILTERS.map('
        )
        print('Added radius buttons via line approach')

with open('components/calendar/CalendarTab.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done. Run: npm run build')

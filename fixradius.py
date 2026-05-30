with open('components/calendar/CalendarTab.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the radius state type and the button null comparison
content = content.replace(
    "const [radius, setRadius] = useState<number|null>(null)",
    "const [radius, setRadius] = useState<number>(0)"
)

# Fix button rendering - 0 means "Any"
content = content.replace(
    "{[null,5,10,25,50].map(r=>(",
    "{[0,5,10,25,50].map(r=>("
)
content = content.replace(
    "radius===r?'1px solid rgba(0,255,200,0.5)':'1px solid rgba(255,255,255,0.15)'",
    "radius===r?'1px solid rgba(0,255,200,0.5)':'1px solid rgba(255,255,255,0.15)'"
)
content = content.replace(
    "{r===null?'Any':`${r}mi`}",
    "{r===0?'Any':`${r}mi`}"
)

with open('components/calendar/CalendarTab.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed radius type')

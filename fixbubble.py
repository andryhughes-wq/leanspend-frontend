with open('components/calendar/CalendarTab.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove RealisticBubble import and usage
content = content.replace("import { RealisticBubble } from '@/components/layout/RealisticBubble'\n", "")
content = content.replace("  const [pops,      setPops]      = useState<{id:number,x:number,y:number}[]>([])\n", "")
content = content.replace("  const popId = {current:0}\n", "")
content = content.replace("""
  const addPop = (x:number,y:number) => {
    const id = ++popId.current
    setPops(p=>[...p,{id,x,y}])
    setTimeout(()=>setPops(p=>p.filter(t=>t.id!==id)),900)
  }
""", "")
content = content.replace("""      {pops.map(p=>(
        <RealisticBubble key={p.id} x={p.x} y={p.y} color="teal" />
      ))}
""", "")
content = content.replace(";addPop(e.clientX,e.clientY)", "")

with open('components/calendar/CalendarTab.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed - removed RealisticBubble')

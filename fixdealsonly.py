with open('components/calendar/CalendarTab.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = "queryFn: () => dealsApi.getWeeklyAds(profile.preferredStores),"
new = "queryFn: () => dealsApi.getWeeklyAds(profile.preferredStores?.length ? profile.preferredStores : ['kroger','walmart','heb','target','aldi','costco','samsclub','safeway','randalls']),"

if old in content:
    content = content.replace(old, new)
    with open('components/calendar/CalendarTab.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Fixed deals query')
else:
    print('Line not found - already fixed or different text')
    print('Searching for queryFn line:')
    for i, line in enumerate(content.split('\n')):
        if 'queryFn' in line and 'deals' in line.lower():
            print(f'{i}: {line}')

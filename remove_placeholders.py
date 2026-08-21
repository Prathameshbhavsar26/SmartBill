import os
import re

src_dir = r'd:\Business Management Dashboard (2)\Business Management Dashboard\src'
exclude_file = 'AuthScreen.jsx'

# Regex to match placeholder="..." or placeholder={'...'} or placeholder={...}
# It's a bit tricky to catch all safely.
# A simpler regex for placeholder="anything" or placeholder={'anything'} or placeholder={nything}
regex = re.compile(r'\s+placeholder\s*=\s*(?:\"[^\"]*\"|\'[^\']*\'|\{.*?})', re.DOTALL)

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            if file == exclude_file:
                continue
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = regex.sub('', content)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {file}")

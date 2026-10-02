import os
import re

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()

    # Replace basic th-TH localestring
    c = c.replace(".toLocaleDateString('th-TH')", ".toLocaleDateString('en-US')")
    c = c.replace(".toLocaleDateString('th-TH',", ".toLocaleDateString('en-US',")

    # Replace language === "th" ? "th-TH" : "en-US"
    c = c.replace('language === "th" ? "th-TH" : "en-US"', '"en-US"')
    c = c.replace("language === 'th' ? 'th-TH' : 'en-US'", "'en-US'")
    
    # Replace other Thai strings that we saw
    # dashboard
    # selectedDateNum ? (language === "th" ? `${selectedDateNum} ...` : `...`)
    
    # Actually, we can just replace the ternary condition string directly if possible, 
    # but it's safer to just replace 'th-TH' with 'en-US'.
    c = c.replace("'th-TH'", "'en-US'")
    c = c.replace('"th-TH"', '"en-US"')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)

clean_file("src/app/admin/page.tsx")
clean_file("src/app/dashboard/page.tsx")

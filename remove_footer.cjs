const fs = require('fs');
const files = [
  'src/app/pages/public/info/AboutPage.jsx',
  'src/app/pages/public/info/StatusPage.jsx',
  'src/app/pages/public/info/HelpCenterPage.jsx',
  'src/app/pages/public/info/PricingPage.jsx',
  'src/app/pages/public/info/CareersPage.jsx',
  'src/app/pages/public/info/ContactPage.jsx',
  'src/app/pages/public/info/FeaturesPage.jsx',
  'src/app/pages/public/info/BlogPage.jsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/import\s+Footer\s+from\s+['"].*Footer['"];?\n?/g, '');
    content = content.replace(/[ \t]*<Footer\s*\/>\n?/g, '');
    fs.writeFileSync(f, content);
    console.log('Processed ' + f);
  }
});

import React from 'react';
import { BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", key: "features" },
        { label: "Pricing", key: "pricing" },
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About", key: "about" },
        { label: "Careers", key: "careers" },
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", key: "help-center" },
        { label: "Contact", key: "contact" },
      ]
    }
  ];

  return (
    <footer className="bg-[#0f1729] text-slate-400 py-12 px-8 border-t border-slate-800 shrink-0 w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Smart Bill</span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs text-slate-400">
            India's most trusted billing and inventory management platform.
          </p>
        </div>

        {footerSections.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-white font-semibold mb-4">{section.title}</h3>
            <ul className="space-y-3 text-sm">
              {section.links.map((link, linkIdx) => (
                <li key={linkIdx}>
                  <Link
                    to={`/${link.key}`}
                    className="hover:text-white transition-colors cursor-pointer text-left block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}




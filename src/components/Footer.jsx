import React from 'react';

export default function Footer({ onNavigate }) {
  const handleLinkClick = (path, e) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className="bg-[#0f1b31] text-white pt-12 mt-auto border-t-3 border-accent">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
          {/* Mission description */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/20 pb-2 inline-block">
              About Ganga Guardian AI
            </h3>
            <p className="text-xs text-white/70 leading-relaxed">
              India's first proactive river pollution intelligence platform. Predicting and preventing contamination in the Ganga basin through AI models and real-time sensor network overlays.
            </p>
          </div>

          {/* Nav links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/20 pb-2 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <a href="/dashboard" onClick={(e) => handleLinkClick('/dashboard', e)} className="hover:text-accent transition-colors">
                  Live Dashboard
                </a>
              </li>
              <li>
                <a href="/alerts" onClick={(e) => handleLinkClick('/alerts', e)} className="hover:text-accent transition-colors">
                  AI Alerts
                </a>
              </li>
              <li>
                <a href="/citizen" onClick={(e) => handleLinkClick('/citizen', e)} className="hover:text-accent transition-colors">
                  Report Pollution Portal
                </a>
              </li>
              <li>
                <a href="/about" onClick={(e) => handleLinkClick('/about', e)} className="hover:text-accent transition-colors">
                  About the Project
                </a>
              </li>
            </ul>
          </div>

          {/* Partner agencies */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/20 pb-2 inline-block">
              Partner Ministries
            </h3>
            <ul className="space-y-2 text-xs text-white/70">
              <li>Ministry of Jal Shakti</li>
              <li>National Mission for Clean Ganga (NMCG)</li>
              <li>Central Pollution Control Board (CPCB)</li>
              <li>Ministry of Environment, Forest & Climate Change</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/20 pb-2 inline-block">
              Contact
            </h3>
            <ul className="space-y-2 text-xs text-white/70">
              <li>National River Intelligence Center</li>
              <li>Shram Shakti Bhawan, New Delhi</li>
              <li>Toll Free: 1800-11-XXXX</li>
              <li>Email: alerts@gangaguardian.gov.in</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-black/30 py-4 text-center border-t border-white/5">
        <p className="text-[10px] text-white/55 font-medium tracking-wide">
          © 2026 Ganga Guardian AI | Ministry of Jal Shakti, Government of India | Powered by CPCB Sensors & NMCG Intelligence
        </p>
      </div>
    </footer>
  );
}

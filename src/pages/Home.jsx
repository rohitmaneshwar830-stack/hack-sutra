import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, Activity, Award, Flame, Zap, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';

export default function Home({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [latestAlert, setLatestAlert] = useState(null);

  const fetchHomeData = async () => {
    try {
      // These will fail gracefully if backend is not logged in, but home page is public.
      // So we handle errors without throwing
      const statsData = await api.get('/dashboard/stats');
      setStats(statsData);

      const alertsData = await api.get('/alerts');
      if (alertsData && alertsData.length > 0) {
        const critical = alertsData.find((a) => a.severity === 'Critical');
        setLatestAlert(critical || alertsData[0]);
      } else {
        setLatestAlert(null);
      }
    } catch (e) {
      console.warn('Backend connection unavailable on Home landing page. Mock states will display.', e);
      setStats({
        untreatedSewage: '2.8 Billion L',
        pollutingIndustries: '1,240+',
        alertLatency: '6–12 Hrs',
        historicBudget: '₹20,000 Cr'
      });
      setLatestAlert(null);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const handleNav = (path, e) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <div className="w-full">
      {/* Alert Warning Bar */}
      <div className="bg-alert-red text-white px-4 py-3.5 flex items-center justify-center space-x-3 shadow-md">
        <AlertTriangle className="h-5 w-5 animate-bounce shrink-0" />
        <p className="text-xs md:text-sm font-bold tracking-wide text-center">
          {latestAlert ? (
            `CRITICAL ALERT: ${latestAlert.title} at ${latestAlert.location} — AI Root Cause: ${latestAlert.source} — Confidence: ${latestAlert.confidence}%`
          ) : (
            'SYSTEM STATUS: Monitoring network active. No critical anomalies detected.'
          )}
        </p>
      </div>

      {/* Hero Section */}
      <section className="bg-primary text-white py-24 px-4 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight font-outfit uppercase leading-tight">
            Ganga Guardian <span className="text-accent">AI</span>
          </h1>
          <p className="text-lg md:text-2xl text-accent font-semibold mb-12 tracking-wide font-sans">
            National River Intelligence System — Predict. Prevent. Protect.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <span className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-xs font-black tracking-widest uppercase text-white shadow-sm transition-all">
              DETECT
            </span>
            <span className="text-white/30 hidden sm:inline">→</span>
            <span className="px-6 py-2.5 bg-accent text-primary rounded-full text-xs font-black tracking-widest uppercase shadow-lg hover:brightness-105 transition-all">
              PREDICT
            </span>
            <span className="text-white/30 hidden sm:inline">→</span>
            <span className="px-6 py-2.5 bg-safe-green rounded-full text-xs font-black tracking-widest uppercase text-white shadow-md hover:bg-safe-green/90 transition-all">
              PREVENT
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-white/80 mb-8">
            <span className="border border-white/15 px-4.5 py-2.5 rounded bg-white/5 shadow-inner">
              CPCB Data Partner
            </span>
            <span className="border border-white/15 px-4.5 py-2.5 rounded bg-white/5 shadow-inner">
              NMCG Integration
            </span>
            <span className="border border-white/15 px-4.5 py-2.5 rounded bg-white/5 shadow-inner">
              Namami Gange Core Project
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={(e) => handleNav('/dashboard', e)}
              className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-2.5 text-sm font-black uppercase tracking-wider text-primary shadow-lg transition hover:brightness-105"
            >
              Explore Dashboard <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => handleNav('/citizen', e)}
              className="inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-white transition hover:bg-white/20"
            >
              Report Pollution <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="max-w-7xl mx-auto px-4 -mt-12 mb-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-150 shadow-xl p-6.5 rounded-sm hover:-translate-y-1 transition-transform duration-300">
            <div className="text-3xl font-black text-primary mb-1 font-outfit">
              {stats?.untreatedSewage || '—'}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold leading-tight">
              Untreated sewage discharged daily
            </div>
          </div>
          <div className="bg-white border border-gray-150 shadow-xl p-6.5 rounded-sm hover:-translate-y-1 transition-transform duration-300">
            <div className="text-3xl font-black text-primary mb-1 font-outfit">
              {stats?.pollutingIndustries || '—'}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold leading-tight">
              Polluting industries in basin
            </div>
          </div>
          <div className="bg-white border border-gray-150 shadow-xl p-6.5 rounded-sm hover:-translate-y-1 transition-transform duration-300">
            <div className="text-3xl font-black mb-1 font-outfit flex items-baseline gap-2">
              <span className="line-through text-gray-400 text-lg font-bold">3–5 Days</span>
              <span className="text-safe-green font-extrabold text-3xl">
                {stats?.alertLatency || '—'}
              </span>
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold leading-tight">
              AI-Optimized Alert Latency
            </div>
          </div>
          <div className="bg-white border border-gray-150 shadow-xl p-6.5 rounded-sm hover:-translate-y-1 transition-transform duration-300">
            <div className="text-3xl font-black text-primary mb-1 font-outfit">
              {stats?.historicBudget || '—'}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold leading-tight">
              Historic budget without AI forecasting
            </div>
          </div>
        </div>
      </section>

      {/* Core Crisis Narrative */}
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <h2 className="text-3xl font-extrabold text-primary border-b-4 border-accent pb-2 inline-block mb-6 font-outfit">
              The River Basin Crisis
            </h2>
            <div className="space-y-4 text-gray-600 text-base leading-relaxed">
              <p>
                Despite massive conservation initiatives, river basin monitoring remains fundamentally reactive. Lab reports and compliance data arrive days or weeks after massive industrial effluents have already contaminated downstream cities and ecosystems.
              </p>
              <p>
                Toxic heavy metal discharges, chemical wastes, and raw municipal sewage plumes create vast hypoxia zones, decimating marine life and endangering the millions of lives that depend daily on the river's flows.
              </p>
              <p>
                We cannot restore the Ganga using historical reports. We need proactive, predictive intelligence layers to identify, map, and halt industrial pollution surges before they disperse.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 bg-red-50/50 border border-red-200 p-8.5 rounded flex flex-col justify-center text-left shadow-sm">
            <h3 className="text-alert-red font-black text-lg mb-6 uppercase tracking-wider font-outfit flex items-center gap-2">
              <Flame className="h-5 w-5" /> Critical Impact Metrics
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-red-200/40 pb-4">
                <span className="text-gray-700 font-semibold text-sm">Hypoxia Dead Zones</span>
                <span className="text-xl font-extrabold text-alert-red font-outfit">47% Ganga Stretch</span>
              </div>
              <div className="flex items-center justify-between border-b border-red-200/40 pb-4">
                <span className="text-gray-700 font-semibold text-sm">Threatened Biodiversity</span>
                <span className="text-xl font-extrabold text-alert-red font-outfit">180+ Species at Risk</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold text-sm">Estimated Economic Loss</span>
                <span className="text-xl font-extrabold text-alert-red font-outfit">₹30,000 Crore</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Layers Grid */}
      <section className="bg-gray-100/60 py-24 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-primary mb-16 font-outfit uppercase">
            The AI Intelligence Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="bg-white p-7 border border-gray-200/60 shadow-sm hover:border-accent transition-colors duration-300 flex flex-col">
              <Activity className="h-9 w-9 text-primary mb-5" />
              <h3 className="text-base font-bold text-gray-900 mb-2 font-outfit">Real-Time Forecasts</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                LSTM neural networks providing 5-day proactive forecasts for Biochemical Oxygen Demand (BOD) and Dissolved Oxygen (DO) levels.
              </p>
            </div>
            <div className="bg-white p-7 border border-gray-200/60 shadow-sm hover:border-accent transition-colors duration-300 flex flex-col">
              <Zap className="h-9 w-9 text-primary mb-5" />
              <h3 className="text-base font-bold text-gray-900 mb-2 font-outfit">AI Root Cause</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Chemical fingerprint models tracing toxic spikes to specific tannery and factory discharge pipelines within 2 hours.
              </p>
            </div>
            <div className="bg-white p-7 border border-gray-200/60 shadow-sm hover:border-accent transition-colors duration-300 flex flex-col">
              <ShieldCheck className="h-9 w-9 text-primary mb-5" />
              <h3 className="text-base font-bold text-gray-900 mb-2 font-outfit">Habitat Risk Assessments</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Automated threat analysis for endangered biodiversity corridors, protecting species like the Gangetic Dolphin and Hilsa.
              </p>
            </div>
            <div className="bg-white p-7 border border-gray-200/60 shadow-sm hover:border-accent transition-colors duration-300 flex flex-col">
              <Award className="h-9 w-9 text-primary mb-5" />
              <h3 className="text-base font-bold text-gray-900 mb-2 font-outfit">Digital Policy Twin</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                High-fidelity simulation engines allowing administrators to model policy impacts (like tannery halts) prior to active deployment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pilot stretch callout */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto bg-primary text-white p-10 rounded shadow-2xl border-t-5 border-accent text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none"></div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-white/70 mb-3">
            Phase 1 Active Pilot Stretch
          </h2>
          <div className="text-4xl font-black text-accent mb-6 font-outfit uppercase tracking-tight">
            Kanpur – Varanasi
          </div>
          <p className="text-sm md:text-base text-white/80 mb-8 leading-relaxed max-w-xl mx-auto font-light">
            Actively tracking a 620-kilometer high-impact stretch of the Ganga basin, integrating physical telemetry nodes and impacting over 40 million citizens.
          </p>
          <div className="inline-block border border-white/20 bg-white/5 px-6 py-2 rounded text-xs font-bold tracking-widest uppercase">
            System Status: 52 Telemetry Nodes Online
          </div>
        </div>
      </section>
    </div>
  );
}

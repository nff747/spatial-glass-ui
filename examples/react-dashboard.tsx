import React from 'react';
import { createRoot } from 'react-dom/client';
import { GlassProvider, GlassPanel, GlassCard, GlassButton, HoloChart } from '../src/react';

const Dashboard = () => {
  return (
    <GlassProvider className="dashboard-container">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px', color: 'white', fontFamily: 'sans-serif' }}>
        <h1 style={{ margin: 0, padding: 0 }}>ORBITAL NETWORKS / v2.4</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '20px' }}>
          <GlassPanel depth={50} cornerRadius={20} style={{ padding: '20px', '--glass-blur': '0.5' } as React.CSSProperties}>
            <h3>Analytics Navigation</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px' }}><GlassButton>Overview</GlassButton></li>
              <li style={{ marginBottom: '10px' }}><GlassButton>Network</GlassButton></li>
              <li style={{ marginBottom: '10px' }}><GlassButton>Settings</GlassButton></li>
            </ul>
          </GlassPanel>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <GlassCard depth={100} style={{ padding: '30px' }}>
                <h2 style={{ margin: 0 }}>Bandwidth</h2>
                <div style={{ fontSize: '48px', fontWeight: 'bold' }}>98.6 Gbps</div>
              </GlassCard>
              <GlassCard depth={100} style={{ padding: '30px' }}>
                <h2 style={{ margin: 0 }}>Latency</h2>
                <div style={{ fontSize: '48px', fontWeight: 'bold' }}>12 ms</div>
              </GlassCard>
            </div>
            
            <HoloChart depth={150} style={{ height: '300px', padding: '20px', '--glass-aberration': '0.2' } as React.CSSProperties}>
              <h3>Waveform Activity</h3>
              <div style={{ width: '100%', height: '80%', borderBottom: '1px solid rgba(255,255,255,0.2)', position: 'relative' }}>
                {/* Placeholder for actual chart drawing */}
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline points="0,50 20,40 40,80 60,20 80,60 100,50" fill="none" stroke="#00ffff" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
                </svg>
              </div>
            </HoloChart>
          </div>
        </div>
      </div>
    </GlassProvider>
  );
};

// Assuming there's a div with id 'root' in the HTML
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<Dashboard />);
}

import { useState, useEffect, type CSSProperties } from 'react';

type Lang = 'KINY' | 'ENG' | 'FRA';

interface Match {
  id: number;
  competition: { name: string; code: string };
  status: string;
  minute?: number;
  utcDate: string;
  homeTeam: { name: string; shortName?: string; crest?: string };
  awayTeam: { name: string; shortName?: string; crest?: string };
  score: { fullTime: { home: number | null; away: number | null } };
}

const TEXT: Record<Lang, any> = {
  KINY: { all: 'Amashampiyona Yose', intl: '🌍 Ibihugu (WC & Euro)', search: 'Shakisha ikipe cyangwa irushanwa...', up: '📅 Imikino Izaba', live: '🔴 Iri Kuba', fin: '✅ Iyarangiye', yose: 'Yose', ref: '🔄 Kuvugurura', load: "Gushaka amakuru y'imikino...", none: 'Nta mikino ibonetse.', ft: 'FT (Yarangiye)', dev: 'Yakozwe na Janvier Mwiseneza' },
  ENG: { all: 'All Competitions', intl: '🌍 International (WC & Euro)', search: 'Search teams or competitions...', up: '📅 Upcoming', live: '🔴 Live Now', fin: '✅ Finished', yose: 'All', ref: '🔄 Refresh', load: 'Loading matches...', none: 'No matches found.', ft: 'FT (Finished)', dev: 'Designed & Developed by Janvier Mwiseneza' },
  FRA: { all: 'Toutes les Compétitions', intl: '🌍 Sélections (WC & Euro)', search: 'Rechercher une équipe...', up: '📅 À Venir', live: '🔴 En Direct', fin: '✅ Terminés', yose: 'Tous', ref: '🔄 Actualiser', load: 'Chargement...', none: 'Aucun match trouvé.', ft: 'Terminé', dev: 'Conçu et Développé par Janvier Mwiseneza' },
};

export default function App() {
  const [lang, setLang] = useState<Lang>('KINY');
  const [matches, setMatches] = useState<Match[]>([]);
  const [league, setLeague] = useState('ALL');
  const [tab, setTab] = useState('UPCOMING');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const t = TEXT[lang];

  const leagues = [
    { c: 'ALL', n: t.all }, { c: 'INTL', n: t.intl }, { c: 'PL', n: 'Premier League' },
    { c: 'PD', n: 'La Liga' }, { c: 'SA', n: 'Serie A' }, { c: 'BL1', n: 'Bundesliga' },
    { c: 'FL1', n: 'Ligue 1' }, { c: 'CL', n: 'Champions League' },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/matches');
      const d = await r.json();
      setMatches(d.matches || []);
    } catch { setMatches([]); }
    setLoading(false);
  };

  useEffect(() => { load(); const i = setInterval(load, 60000); return () => clearInterval(i); }, []);

  const list = matches.filter((m) => {
    const c = m.competition?.code || '';
    const okL = league === 'ALL' ? true : league === 'INTL' ? ['WC', 'EC', 'CLI'].includes(c) : c === league;
    const s = q.trim().toLowerCase();
    const okQ = !s || [m.homeTeam?.name, m.homeTeam?.shortName, m.awayTeam?.name, m.awayTeam?.shortName, m.competition?.name].some((v) => v?.toLowerCase().includes(s));
    if (!okL || !okQ) return false;
    if (tab === 'UPCOMING') return ['TIMED', 'SCHEDULED'].includes(m.status);
    if (tab === 'LIVE') return ['IN_PLAY', 'PAUSED'].includes(m.status);
    if (tab === 'FINISHED') return m.status === 'FINISHED';
    return true;
  });

  const fmt = (u: string) => {
    const d = new Date(u);
    return `${d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div style={st.wrap}>
      <header style={st.head}>
        <div style={st.hIn}>
          <div style={st.logoRow}>
            <img src="/Kigali Update Score Sports Badge.png" alt="Logo" style={st.logo} />
            <div>
              <h1 style={st.title}>Kigali Update Score</h1>
              <div style={st.sub}><span style={st.dot} /> LIVE SCORES & FIXTURES</div>
            </div>
          </div>
          <div style={st.langs}>
            {(['KINY', 'ENG', 'FRA'] as Lang[]).map((k) => (
              <button key={k} onClick={() => setLang(k)} style={{ ...st.lBtn, ...(lang === k ? st.lAct : {}) }}>{k}</button>
            ))}
          </div>
        </div>
      </header>

      <main style={st.main}>
        <div style={st.sBox}>
          <span style={st.sIco}>🔍</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} style={st.sInp} />
          {q && <button onClick={() => setQ('')} style={st.clr}>✕</button>}
        </div>

        <div style={st.tabs}>
          {[{ id: 'UPCOMING', l: t.up }, { id: 'LIVE', l: t.live }, { id: 'FINISHED', l: t.fin }, { id: 'ALL', l: t.yose }].map((b) => (
            <button key={b.id} onClick={() => setTab(b.id)} style={{ ...st.tBtn, ...(tab === b.id ? st.tAct : {}) }}>{b.l}</button>
          ))}
          <button onClick={load} style={st.ref}>{t.ref}</button>
        </div>

        <div style={st.lBar}>
          {leagues.map((l) => (
            <button key={l.c} onClick={() => setLeague(l.c)} style={{ ...st.cBtn, ...(league === l.c ? st.cAct : {}) }}>{l.n}</button>
          ))}
        </div>

        {loading ? <div style={st.msg}>{t.load}</div> : list.length === 0 ? <div style={st.msg}>{t.none}</div> : (
          <div style={st.list}>
            {list.map((m) => {
              const live = ['IN_PLAY', 'PAUSED'].includes(m.status);
              const fin = m.status === 'FINISHED';
              return (
                <div key={m.id} style={st.card}>
                  <div style={st.cHead}>
                    <span style={st.lName}>{m.competition?.name}</span>
                    <span style={{ fontWeight: 700, color: live ? '#ff4d4f' : fin ? '#9ca3af' : '#38bdf8' }}>
                      {live ? `LIVE ${m.minute ? `${m.minute}'` : ''}` : fin ? t.ft : fmt(m.utcDate)}
                    </span>
                  </div>
                  <div style={st.teams}>
                    <div style={st.side}>
                      {m.homeTeam.crest && <img src={m.homeTeam.crest} alt="" style={st.crest} />}
                      <span style={st.tName}>{m.homeTeam.shortName || m.homeTeam.name}</span>
                    </div>
                    <div style={st.score}>
                      <span>{m.score.fullTime.home ?? '-'}</span>
                      <span style={{ color: '#6b7280' }}>:</span>
                      <span>{m.score.fullTime.away ?? '-'}</span>
                    </div>
                    <div style={{ ...st.side, justifyContent: 'flex-end' }}>
                      <span style={st.tName}>{m.awayTeam.shortName || m.awayTeam.name}</span>
                      {m.awayTeam.crest && <img src={m.awayTeam.crest} alt="" style={st.crest} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer style={st.foot}>
        <p style={st.fTxt}>© {new Date().getFullYear()} <strong>Kigali Update Score</strong> • {t.dev}</p>
      </footer>
    </div>
  );
}

const st: Record<string, CSSProperties> = {
  wrap: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0b0f19', color: '#f3f4f6', fontFamily: 'system-ui, sans-serif' },
  head: { background: '#111827', borderBottom: '1px solid #1f2937', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 10 },
  hIn: { maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  logoRow: { display: 'flex', alignItems: 'center', gap: 12 },
  logo: { height: 58, width: 'auto', borderRadius: 8, objectFit: 'contain' },
  title: { margin: 0, fontSize: 20, fontWeight: 800, color: '#fff' },
  sub: { display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: 11, fontWeight: 700, marginTop: 2 },
  dot: { width: 7, height: 7, borderRadius: '50%', background: '#ef4444' },
  langs: { display: 'flex', gap: 6, background: '#0b0f19', padding: 4, borderRadius: 8, border: '1px solid #1f2937' },
  lBtn: { background: 'transparent', color: '#9ca3af', border: 'none', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 },
  lAct: { background: '#2563eb', color: '#fff' },
  main: { flex: 1, width: '100%', maxWidth: 800, margin: '0 auto', padding: '20px 16px', boxSizing: 'border-box' },
  sBox: { position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 16 },
  sIco: { position: 'absolute', left: 14, fontSize: 15 },
  sInp: { width: '100%', background: '#111827', border: '1px solid #374151', borderRadius: 24, padding: '11px 40px', color: '#fff', fontSize: 14, outline: 'none' },
  clr: { position: 'absolute', right: 14, background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' },
  tabs: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 },
  tBtn: { background: '#1f2937', color: '#d1d5db', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  tAct: { background: '#ef4444', color: '#fff' },
  ref: { marginLeft: 'auto', background: '#111827', color: '#9ca3af', border: '1px solid #374151', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  lBar: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 16 },
  cBtn: { background: '#111827', color: '#9ca3af', border: '1px solid #1f2937', padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' },
  cAct: { background: '#2563eb', color: '#fff', borderColor: '#2563eb' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '14px 16px' },
  cHead: { display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 12 },
  lName: { color: '#9ca3af', fontWeight: 600 },
  teams: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 },
  side: { display: 'flex', alignItems: 'center', gap: 10 },
  crest: { width: 24, height: 24, objectFit: 'contain' },};

import { useState, useEffect, type CSSProperties } from 'react';

type Lang = 'KINY' | 'ENG' | 'FRA';

const TXT: Record<Lang, any> = {
  KINY: { all: 'Imikino Yose', s: 'Shakisha ikipe cyangwa irushanwa...', up: '📅 Izaba', lv: '🔴 Live', fn: '✅ Iyarangiye', ys: 'Yose', m: '⚽ Imikino', st: '🏆 Urutonde', sc: '👟 Abatsinze', tm: '🛡️ Amakipe', ld: "Gushaka amakuru...", no: 'Nta makuru abonetse.', ft: 'FT', dev: 'Yakozwe na Janvier Mwiseneza', sm: 'Ibyabaye', ln: 'Lineups', tb: 'Urutonde', h2: 'H2H', vn: 'Ikibuga', rf: 'Umusifuzi', lw: 'Lineup ijyaho habura isaha 1 ngo umukino utangire.' },
  ENG: { all: 'All Matches', s: 'Search team or competition...', up: '📅 Upcoming', lv: '🔴 Live', fn: '✅ Finished', ys: 'All', m: '⚽ Matches', st: '🏆 Standings', sc: '👟 Top Scorers', tm: '🛡️ Teams', ld: 'Loading...', no: 'No data found.', ft: 'FT', dev: 'Designed & Developed by Janvier Mwiseneza', sm: 'Events', ln: 'Lineups', tb: 'Table', h2: 'H2H', vn: 'Stadium', rf: 'Referee', lw: 'Lineups released ~1h before kickoff.' },
  FRA: { all: 'Tous les Matchs', s: 'Rechercher équipe ou compétition...', up: '📅 À Venir', lv: '🔴 Direct', fn: '✅ Terminés', ys: 'Tous', m: '⚽ Matchs', st: '🏆 Classement', sc: '👟 Buteurs', tm: '🛡️ Équipes', ld: 'Chargement...', no: 'Aucune donnée.', ft: 'Terminé', dev: 'Conçu par Janvier Mwiseneza', sm: 'Faits', ln: 'Compos', tb: 'Classement', h2: 'H2H', vn: 'Stade', rf: 'Arbitre', lw: 'Compos publiées ~1h avant le match.' },
};

export default function App() {
  const [lang, setLang] = useState<Lang>('KINY');
  const [comps, setComps] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('kc5') || '[]'); } catch { return []; } });
  const [matches, setMatches] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('km5') || '[]'); } catch { return []; } });
  const [lg, setLg] = useState('ALL');
  const [vw, setVw] = useState<'M' | 'ST' | 'SC' | 'TM'>('M');
  const [tab, setTab] = useState('ALL');
  const [q, setQ] = useState('');
  const [ld, setLd] = useState(matches.length === 0);
  const [tbl, setTbl] = useState<any[]>([]);
  const [scr, setScr] = useState<any[]>([]);
  const [tms, setTms] = useState<any[]>([]);
  const [exLd, setExLd] = useState(false);
  const [sel, setSel] = useState<any>(null);
  const [mt, setMt] = useState<'SM' | 'LN' | 'TB' | 'H2'>('SM');
  const [det, setDet] = useState<any>(null);
  const [mTbl, setMTbl] = useState<any[]>([]);
  const [h2h, setH2h] = useState<any[]>([]);
  const [mLd, setMLd] = useState(false);
  const t = TXT[lang];

  useEffect(() => {
    fetch('/api/matches?type=competitions').then(r => r.json()).then(d => {
      if (Array.isArray(d.competitions)) { setComps(d.competitions); localStorage.setItem('kc5', JSON.stringify(d.competitions)); }
    }).catch(() => {});
  }, []);

  const load = async (c = lg) => {
    if (matches.length === 0) setLd(true);
    try {
      const d = await fetch(c === 'ALL' ? '/api/matches' : `/api/matches?type=comp_matches&code=${c}`).then(r => r.json());
      if (Array.isArray(d.matches)) { setMatches(d.matches); if (c === 'ALL') localStorage.setItem('km5', JSON.stringify(d.matches)); }
    } catch {}
    setLd(false);
  };

  useEffect(() => { load(lg); const i = setInterval(() => load(lg), 30000); return () => clearInterval(i); }, [lg]);

  useEffect(() => {
    if (vw === 'M') return;
    const c = lg === 'ALL' ? (comps.at(0)?.code || 'PL') : lg;
    if (lg === 'ALL') setLg(c);
    setExLd(true);
    const ep = vw === 'ST' ? 'standings' : vw === 'SC' ? 'scorers' : 'teams';
    fetch(`/api/matches?type=${ep}&code=${c}`).then(r => r.json()).then(res => {
      if (vw === 'ST') setTbl((Array.isArray(res?.standings) ? res.standings.at(0)?.table : []) || []);
      if (vw === 'SC') setScr(res?.scorers || []);
      if (vw === 'TM') setTms(res?.teams || []);
    }).catch(() => {}).finally(() => setExLd(false));
  }, [vw, lg]);

  const openM = async (m: any) => {
    setSel(m); setMt('SM'); setMLd(true); setDet(null); setMTbl([]); setH2h([]);
    try {
      const [d1, d2, d3] = await Promise.all([
        fetch(`/api/matches?type=detail&id=${m.id}`).then(r => r.json()),
        fetch(`/api/matches?type=standings&code=${m.competition?.code}`).then(r => r.json()),
        fetch(`/api/matches?type=h2h&id=${m.id}`).then(r => r.json()),
      ]);
      setDet(d1); setMTbl((Array.isArray(d2?.standings) ? d2.standings.at(0)?.table : []) || []); setH2h(d3?.matches || []);
    } catch {}
    setMLd(false);
  };

  const list = matches.filter(m => {
    const s = q.trim().toLowerCase();
    if (s && ![m.homeTeam?.name, m.homeTeam?.shortName, m.awayTeam?.name, m.awayTeam?.shortName, m.competition?.name].some(v => v?.toLowerCase().includes(s))) return false;
    if (tab === 'UP') return ['TIMED', 'SCHEDULED'].includes(m.status);
    if (tab === 'LV') return ['IN_PLAY', 'PAUSED'].includes(m.status);
    if (tab === 'FN') return m.status === 'FINISHED';
    return true;
  });

  const fmt = (u: string) => { const d = new Date(u); return `${d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`; };
  const refObj = Array.isArray(det?.referees) ? det.referees.at(0) : null;


  return (
    <div style={st.wrap}>
      <header style={st.head}>
        <div style={st.hIn}>
          <div style={st.logoRow} onClick={() => { setVw('M'); setLg('ALL'); }}>
            <img src="/Kigali Update Score Sports Badge.png" alt="Logo" style={st.logo} />
            <div><h1 style={st.title}>Kigali Update Score</h1><div style={st.sub}><span style={st.dot} /> LIVE SCORES • STATS • STANDINGS</div></div>
          </div>
          <div style={st.langs}>{(['KINY', 'ENG', 'FRA'] as Lang[]).map(k => <button key={k} onClick={() => setLang(k)} style={{ ...st.lBtn, ...(lang === k ? st.lAct : {}) }}>{k}</button>)}</div>
        </div>
      </header>
      <main style={st.main}>
        <div style={st.sBox}><span style={st.sIco}>🔍</span><input value={q} onChange={e => setQ(e.target.value)} placeholder={t.s} style={st.sInp} />{q && <button onClick={() => setQ('')} style={st.clr}>✕</button>}</div>
        <div style={st.modeRow}>
          {[{ id: 'M', l: t.m }, { id: 'ST', l: t.st }, { id: 'SC', l: t.sc }, { id: 'TM', l: t.tm }].map(b => <button key={b.id} onClick={() => setVw(b.id as any)} style={{ ...st.modeBtn, ...(vw === b.id ? st.modeAct : {}) }}>{b.l}</button>)}
        </div>
        <div style={st.lBar}>
          <button onClick={() => { setVw('M'); setLg('ALL'); }} style={{ ...st.cBtn, ...(lg === 'ALL' ? st.cAct : {}) }}>🌍 {t.all}</button>
          {comps.map((c: any) => <button key={c.code} onClick={() => setLg(c.code)} style={{ ...st.cBtn, ...(lg === c.code ? st.cAct : {}) }}>{c.emblem && <img src={c.emblem} alt="" style={{ width: 16, height: 16 }} />} {c.name}</button>)}
        </div>
        {vw === 'M' && (<>
          <div style={st.tabs}>{[{ id: 'ALL', l: `${t.ys} (${matches.length})` }, { id: 'LV', l: t.lv }, { id: 'UP', l: t.up }, { id: 'FN', l: t.fn }].map(b => <button key={b.id} onClick={() => setTab(b.id)} style={{ ...st.tBtn, ...(tab === b.id ? st.tAct : {}) }}>{b.l}</button>)}</div>
          {ld ? <div style={st.msg}>{t.ld}</div> : list.length === 0 ? <div style={st.msg}>{t.no}</div> : <div style={st.list}>{list.map(m => {
            const live = ['IN_PLAY', 'PAUSED'].includes(m.status), fin = m.status === 'FINISHED';
            return (<div key={m.id} onClick={() => openM(m)} style={{ ...st.card, borderColor: live ? '#ef4444' : 'rgba(255,255,255,0.08)' }}>
              <div style={st.cHead}><span style={st.lName}>{m.competition?.name}</span><span style={{ fontWeight: 700, color: live ? '#f87171' : fin ? '#94a3b8' : '#38bdf8' }}>{live ? `● LIVE ${m.minute ? `${m.minute}'` : ''}` : fin ? `${t.ft} • ${fmt(m.utcDate)}` : fmt(m.utcDate)}</span></div>
              <div style={st.teams}>
                <div style={st.side}>{m.homeTeam.crest && <img src={m.homeTeam.crest} alt="" style={st.crest} />}<span style={st.tName}>{m.homeTeam.shortName || m.homeTeam.name}</span></div>
                <div style={{ ...st.score, background: live ? 'rgba(220,38,38,0.3)' : '#0f172a' }}><span>{m.score.fullTime.home ?? '-'}</span><span style={{ color: '#64748b' }}>:</span><span>{m.score.fullTime.away ?? '-'}</span></div>
                <div style={{ ...st.side, justifyContent: 'flex-end' }}><span style={st.tName}>{m.awayTeam.shortName || m.awayTeam.name}</span>{m.awayTeam.crest && <img src={m.awayTeam.crest} alt="" style={st.crest} />}</div>
              </div>
            </div>);
          })}</div>}
        </>)}
        {vw === 'ST' && <div style={st.panel}>{exLd ? <div style={st.msg}>{t.ld}</div> : <table style={st.tbl}><thead><tr style={{ color: '#94a3b8', fontSize: 12 }}><th style={st.th}>#</th><th style={{ ...st.th, textAlign: 'left' }}>Team</th><th style={st.th}>P</th><th style={st.th}>GD</th><th style={st.th}>PTS</th></tr></thead><tbody>{tbl.map((r: any) => <tr key={r.position} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}><td style={st.td}>{r.position}</td><td style={{ ...st.td, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>{r.team?.crest && <img src={r.team.crest} alt="" style={{ width: 20, height: 20 }} />}{r.team?.shortName || r.team?.name}</td><td style={st.td}>{r.playedGames}</td><td style={st.td}>{r.goalDifference}</td><td style={{ ...st.td, fontWeight: 800, color: '#38bdf8' }}>{r.points}</td></tr>)}</tbody></table>}</div>}
        {vw === 'SC' && <div style={st.panel}>{exLd ? <div style={st.msg}>{t.ld}</div> : <table style={st.tbl}><thead><tr style={{ color: '#94a3b8', fontSize: 12 }}><th style={st.th}>#</th><th style={{ ...st.th, textAlign: 'left' }}>Player</th><th style={{ ...st.th, textAlign: 'left' }}>Club</th><th style={st.th}>⚽</th><th style={st.th}>🎯</th></tr></thead><tbody>{scr.map((sc: any, i: number) => <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}><td style={st.td}>{i + 1}</td><td style={{ ...st.td, textAlign: 'left', fontWeight: 700 }}>{sc.player?.name}</td><td style={{ ...st.td, textAlign: 'left', color: '#94a3b8' }}>{sc.team?.shortName}</td><td style={{ ...st.td, fontWeight: 800, color: '#4ade80' }}>{sc.goals}</td><td style={st.td}>{sc.assists ?? 0}</td></tr>)}</tbody></table>}</div>}
        {vw === 'TM' && <div style={st.teamGrid}>{exLd ? <div style={st.msg}>{t.ld}</div> : tms.map((tm: any) => <div key={tm.id} style={st.teamCard}>{tm.crest && <img src={tm.crest} alt="" style={{ width: 44, height: 44, marginBottom: 8 }} />}<div style={{ fontWeight: 700 }}>{tm.name}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>🏟️ {tm.venue}</div></div>)}</div>}
      </main>
      {sel && (<div style={st.modalBg} onClick={() => setSel(null)}><div style={st.modalBox} onClick={e => e.stopPropagation()}>
        <div style={st.mTop}><span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700 }}>{sel.competition?.name}</span><button onClick={() => setSel(null)} style={st.closeBtn}>✕</button></div>
        <div style={st.mHero}>
          <div style={st.mTeam}>{sel.homeTeam.crest && <img src={sel.homeTeam.crest} alt="" style={st.mCrest} />}<div style={{ fontWeight: 700, fontSize: 14, marginTop: 6 }}>{sel.homeTeam.shortName || sel.homeTeam.name}</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800 }}>{['TIMED', 'SCHEDULED'].includes(sel.status) ? new Date(sel.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${sel.score.fullTime.home ?? 0} : ${sel.score.fullTime.away ?? 0}`}</div><div style={{ fontSize: 12, color: '#38bdf8', marginTop: 4 }}>{fmt(sel.utcDate)}</div></div>
          <div style={st.mTeam}>{sel.awayTeam.crest && <img src={sel.awayTeam.crest} alt="" style={st.mCrest} />}<div style={{ fontWeight: 700, fontSize: 14, marginTop: 6 }}>{sel.awayTeam.shortName || sel.awayTeam.name}</div></div>
        </div>
        <div style={st.mTabs}>{[{ id: 'SM', l: t.sm }, { id: 'LN', l: t.ln }, { id: 'TB', l: t.tb }, { id: 'H2', l: t.h2 }].map(k => <button key={k.id} onClick={() => setMt(k.id as any)} style={{ ...st.mTabBtn, ...(mt === k.id ? st.mTabAct : {}) }}>{k.l}</button>)}</div>
        <div style={st.mBody}>{mLd ? <div style={st.msg}>{t.ld}</div> : mt === 'SM' ? <div style={{ fontSize: 13 }}><div style={st.infoBox}><span>🏟️ <strong>{t.vn}:</strong> {det?.venue || 'N/A'}</span>{refObj && <span>👨‍⚖️ <strong>{t.rf}:</strong> {refObj.name}</span>}</div>{Array.isArray(det?.goals) && det.goals.map((g: any, i: number) => <div key={i} style={st.evRow}><span>⚽ <strong>{g.scorer?.name}</strong> ({g.team?.name})</span><span style={{ color: '#4ade80', fontWeight: 700 }}>{g.minute}'</span></div>)}</div> : mt === 'LN' ? (det?.homeTeam?.lineup?.length > 0 ? <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}><div style={st.lineupCol}><strong>{sel.homeTeam.shortName}</strong>{det.homeTeam.lineup.map((p: any) => <div key={p.id}>#{p.shirtNumber} {p.name}</div>)}</div><div style={st.lineupCol}><strong>{sel.awayTeam.shortName}</strong>{det.awayTeam.lineup.map((p: any) => <div key={p.id}>#{p.shirtNumber} {p.name}</div>)}</div></div> : <div style={st.msg}>{t.lw}</div>) : mt === 'TB' ? <table style={st.tbl}><thead><tr style={{ color: '#94a3b8', fontSize: 12 }}><th style={st.th}>#</th><th style={{ ...st.th, textAlign: 'left' }}>Team</th><th style={st.th}>P</th><th style={st.th}>GD</th><th style={st.th}>PTS</th></tr></thead><tbody>{mTbl.map((r: any) => <tr key={r.position} style={{ background: [sel.homeTeam.id, sel.awayTeam.id].includes(r.team?.id) ? 'rgba(56,189,248,0.16)' : 'transparent', borderTop: '1px solid rgba(255,255,255,0.06)' }}><td style={st.td}>{r.position}</td><td style={{ ...st.td, textAlign: 'left' }}>{r.team?.shortName}</td><td style={st.td}>{r.playedGames}</td><td style={st.td}>{r.goalDifference}</td><td style={{ ...st.td, fontWeight: 800 }}>{r.points}</td></tr>)}</tbody></table> : h2h.map((hm: any) => <div key={hm.id} style={st.evRow}><span style={{ color: '#94a3b8' }}>{hm.utcDate?.slice(0, 10)}</span><span><strong>{hm.homeTeam?.shortName}</strong> {hm.score?.fullTime?.home ?? '-'} : {hm.score?.fullTime?.away ?? '-'} <strong>{hm.awayTeam?.shortName}</strong></span></div>)}</div>
      </div></div>)}
      <footer style={st.foot}><p style={st.fTxt}>© {new Date().getFullYear()} <strong>Kigali Update Score</strong> • {t.dev}</p></footer>
    </div>
  );
}

const st: Record<string, CSSProperties> = {
  wrap: { minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', background: 'radial-gradient(ellipse at top, #132238 0%, #090e1a 55%, #04070d 100%)', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', overflowX: 'hidden' },
  head: { background: 'rgba(9,14,26,0.88)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 10 },
  hIn: { width: '100%', maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  logoRow: { display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' },};

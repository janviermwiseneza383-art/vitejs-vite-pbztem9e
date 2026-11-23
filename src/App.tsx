  const delCustomMatch = (id: number) => { const next = customMatches.filter(x => x.id !== id); setCustomMatches(next); localStorage.setItem('kus_custom5', JSON.stringify(next)); };
  const toggleFav = (e: any, id: number) => { e.stopPropagation(); const nx = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id]; setFavs(nx); localStorage.setItem('kus_f28', JSON.stringify(nx)); };

  const openMatch = async (m: any) => {
    setSel(m); setMTab('INFO'); setDet(null); setMTbl([]); setH2h([]);
    if (m.competition?.code === 'SCHOOL') return;
    const [d1, d2, d3] = await Promise.all([
      fetch(`/api/matches?type=detail&id=${m.id}`).then(r => r.json()).catch(() => null),
      fetch(`/api/matches?type=standings&code=${m.competition?.code}`).then(r => r.json()).catch(() => null),
      fetch(`/api/matches?type=h2h&id=${m.id}`).then(r => r.json()).catch(() => null),
    ]);
    setDet(d1); setMTbl((Array.isArray(d2?.standings) ? d2.standings.at(0)?.table : []) || []); setH2h(d3?.matches || []);
  };

  const allShown = lg === 'ALL' ? [...customMatches, ...matches] : matches;
  const list = allShown.filter(m => {
    if (st === 'FAV' && !favs.includes(m.id)) return false;
    const s = q.trim().toLowerCase();
    if (s && ![m.homeTeam?.name, m.homeTeam?.shortName, m.awayTeam?.name, m.awayTeam?.shortName, m.competition?.name].some(v => v?.toLowerCase().includes(s))) return false;
    if (st === 'LV') return ['IN_PLAY', 'PAUSED'].includes(m.status);
    if (st === 'UP') return ['TIMED', 'SCHEDULED'].includes(m.status);
    if (st === 'FN') return m.status === 'FINISHED';
    return true;
  });

  const formatStatus = (m: any) => {
    const live = ['IN_PLAY', 'PAUSED'].includes(m.status);
    const hasPen = m.score?.duration === 'PENALTY_SHOOTOUT' || (m.score?.penalties && m.score.penalties.home !== null);
    if (live) return `${m.minute || 'LIVE'}${m.injuryTime ? `+${m.injuryTime}` : ''}'`;
    if (m.status === 'FINISHED') return hasPen ? 'PEN' : 'FT';
    return new Date(m.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <header className="topbar"><div className="top-in">
        <div className="brand" onClick={handleBrandClick}><img src="/Kigali Update Score Sports Badge.png" alt="Logo" /><h1>KIGALI UPDATE SCORE</h1></div>
        <div className="top-acts">
          {isAdmin && <button className="adm-btn" onClick={() => setIsAdmin(false)}>← Exit Admin</button>}
          <div className="langs">{(['KINY', 'ENG', 'FRA'] as Lang[]).map(k => <button key={k} className={lang === k ? 'act' : ''} onClick={() => setLang(k)}>{k}</button>)}</div>
        </div>
      </div></header>

      {showLogin && (
        <div className="modal-bg" onClick={() => setShowLogin(false)}>
          <form className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()} onSubmit={handleLogin}>
            <div className="sec-lbl">🔐 ADMIN LOGIN (JANVIER ONLY)</div>
            <input className="inp" type="password" value={passInput} onChange={e => setPassInput(e.target.value)} placeholder="••••••••••••" autoFocus required />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn-pri" style={{ flex: 1 }}>Login</button>
              <button type="button" className="btn-del" style={{ padding: '10px 14px', fontSize: 13 }} onClick={() => setShowLogin(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {isAdmin ? (
        <main className="adm-wrap">
          <div className="box">
            <div className="sec-lbl">+ ADD NEW MATCH (DATE, TIME, ADDED TIME & PENALTIES)</div>
            <form onSubmit={addCustomMatch}>
              <div className="form-grid">
                <input className="inp" value={form.home} onChange={e => setForm({ ...form, home: e.target.value })} placeholder="Home Team" required />
                <input className="inp" value={form.away} onChange={e => setForm({ ...form, away: e.target.value })} placeholder="Away Team" required />
                <input className="inp" value={form.comp} onChange={e => setForm({ ...form, comp: e.target.value })} placeholder="Competition" required />
                <input className="inp" type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                <input className="inp" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Venue / Pitch" />
                <select className="inp" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="TIMED">Upcoming (Scheduled)</option><option value="IN_PLAY">Live Now</option><option value="FINISHED">Finished (FT / PEN)</option></select>
                <input className="inp" type="number" value={form.hs} onChange={e => setForm({ ...form, hs: e.target.value })} placeholder="Home Goals" />
                <input className="inp" type="number" value={form.as} onChange={e => setForm({ ...form, as: e.target.value })} placeholder="Away Goals" />
                <input className="inp" type="number" value={form.min} onChange={e => setForm({ ...form, min: e.target.value })} placeholder="Minute (90)" />
                <input className="inp" type="number" value={form.added} onChange={e => setForm({ ...form, added: e.target.value })} placeholder="Added Time (+4)" />
                <input className="inp" type="number" value={form.penH} onChange={e => setForm({ ...form, penH: e.target.value })} placeholder="Home Pen (optional)" />
                <input className="inp" type="number" value={form.penA} onChange={e => setForm({ ...form, penA: e.target.value })} placeholder="Away Pen (optional)" />
              </div>
              <button type="submit" className="btn-pri">💾 Save Match</button>
            </form>
          </div>
          <div className="box">
            <div className="sec-lbl">MANAGE ADDED MATCHES ({customMatches.length})</div>
            {customMatches.map(cm => <div key={cm.id} className="ev"><span><strong>{cm.homeTeam.name}</strong> {cm.score.fullTime.home ?? '-'} - {cm.score.fullTime.away ?? '-'} <strong>{cm.awayTeam.name}</strong> ({new Date(cm.utcDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})</span><button className="btn-del" onClick={() => delCustomMatch(cm.id)}>Delete</button></div>)}
          </div>
          <div className="box">
            <div className="sec-lbl">💰 MOMO SPONSORSHIP & ADS BANNER</div>
            <input className="inp" value={momoNum} onChange={e => { setMomoNum(e.target.value); localStorage.setItem('kus_momo', e.target.value); const txt = `📢 Advertise on Kigali Update Score • Pay via MTN MoMo: ${e.target.value}`; setAdBanner(txt); localStorage.setItem('kus_ad5', txt); }} placeholder="Your MTN MoMo Number" />
            <input className="inp" value={adBanner} onChange={e => { setAdBanner(e.target.value); localStorage.setItem('kus_ad5', e.target.value); }} placeholder="Banner Text" />
          </div>
        </main>
      ) : (
        <main className="grid-3">
          <aside>
            <div className="box"><div className="sec-lbl">LIVE</div>{[{ id: 'ALL', l: t.all }, { id: 'LV', l: `🔴 ${t.lv}` }, { id: 'UP', l: t.up }, { id: 'FN', l: t.fn }, { id: 'FAV', l: `★ ${t.fav} (${favs.length})` }].map(b => <button key={b.id} className={`nav-item ${st === b.id ? 'act' : ''}`} onClick={() => setSt(b.id)}>{b.l}</button>)}</div>
            <div className="box"><div className="sec-lbl">POPULAR COMPETITIONS</div>{POPULAR.map(p => <button key={p.code} className={`nav-item ${lg === p.code ? 'act' : ''}`} onClick={() => { setLg(p.code); setSideLg(p.code === 'SCHOOL' ? 'RW1' : p.code); }}><CompLogo p={p} /><span>{p.name}</span></button>)}</div>
          </aside>
          <section>
            <div className="ad-box">{adBanner}</div>
            <div className="sec-lbl" style={{ paddingLeft: 4 }}>MATCHES ({list.length})</div>
            {list.map(m => {
              const live = ['IN_PLAY', 'PAUSED'].includes(m.status);
              const hasPen = m.score?.duration === 'PENALTY_SHOOTOUT' || (m.score?.penalties && m.score.penalties.home !== null);
              return (<div key={m.id} className={`m-card ${live ? 'live' : ''}`} onClick={() => openMatch(m)}>
                <div className="m-top"><span style={{ fontWeight: 700, color: '#d4d4d4' }}>{m.competition?.name}</span><span>{new Date(m.utcDate).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date(m.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                <div className="m-row">
                  <span className={live ? 'tm-live' : ''} style={{ fontSize: 12, color: live ? '#ff6b00' : '#9ca3af' }}>{formatStatus(m)}</span>
                  <div className="tm h"><span>{m.homeTeam.shortName || m.homeTeam.name}</span><Crest tm={m.homeTeam} /></div>
                  <div className={`sc ${live ? 'live' : ''}`}><div>{m.score.fullTime.home ?? '-'} - {m.score.fullTime.away ?? '-'}</div>{hasPen && <div style={{ fontSize: 10, color: '#facc15' }}>Pen: {m.score.penalties.home} - {m.score.penalties.away}</div>}</div>
                  <div className="tm"><Crest tm={m.awayTeam} /><span>{m.awayTeam.shortName || m.awayTeam.name}</span></div>
                  <button className={`star ${favs.includes(m.id) ? 'fav' : ''}`} onClick={e => toggleFav(e, m.id)}>{favs.includes(m.id) ? '★' : '☆'}</button>
                </div>
              </div>);
            })}
          </section>
          <aside><div className="box"><input className="search" value={q} onChange={e => setQ(e.target.value)} placeholder={`🔍 ${t.s}`} /><select value={sideLg} onChange={e => setSideLg(e.target.value)} style={{ width: '100%', background: '#1f1f1f', color: '#fff', border: '1px solid #333', padding: '7px 10px', borderRadius: 8, marginBottom: 10, fontSize: 12 }}>{POPULAR.filter(p => p.code !== 'SCHOOL').map(p => <option key={p.code} value={p.code}>{p.name}</option>)}</select><table><thead><tr><th>#</th><th style={{ textAlign: 'left' }}>Team</th><th>P</th><th>GD</th><th>PTS</th></tr></thead><tbody>{sideTbl.map((r: any) => <tr key={r.position}><td>{r.position}</td><td style={{ textAlign: 'left', fontWeight: 600 }}>{r.team?.shortName || r.team?.name}</td><td>{r.playedGames}</td><td>{r.goalDifference}</td><td style={{ fontWeight: 800, color: '#ff6b00' }}>{r.points}</td></tr>)}</tbody></table></div></aside>
        </main>
      )}
      {sel && (<div className="modal-bg" onClick={() => setSel(null)}><div className="modal" onClick={e => e.stopPropagation()}>
        <div className="m-top"><strong>{sel.competition?.name}</strong><button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}>✕</button></div>
        <div className="m-row" style={{ background: '#0b0b0b', padding: 14, borderRadius: 12, gridTemplateColumns: '1fr auto 1fr' }}><div className="tm h"><span>{sel.homeTeam.shortName || sel.homeTeam.name}</span><Crest tm={sel.homeTeam} /></div><div className="sc" style={{ fontSize: 20 }}><div>{sel.score.fullTime.home ?? '-'} - {sel.score.fullTime.away ?? '-'}</div>{(sel.score?.penalties && sel.score.penalties.home !== null) && <div style={{ fontSize: 11, color: '#facc15' }}>Penalties: {sel.score.penalties.home} - {sel.score.penalties.away}</div>}</div><div className="tm"><Crest tm={sel.awayTeam} /><span>{sel.awayTeam.shortName || sel.awayTeam.name}</span></div></div>
        <div className="ls-tabs">{[{ id: 'INFO', l: t.inf }, { id: 'SUM', l: t.sum }, { id: 'LNP', l: t.lnp }, { id: 'TBL', l: t.tbl }, { id: 'H2H', l: t.h2h }].map(k => <button key={k.id} className={mTab === k.id ? 'act' : ''} onClick={() => setMTab(k.id as any)}>{k.l}</button>)}</div>
        {mTab === 'INFO' && (<div><div className="sec-lbl">MATCH INFO</div><div className="info-strip"><span>📅 {new Date(sel.utcDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span><span>🗣️ {det?.referees?.at(0) ? det.referees.at(0).name : 'Referee TBA'}</span><span>🏟️ {det?.venue || sel.venue || 'Stadium TBA'}</span></div></div>)}
        {mTab === 'SUM' && (<div><div className="ev"><span>🏆 <strong>Result:</strong> {sel.homeTeam.shortName} {sel.score.fullTime.home ?? 0} - {sel.score.fullTime.away ?? 0} {sel.awayTeam.shortName}</span><strong style={{ color: '#ff6b00' }}>{formatStatus(sel)}</strong></div>{(sel.score?.penalties && sel.score.penalties.home !== null) && <div className="ev"><span>🎯 Penalty Shootout</span><strong style={{ color: '#facc15' }}>{sel.score.penalties.home} - {sel.score.penalties.away}</strong></div>}</div>)}
        {mTab === 'LNP' && <p style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>Line-ups released ~1h before kickoff.</p>}
        {mTab === 'TBL' && <table><thead><tr><th>#</th><th style={{ textAlign: 'left' }}>Team</th><th>P</th><th>GD</th><th>PTS</th></tr></thead><tbody>{mTbl.map((r: any) => <tr key={r.position} style={{ background: [sel.homeTeam.id, sel.awayTeam.id].includes(r.team?.id) ? '#262626' : '' }}><td>{r.position}</td><td style={{ textAlign: 'left' }}>{r.team?.shortName || r.team?.name}</td><td>{r.playedGames}</td><td>{r.goalDifference}</td><td style={{ fontWeight: 800 }}>{r.points}</td></tr>)}</tbody></table>}
        {mTab === 'H2H' && (h2h.length > 0 ? h2h.map((hm: any) => <div key={hm.id} className="ev"><span>{hm.utcDate?.slice(0, 10)}</span><span><strong>{hm.homeTeam?.shortName}</strong> {hm.score?.fullTime?.home ?? '-'} - {hm.score?.fullTime?.away ?? '-'} <strong>{hm.awayTeam?.shortName}</strong></span></div>) : <p style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No previous H2H matches.</p>)}
      </div></div>)}
      <footer>© {new Date().getFullYear()} <strong>KIGALI UPDATE SCORE</strong> • {t.dev}</footer>
    </div>
  );
}

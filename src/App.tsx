            ) : (
              <table><thead><tr><th>#</th><th style={{ textAlign: 'left' }}>Player</th><th>⚽</th></tr></thead>
                <tbody>{sideScr.slice(0, 10).map((sc: any, i: number) => <tr key={i}><td>{i + 1}</td><td style={{ textAlign: 'left' }}><strong>{sc.player?.name}</strong><br /><small style={{ color: '#9ca3af' }}>{sc.team?.shortName}</small></td><td style={{ fontWeight: 800, color: '#4ade80' }}>{sc.goals}</td></tr>)}</tbody>
              </table>
            )}
          </div>
        </aside>
      </main>

      {sel && (<div className="modal-bg" onClick={() => setSel(null)}><div className="modal" onClick={e => e.stopPropagation()}>
        <div className="m-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#fff' }}>
            <img src={emblemOf(sel.competition)} alt="" width={16} height={16} /> {sel.competition?.name}
          </span>
          <button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <div className="m-grid" style={{ background: '#0b0b0b', padding: 14, borderRadius: 12, gridTemplateColumns: '1fr auto 1fr' }}>
          <div className="m-team home"><span>{sel.homeTeam.shortName || sel.homeTeam.name}</span><img src={crestOf(sel.homeTeam)} alt="" /></div>
          <div className="m-score" style={{ fontSize: 20 }}>{sel.score.fullTime.home ?? '-'} - {sel.score.fullTime.away ?? '-'}</div>
          <div className="m-team"><img src={crestOf(sel.awayTeam)} alt="" /><span>{sel.awayTeam.shortName || sel.awayTeam.name}</span></div>
        </div>
        <div className="ls-tabs">
          {[{ id: 'INFO', l: t.inf }, { id: 'SUM', l: t.sum }, { id: 'STS', l: t.sts }, { id: 'LNP', l: t.lnp }, { id: 'TBL', l: t.tbl }, { id: 'H2H', l: t.h2h }].map(k => (
            <button key={k.id} className={mTab === k.id ? 'act' : ''} onClick={() => setMTab(k.id as any)}>{k.l}</button>
          ))}
        </div>
        {mTab === 'INFO' && <div className="ev-row"><span>🏟️ Stadium: <strong>{det?.venue || sel.venue || 'N/A'}</strong></span><span>📅 {new Date(sel.utcDate).toLocaleString()}</span></div>}
        {mTab === 'SUM' && (Array.isArray(det?.goals) && det.goals.length > 0 ? det.goals.map((g: any, i: number) => <div key={i} className="ev-row"><span>⚽ <strong>{g.scorer?.name}</strong> ({g.team?.name})</span><strong style={{ color: '#ff6b00' }}>{g.minute}'</strong></div>) : <p style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No match events yet.</p>)}
        {mTab === 'STS' && (det?.homeTeam?.statistics ? <div><div className="ev-row"><strong>{det.homeTeam.statistics.ball_possession ?? 50}%</strong><span>Possession</span><strong>{det.awayTeam.statistics.ball_possession ?? 50}%</strong></div><div className="ev-row"><strong>{det.homeTeam.statistics.shots_on_goal ?? 0}</strong><span>Shots on Target</span><strong>{det.awayTeam.statistics.shots_on_goal ?? 0}</strong></div></div> : <p style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>Stats available during/after match.</p>)}
        {mTab === 'LNP' && (det?.homeTeam?.lineup?.length > 0 ? <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}><div><strong>{sel.homeTeam.shortName}</strong>{det.homeTeam.lineup.map((p: any) => <div key={p.id}>#{p.shirtNumber} {p.name}</div>)}</div><div><strong>{sel.awayTeam.shortName}</strong>{det.awayTeam.lineup.map((p: any) => <div key={p.id}>#{p.shirtNumber} {p.name}</div>)}</div></div> : <p style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>Lineups released ~1h before kickoff.</p>)}
        {mTab === 'TBL' && <table><thead><tr><th>#</th><th style={{ textAlign: 'left' }}>Team</th><th>P</th><th>GD</th><th>PTS</th></tr></thead><tbody>{mTbl.map((r: any) => <tr key={r.position} style={{ background: [sel.homeTeam.id, sel.awayTeam.id].includes(r.team?.id) ? '#262626' : '' }}><td>{r.position}</td><td style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6 }}><img src={crestOf(r.team)} alt="" width={16} height={16} />{r.team?.shortName || r.team?.name}</td><td>{r.playedGames}</td><td>{r.goalDifference}</td><td style={{ fontWeight: 800 }}>{r.points}</td></tr>)}</tbody></table>}
        {mTab === 'H2H' && (h2h.length > 0 ? h2h.map((hm: any) => <div key={hm.id} className="ev-row"><span>{hm.utcDate?.slice(0, 10)}</span><span><strong>{hm.homeTeam?.shortName}</strong> {hm.score?.fullTime?.home ?? '-'} - {hm.score?.fullTime?.away ?? '-'} <strong>{hm.awayTeam?.shortName}</strong></span></div>) : <p style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No previous H2H matches.</p>)}
      </div></div>)}

      <footer>© {new Date().getFullYear()} <strong>Kigali Update Score</strong> • {t.dev}</footer>
    </div>
  );
}

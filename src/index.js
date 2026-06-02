import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase Project URL and Anon Key
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY');

const playerNames = ["Prabesh", "Gaurav", "Rajib", "Sandeep", "Shyamji", "Subash"];

export default function WorldCupApp() {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeUser, setActiveUser] = useState('');
  const [inputs, setInputs] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: p } = await supabase.from('players').select('*').order('points', { ascending: false });
    const { data: m } = await supabase.from('matches').select('*').order('id', { ascending: true });
    if (p) setPlayers(p);
    if (m) setMatches(m);
  }

  const handleInputChange = (matchId, team, val) => {
    setInputs({ ...inputs, [matchId]: { ...inputs[matchId], [team]: parseInt(val) } });
  };

  const submitPrediction = async (matchId) => {
    if (!activeUser) return alert("Select your name first!");
    const { error } = await supabase.from('predictions').upsert({
      player_name: activeUser,
      match_id: matchId,
      pred_score_a: inputs[matchId].a,
      pred_score_b: inputs[matchId].b
    }, { onConflict: 'player_name,match_id' });

    if (error) alert(error.message);
    else alert("Prediction saved for " + activeUser);
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', fontFamily: 'system-ui' }}>
      <h1 style={{ textAlign: 'center' }}>🏆 The World Cup 6</h1>
      
      {/* 1. Leaderboard */}
      <div style={{ background: '#f3f4f6', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
        <h2 style={{ marginTop: 0 }}>Leaderboard</h2>
        {players.map((p, i) => (
          <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ddd' }}>
            <span>{i + 1}. <strong>{p.name}</strong></span>
            <span>{p.points} pts</span>
          </div>
        ))}
      </div>

      {/* 2. User Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label>Identify Yourself: </label>
        <select onChange={(e) => setActiveUser(e.target.value)} style={{ padding: '8px', borderRadius: '5px', width: '100%' }}>
          <option value="">-- Choose Name --</option>
          {playerNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* 3. Match List */}
      <h2>Fixtures</h2>
      {matches.map(m => (
        <div key={m.id} style={{ border: '2px solid #e5e7eb', padding: '15px', borderRadius: '12px', marginBottom: '10px' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '10px' }}>
            {m.team_a} vs {m.team_b}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <input type="number" placeholder="0" style={{ width: '50px', padding: '8px' }} onChange={(e) => handleInputChange(m.id, 'a', e.target.value)} />
            <span>-</span>
            <input type="number" placeholder="0" style={{ width: '50px', padding: '8px' }} onChange={(e) => handleInputChange(m.id, 'b', e.target.value)} />
            <button 
              onClick={() => submitPrediction(m.id)}
              style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
            >
              Save
            </button>
          </div>
          
          {m.status === 'completed' && (
            <div style={{ textAlign: 'center', marginTop: '10px', color: '#059669', fontSize: '14px' }}>
              Final Result: {m.actual_score_a} - {m.actual_score_b}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

import os
import sqlite3
import json
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'spamshield.db')

def get_db_connection():
    abs_path = os.path.abspath(DB_PATH)
    conn = sqlite3.connect(abs_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            channel TEXT NOT NULL,
            input_summary TEXT NOT NULL,
            risk TEXT NOT NULL,
            score INTEGER NOT NULL,
            category TEXT,
            classification TEXT,
            explanation TEXT,
            signals_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()
    print(f"[DB Engine] SQLite Database initialized at {os.path.abspath(DB_PATH)}")

def save_scan(data: Dict[str, Any]) -> int:
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    channel = data.get('channel', 'message')
    input_summary = (
        data.get('url') or 
        data.get('subject') or 
        data.get('sender') or 
        (data.get('message', '')[:100] if 'message' in data else 'Scanned Input')
    )
    if not input_summary:
        input_summary = "Scanned Item"

    signals_json = json.dumps(data.get('signals', []))

    cursor.execute('''
        INSERT INTO scans (channel, input_summary, risk, score, category, classification, explanation, signals_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        channel,
        input_summary[:150],
        data.get('risk', 'LOW'),
        data.get('score', 0),
        data.get('category', 'general'),
        data.get('classification', 'analyzed'),
        data.get('explanation', ''),
        signals_json
    ))
    
    scan_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return scan_id

def get_recent_scans(limit: int = 20) -> List[Dict[str, Any]]:
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, channel, input_summary, risk, score, category, classification, explanation, signals_json, created_at
        FROM scans
        ORDER BY id DESC
        LIMIT ?
    ''', (limit,))
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        results.append({
            'id': r['id'],
            'channel': r['channel'],
            'input_summary': r['input_summary'],
            'risk': r['risk'],
            'score': r['score'],
            'category': r['category'],
            'classification': r['classification'],
            'explanation': r['explanation'],
            'signals': json.loads(r['signals_json']) if r['signals_json'] else [],
            'created_at': r['created_at']
        })
    return results

def delete_scan(scan_id: int) -> bool:
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM scans WHERE id = ?', (scan_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def clear_all_scans() -> int:
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM scans')
    count = cursor.rowcount
    conn.commit()
    conn.close()
    return count

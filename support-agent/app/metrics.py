from datetime import date, datetime, timedelta
from app.database import db
from typing import Dict, Any, List

async def get_daily_metrics(date_val: date) -> Dict[str, Any]:
    pool = await db.get_pool()
    async with pool.acquire() as conn:
        # For past dates, check cache first. For today, always recalculate live.
        if date_val != date.today():
            cached = await conn.fetchrow("SELECT * FROM metrics_cache WHERE date = $1", date_val)
            if cached:
                return dict(cached)

        # Calculate metrics for the given date
        start_of_day = datetime.combine(date_val, datetime.min.time())
        end_of_day = datetime.combine(date_val, datetime.max.time())

        stats = await conn.fetchrow("""
            SELECT 
                COUNT(*) as total_tickets,
                AVG(resolution_time_ms) as avg_resolution_time_ms,
                COUNT(CASE WHEN status = 'escalated' THEN 1 END)::float / NULLIF(COUNT(*), 0) as escalation_rate,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END)::float / NULLIF(COUNT(*), 0) as automated_resolution_rate
            FROM tickets
            WHERE created_at >= $1 AND created_at <= $2
        """, start_of_day, end_of_day)

        metrics = {
            "date": date_val,
            "total_tickets": stats['total_tickets'] or 0,
            "avg_resolution_time_ms": int(stats['avg_resolution_time_ms'] or 0),
            "escalation_rate": float(stats['escalation_rate'] or 0.0),
            "automated_resolution_rate": float(stats['automated_resolution_rate'] or 0.0)
        }

        # Cache the result (upsert)
        await conn.execute("""
            INSERT INTO metrics_cache (date, total_tickets, avg_resolution_time_ms, escalation_rate, automated_resolution_rate)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (date) DO UPDATE SET
                total_tickets = $2,
                avg_resolution_time_ms = $3,
                escalation_rate = $4,
                automated_resolution_rate = $5
        """, metrics['date'], metrics['total_tickets'], metrics['avg_resolution_time_ms'], metrics['escalation_rate'], metrics['automated_resolution_rate'])

        return metrics

async def get_trend_data(days: int = 30) -> List[Dict[str, Any]]:
    pool = await db.get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as total_tickets
            FROM tickets
            WHERE created_at >= CURRENT_DATE - $1::int
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        """, days)
        trend = [dict(row) for row in rows]
        if not trend:
            # Fallback to cache if no direct tickets in window
            cached = await conn.fetch("SELECT date, total_tickets FROM metrics_cache WHERE date >= CURRENT_DATE - $1::int ORDER BY date ASC", days)
            trend = [dict(row) for row in cached]
        return trend

#!/usr/bin/env python3
"""天气采集 — 从wttr.in获取佛山天气（含未来3天预报），写入JSON供推送读取。

对外两个接口：
  fetch_weather(city, days) -> dict   可被 weekly_wellness.py import 复用
  main()                              CLI：抓一次写 weather_today.json
"""
import json, subprocess, sys
from datetime import datetime
from pathlib import Path

OUTPUT = Path('I:/华为云盘/00 soul/01_Projects/wellness/state/weather_today.json')


def _make_triggers(h, t):
    """按湿度/温度生成养生触发条件。"""
    triggers = []
    if h > 85:
        triggers.append({'mode': '回南天攻坚',
                         'force_recommend': ['陈皮', '炒薏米', '茯苓'],
                         'force_avoid': ['生冷瓜果', '隔夜汤']})
    if h > 75:
        triggers.append({'mode': '高湿预警', 'note': '除湿机开启，饮食偏祛湿'})
    if t > 35:
        triggers.append({'mode': '高温预警', 'note': '防中暑，午时不出门'})
    return triggers


def fetch_weather(city='Foshan', days=3):
    """抓当前天气 + 未来 days 天预报。失败时返回降级数据（不抛异常、不阻塞调用方）。"""
    try:
        r = subprocess.run(
            ['curl', '-s', f'wttr.in/{city}?format=j1'],
            capture_output=True, text=True, timeout=15
        )
        data = json.loads(r.stdout)
        current = data['current_condition'][0]
        t = int(current['temp_C'])
        h = int(current['humidity'])

        weather = {
            'city': '佛山',
            'time': datetime.now().isoformat(),
            'temp_C': current['temp_C'],
            'humidity': current['humidity'],
            'feelsLike_C': current['FeelsLikeC'],
            'desc': current['weatherDesc'][0]['value'],
            'wind': f"{current['winddir16Point']} {current['windspeedKmph']}km/h",
            'triggers': _make_triggers(h, t),
        }

        # 未来预报（wttr.in 提供 3 天）—— 周报需要"下周天气"而非只有此刻
        forecast = []
        for d in data.get('weather', [])[:days]:
            try:
                tmax = int(d['maxtempC'])
                tmin = int(d['mintempC'])
                humid = d['hourly'][4].get('humidity', '?')   # 取正午时段
                forecast.append({
                    'date': d.get('date'),
                    'tmax': tmax, 'tmin': tmin,
                    'humidity': humid,
                    'desc': d['hourly'][4]['weatherDesc'][0]['value'],
                    'triggers': _make_triggers(int(humid) if humid != '?' else 0, tmax),
                })
            except Exception:
                continue
        weather['forecast'] = forecast
        return weather

    except Exception as e:
        print(f"❌ 天气获取失败: {e}", file=sys.stderr)
        return {
            'city': '佛山', 'time': datetime.now().isoformat(),
            'temp_C': '?', 'humidity': '?', 'desc': '获取失败',
            'triggers': [], 'forecast': [],
        }


def main():
    w = fetch_weather()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(w, f, ensure_ascii=False, indent=2)

    print(f"🌡 佛山 {w.get('temp_C')}°C 湿度{w.get('humidity')}% {w.get('desc')} → {OUTPUT}")
    for tr in w.get('triggers', []):
        print(f"  ⚡ {tr['mode']}: {tr.get('note', '')}")
    for f_ in w.get('forecast', []):
        print(f"  📅 {f_['date']}  {f_['tmin']}~{f_['tmax']}°C  湿度{f_['humidity']}%  {f_['desc']}")
    sys.exit(0)   # 不因天气失败而阻塞


if __name__ == '__main__':
    main()

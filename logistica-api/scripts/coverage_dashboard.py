import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
COVERAGE_JSON = BASE_DIR / 'coverage.json'
OUTPUT_FILE = BASE_DIR / 'coverage_report' / 'dashboard.html'
COVERAGE_REPORT = BASE_DIR / 'coverage_report'


def group_by_module(files):
    modules = {}
    pattern = re.compile(r'^apps[\\/](\w+)')
    for filepath, data in files.items():
        m = pattern.match(filepath)
        if not m:
            continue
        mod = m.group(1)
        if mod == 'migrations':
            continue
        modules.setdefault(mod, []).append((filepath, data))
    return modules


def compute_stats(files_list):
    total_stmts = 0
    total_miss = 0
    module_files = []
    for filepath, data in files_list:
        summary = data.get('summary', {})
        stmts = summary.get('num_statements', 0)
        miss = summary.get('missing_lines', 0)
        total_stmts += stmts
        total_miss += miss
        covered = stmts - miss
        pct = (covered / stmts * 100) if stmts > 0 else 100
        html_file = filename_to_html(filepath)
        module_files.append({
            'name': filepath,
            'stmts': stmts,
            'miss': miss,
            'covered': covered,
            'pct': pct,
            'html': html_file,
        })
    overall = ((total_stmts - total_miss) / total_stmts * 100) if total_stmts > 0 else 0
    return module_files, total_stmts, total_miss, overall


def filename_to_html(filepath):
    clean = filepath.replace('\\', '/').replace('.', '_').replace('/', '_')
    for f in COVERAGE_REPORT.iterdir():
        if f.suffix == '.html' and clean in f.stem:
            return f.name
    return None


def color_class(pct):
    if pct >= 90:
        return 'high'
    elif pct >= 80:
        return 'medium'
    else:
        return 'low'


def build_html(modules_data):
    modules_rows = ''
    total_stmts_all = 0
    total_miss_all = 0

    for mod in sorted(modules_data.keys()):
        files_list, stmts, miss, overall = modules_data[mod]
        total_stmts_all += stmts
        total_miss_all += miss
        covered = stmts - miss
        pct = round(overall, 1)
        cls = color_class(pct)
        modules_rows += f'''
        <tr>
            <td><strong>{mod}</strong></td>
            <td class="num">{stmts}</td>
            <td class="num">{miss}</td>
            <td class="num">{covered}</td>
            <td class="{cls}">{pct}%</td>
        </tr>'''

    grand_total = total_stmts_all - total_miss_all
    grand_pct = round((grand_total / total_stmts_all * 100), 1) if total_stmts_all > 0 else 0
    grand_cls = color_class(grand_pct)

    file_rows = ''
    for mod in sorted(modules_data.keys()):
        files_list, _, _, _ = modules_data[mod]
        for f in sorted(files_list, key=lambda x: x['name']):
            link = f'<a href="{f["html"]}">{f["name"]}</a>' if f['html'] else f['name']
            cls = color_class(f['pct'])
            file_rows += f'''
        <tr>
            <td>{link}</td>
            <td class="num">{f['stmts']}</td>
            <td class="num">{f['miss']}</td>
            <td class="num">{f['covered']}</td>
            <td class="{cls}">{round(f['pct'], 1)}%</td>
        </tr>'''

    html = f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Logística API — Cobertura General</title>
    <style>
        body {{
            font-family: -apple-system, system-ui, sans-serif;
            margin: 40px;
            background: #f5f5f5;
            color: #333;
        }}
        h1, h2 {{ color: #1a1a2e; }}
        table {{
            border-collapse: collapse;
            width: 100%;
            background: #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,.12);
            border-radius: 4px;
            margin-bottom: 40px;
        }}
        th, td {{
            padding: 10px 14px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }}
        th {{
            background: #1a1a2e;
            color: #fff;
            font-weight: 600;
        }}
        tr:hover {{ background: #f0f4ff; }}
        .num {{ text-align: right; font-variant-numeric: tabular-nums; }}
        .high {{ color: #1b8a2e; font-weight: 600; }}
        .medium {{ color: #b8860b; font-weight: 600; }}
        .low {{ color: #c0392b; font-weight: 600; }}
        .grand-total {{ background: #e8f5e9 !important; font-weight: 700; }}
        .summary {{
            display: flex; gap: 20px; margin-bottom: 30px;
        }}
        .card {{
            background: #fff; padding: 20px; border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,.12); flex: 1;
        }}
        .card h3 {{ margin: 0 0 8px; font-size: 14px; color: #666; }}
        .card .value {{ font-size: 28px; font-weight: 700; }}
        a {{ color: #1565c0; text-decoration: none; }}
        a:hover {{ text-decoration: underline; }}
        .file-table td:first-child {{ font-size: 12px; }}
    </style>
</head>
<body>
    <h1>Logística API — Reporte de Cobertura</h1>

    <div class="summary">
        <div class="card">
            <h3>Cobertura Total</h3>
            <div class="value {grand_cls}">{grand_pct}%</div>
        </div>
        <div class="card">
            <h3>Módulos</h3>
            <div class="value">{len(modules_data)}</div>
        </div>
        <div class="card">
            <h3>Líneas Cubiertas</h3>
            <div class="value">{grand_total} / {total_stmts_all}</div>
        </div>
    </div>

    <h2>Resumen por Módulo</h2>
    <table>
        <thead>
            <tr>
                <th>Módulo</th>
                <th class="num">Líneas</th>
                <th class="num">Perdidas</th>
                <th class="num">Cubiertas</th>
                <th class="num">Cobertura</th>
            </tr>
        </thead>
        <tbody>
            {modules_rows}
            <tr class="grand-total">
                <td><strong>TOTAL</strong></td>
                <td class="num">{total_stmts_all}</td>
                <td class="num">{total_miss_all}</td>
                <td class="num">{grand_total}</td>
                <td class="{grand_cls}">{grand_pct}%</td>
            </tr>
        </tbody>
    </table>

    <h2>Detalle por Archivo</h2>
    <table class="file-table">
        <thead>
            <tr>
                <th>Archivo</th>
                <th class="num">Líneas</th>
                <th class="num">Perdidas</th>
                <th class="num">Cubiertas</th>
                <th class="num">Cobertura</th>
            </tr>
        </thead>
        <tbody>
            {file_rows}
        </tbody>
    </table>
</body>
</html>'''
    OUTPUT_FILE.write_text(html, encoding='utf-8')
    print(f'Dashboard generado: {OUTPUT_FILE}')


def main():
    if not COVERAGE_JSON.exists():
        print('Ejecuta primero: coverage run ... && coverage json')
        return
    data = json.loads(COVERAGE_JSON.read_text(encoding='utf-8'))
    files = data.get('files', {})
    grouped = group_by_module(files)
    modules_data = {}
    for mod, flist in grouped.items():
        files_list, stmts, miss, overall = compute_stats(flist)
        modules_data[mod] = (files_list, stmts, miss, overall)
    build_html(modules_data)


if __name__ == '__main__':
    main()

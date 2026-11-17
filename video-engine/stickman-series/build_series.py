"""Build the 5 general-series projects: align each voiceover to its sentences (pause detection + DP), write timeline + shots.json."""
import json, os, re, shutil, subprocess, sys

STUDIO = '/home/claude/growkaz-stickman-studio'
LIB = '/home/claude/genlib'
U = '/root/.claude/uploads/cbbca7b5-891a-56cc-a63e-5dbe86cc464f'
FILES = ['623b9e25', '8e2e193b', '278abd4e', '95a97ec9', 'd88c1abb']

def S(text, **p): return (text, p)

VIDEOS = [
 dict(slug='free-shipping', title="Free shipping isn't free", music=[('playful', 0.4, 0.5), ('hopeful', 0.4, 1.0)], sents=[
  S("Free shipping isn't free.", type='statement', lines=['FREE SHIPPING', "ISN'T FREE"], set='warehouse'),
  S("Someone always pays for it.", type='set', set='warehouse', who=[dict(c='SAM', x=0.33, pose='holdFront', expr='neutral', prop='paper'), dict(c='CUSTOMER', x=0.68, facing=-1, pose='phone', prop='phone', expr='smile')], title='SOMEONE PAYS'),
  S("Say your product costs $25 and shipping is $6.", type='breakdown', title='ONE ORDER', rows=[['PRODUCT', '$25', 'gold'], ['SHIPPING', '$6', 'red']], keys=['$25', '$6']),
  S("You charge $31 and call it free shipping.", type='compare', show='left', left=dict(tag='OPTION A', title='CUSTOMER PAYS', lines=['Price $31', 'Shipping "free"'], color='gold'), keyL='$31', ex=True),
  S("Your customer pays for it, hidden in the price.", type='face', c='CUSTOMER', expr='smile', badge='HIDDEN IN THE PRICE', at='hidden', set='warehouse'),
  S("Or you charge $25 and eat the $6.", type='compare', show='both', hl='right', left=dict(tag='OPTION A', title='CUSTOMER PAYS', lines=['Price $31', 'Shipping "free"'], color='gold'), right=dict(tag='OPTION B', title='YOU PAY', lines=['Price $25', 'You eat $6'], color='red'), keyR='$25', ex=True),
  S("Now you pay for it, out of your margin.", type='face', c='SAM', expr='sad', badge='−$6 MARGIN', badgeColor='red', at='margin.'),
  S("Neither is wrong.", type='compare', show='both', left=dict(tag='OPTION A', title='CUSTOMER PAYS', lines=['Price $31', 'Shipping "free"'], color='gold'), right=dict(tag='OPTION B', title='YOU PAY', lines=['Price $25', 'You eat $6'], color='red'), title='NEITHER IS WRONG', ex=True),
  S("But you have to choose on purpose.", type='set', set='office', desk=True, who=[dict(c='SAM', x=0.426, pose='sit', expr='thinking', rim=[1, -0.2])], title='CHOOSE ON PURPOSE', cam=dict(z0=1.1, z1=1.16, x=60, y=40)),
  S("Because free is still a price.", type='bubble', lines=['"Free" is still', 'a price.'], redLine=0, label='hot take', h=330),
  S("It's just one nobody wrote down.", type='end', lines=['FREE IS STILL', 'A PRICE'], sub='write it down'),
 ]),
 dict(slug='supplier-doubled', title='What if your supplier doubled prices overnight?', music=[('tension', 0.5, 0.75), ('hopeful', 0.4, 1.0)], sents=[
  S("What if your supplier doubled their price overnight?", type='set', set='warehouse', who=[dict(c='SAM', x=0.33, pose='stand', expr='neutral', expr2='shocked', pose2='handsOnHead', at='doubled'), dict(c='SUPPLIER', x=0.68, facing=-1, pose='point', expr='smirk')], title='WHAT IF…'),
  S("Your $8 product is now $16.", type='breakdown', title='COST PER UNIT', rows=[['YESTERDAY', '$8', 'gold'], ['TODAY', '$16', 'red']], keys=['$8', '$16']),
  S("Your ads still cost the same.", type='set', set='office', desk=True, who=[dict(c='SAM', x=0.426, pose='sit', expr='worried', rim=[1, -0.2])], title='ADS: SAME COST', cam=dict(z0=1.1, z1=1.16, x=60, y=40)),
  S("Your customers still expect the same price.", type='set', set='warehouse', who=[dict(c='CUSTOMER', x=0.5, pose='crossArms', expr='neutral')], title='PRICE: SAME'),
  S("So every sale that made money yesterday loses money today.", type='breakdown', title='ONE ORDER, TODAY', rows=[['SALE PRICE', '$30', 'gold'], ['PRODUCT', '−$16', 'red'], ['ADS + FEES', '−$17', 'red']], big=['−$3', 'PER ORDER', 'red'], bigKey='loses'),
  S("Most stores only notice weeks later, when the bank balance looks wrong.", type='gauge', label='BANK BALANCE', top='WEEKS LATER', hits=[dict(str='WEEK 1', drop=0.25), dict(str='WEEK 2', drop=0.3), dict(str='WEEK 3', drop=0.3)]),
  S("The fix isn't panic.", type='face', c='SAM', expr='nervous', expr2='determined', at='panic.'),
  S("It's having a second supplier quoted before you need one.", type='compare', show='both', hl='right', left=dict(tag='SUPPLIER A', title='MAIN', lines=['$16 now'], color='red'), right=dict(tag='SUPPLIER B', title='BACKUP', lines=['Quoted', 'and ready'], color='green'), keyR='second', title='HAVE A BACKUP', ex=True),
  S("Because the worst time to find a supplier is when you're desperate.", type='end', lines=['QUOTE A BACKUP', 'BEFORE YOU NEED IT'], sub="not when you're desperate"),
 ]),
 dict(slug='fifty-dollar-sale', title='Where your $50 sale actually goes', music=[('mystery', 0.4, 0.3), ('tension', 0.55, 0.85), ('hopeful', 0.4, 1.0)], sents=[
  S("A customer pays you $50.", type='set', set='warehouse', who=[dict(c='CUSTOMER', x=0.66, facing=-1, pose='holdFront', expr='smile'), dict(c='SAM', x=0.34, pose='wave', expr='happy')], readout=dict(label='SALE', to=50, prefix='$', key='$50.'), ex=True),
  S("Here's where it goes.", type='statement', lines=['WHERE DOES', 'IT GO?']),
  S("$15 to the product.", type='breakdown', title='ONE $50 SALE', rows=[['PRODUCT', '−$15', 'red']], keys=['$15'], total=['LEFT', '$35', 'cream']),
  S("$7 for shipping.", type='breakdown', title='ONE $50 SALE', rows=[['PRODUCT', '−$15', 'red'], ['SHIPPING', '−$7', 'red']], frm=1, keys=['$7'], total=['LEFT', '$28', 'cream']),
  S("$2 in payment fees.", type='breakdown', title='ONE $50 SALE', rows=[['PRODUCT', '−$15', 'red'], ['SHIPPING', '−$7', 'red'], ['PAYMENT FEES', '−$2', 'red']], frm=2, keys=['$2'], total=['LEFT', '$26', 'cream']),
  S("$18 to win the sale with ads.", type='breakdown', title='ONE $50 SALE', rows=[['PRODUCT', '−$15', 'red'], ['SHIPPING', '−$7', 'red'], ['PAYMENT FEES', '−$2', 'red'], ['ADS', '−$18', 'red']], frm=3, keys=['$18'], total=['LEFT', '$8', 'cream']),
  S("$1 more for the refund you'll give someone eventually.", type='breakdown', title='ONE $50 SALE', rows=[['PRODUCT', '−$15', 'red'], ['SHIPPING', '−$7', 'red'], ['PAYMENT FEES', '−$2', 'red'], ['ADS', '−$18', 'red'], ['REFUNDS', '−$1', 'red']], frm=4, keys=['$1'], total=['LEFT', '$7', 'cream']),
  S("That leaves you $7.", type='breakdown', title='ONE $50 SALE', rows=[['PRODUCT', '−$15', 'red'], ['SHIPPING', '−$7', 'red'], ['PAYMENT FEES', '−$2', 'red'], ['ADS', '−$18', 'red'], ['REFUNDS', '−$1', 'red']], frm=5, big=['$7', 'LEFT', 'gold'], bigKey='$7.'),
  S("Not $50.", type='face', c='SAM', expr='shocked', badge='NOT $50', badgeColor='red', fx='shock'),
  S("$7.", type='statement', lines=['ONLY', '$7']),
  S("And that $7 still has to pay for your apps, your tools, and you.", type='gauge', label='THE $7', top='STILL HAS TO PAY FOR', hits=[dict(str='APPS', drop=0.3, key='apps,'), dict(str='TOOLS', drop=0.3, key='tools,'), dict(str='YOU', drop=0.32, key='=you')]),
  S("So when revenue looks great, ask the better question.", type='set', set='office', desk=True, who=[dict(c='SAM', x=0.426, pose='sit', expr='smile', expr2='thinking', at='ask', rim=[1, -0.2])], title='REVENUE LOOKS GREAT…', cam=dict(z0=1.1, z1=1.16, x=60, y=40)),
  S("What's left?", type='end', lines=["WHAT'S", 'LEFT?'], sub='the better question'),
 ]),
 dict(slug='ad-fatigue', title='Your best ad will stop working', music=[('tension', 0.5, 0.7), ('hopeful', 0.45, 1.0)], sents=[
  S("Your best ad will stop working.", type='set', set='office', desk=True, who=[dict(c='SAM', x=0.426, pose='sit', expr='smile', expr2='shocked', at='stop', rim=[1, -0.2])], title='YOUR BEST AD', cam=dict(z0=1.1, z1=1.16, x=60, y=40)),
  S("Not maybe.", type='face', c='SAM', expr='nervous', badge='NOT MAYBE', badgeColor='red'),
  S("Will.", type='statement', lines=['WILL.']),
  S("The same people see it again and again, they stop clicking, and your costs creep up.", type='chart', title='YOUR BEST AD', xlabel='WEEKS →', series=[dict(label='CLICKS', dir='down', color='red', key='stop'), dict(label='COST', dir='up', color='gold', key='costs')]),
  S("It's called ad fatigue, and it happens to everyone.", type='statement', lines=['AD', 'FATIGUE'], sub='it happens to everyone', subKey='happens'),
  S("The stores that survive it don't have one perfect ad.", type='set', set='warehouse', who=[dict(c='SAM', x=0.5, pose='shrug', expr='confused')], title='ONE PERFECT AD?'),
  S("They're always testing the next one, before the old one dies.", type='compare', show='both', hl='right', left=dict(tag='NOW', title='OLD AD', lines=['Getting tired'], color='red'), right=dict(tag='NEXT', title='NEW AD', lines=['Testing now'], color='green'), keyR='testing'),
  S('So the real question isn\'t "is my ad good?"', type='bubble', lines=['"Is my ad good?"'], label='the wrong question', h=260),
  S('It\'s "what\'s replacing it?"', type='end', lines=["WHAT'S", 'REPLACING IT?'], sub='the real question'),
 ]),
 dict(slug='maya-viral', title='The store that went viral and nearly went broke', music=[('playful', 0.45, 0.3), ('tension', 0.6, 0.75), ('hopeful', 0.4, 1.0)], tail=2.6, sents=[
  S("Meet Maya.", type='set', set='warehouse', who=[dict(c='MAYA', x=0.5, pose='wave', expr='happy')], title='MEET MAYA'),
  S("Her product goes viral.", type='set', set='office', desk=True, who=[dict(c='MAYA', x=0.426, pose='sit', expr='surprised', expr2='joy', at='viral.', rim=[1, -0.2])], bubbles='+1 ORDER', cam=dict(z0=1.1, z1=1.16, x=60, y=40)),
  S("10,000 orders in a week.", type='set', set='warehouse', who=[dict(c='MAYA', x=0.5, pose='cheer', expr='joy')], readout=dict(label='ORDERS', to=10000, key='10,000'), ex=True),
  S("Maya celebrates.", type='face', c='MAYA', expr='joy', fx='sparkle'),
  S("Then the bills arrive.", type='freeze', c='MAYA', pose='cheer', expr='joy', set='warehouse', title='THEN…', badge='BILLS DUE'),
  S("Her supplier wants paying now.", type='gauge', label='CASH IN THE BANK', hits=[dict(str='SUPPLIER: PAY NOW', drop=0.45, key='=now')]),
  S("Her payouts are still days away.", type='face', c='MAYA', expr='sad', badge='PAYOUTS: DAYS AWAY'),
  S("Her ads charge her card every single day.", type='gauge', label='CASH IN THE BANK', frm_level=0.55, hits=[dict(str='ADS · DAY 1', drop=0.12), dict(str='ADS · DAY 2', drop=0.12), dict(str='ADS · DAY 3', drop=0.12)]),
  S("And her stock just ran out.", type='set', set='warehouse', who=[dict(c='MAYA', x=0.5, pose='handsOnHead', expr='shocked')], title='OUT OF STOCK'),
  S("Maya didn't have a sales problem.", type='compare', show='left', left=dict(tag='SALES', title='FINE', lines=['10,000 orders'], color='green'), keyL='sales'),
  S("She had a cash problem.", type='compare', show='both', hl='right', left=dict(tag='SALES', title='FINE', lines=['10,000 orders'], color='green'), right=dict(tag='CASH', title='EMPTY', lines=['Bills due now'], color='red'), keyR='cash'),
  S("Sales are what you sell.", type='statement', lines=['SALES =', 'WHAT YOU SELL']),
  S("Cash is what you have.", type='statement', lines=['CASH =', 'WHAT YOU HAVE']),
  S("Grow faster than your cash, and success can sink you.", type='three', c='MAYA', left='ORDERS', right='CASH'),
 ], end=dict(type='end', lines=['WATCH YOUR', 'CASH'], sub='not just your sales')),
]

SFX = {'statement': [{'at': 0.0, 'name': 'whoosh', 'gain': -10}], 'bubble': [{'at': 0.05, 'name': 'pop', 'gain': -10}], 'end': [{'at': 1.2, 'name': 'pop', 'gain': -10}],
       'freeze': [{'at': 0.0, 'name': 'freeze', 'gain': -6}], 'gauge': [{'at': 0.3, 'name': 'counter', 'gain': -14, 'dur': 1.2}], 'chart': [{'at': 0.3, 'name': 'riser', 'gain': -12, 'dur': 2.0}],
       'three': [{'at': 0.0, 'name': 'whoosh', 'gain': -10}], 'compare': [{'at': 0.15, 'name': 'blip', 'gain': -12}]}

def run(cmd, **kw): return subprocess.run(cmd, capture_output=True, text=True, **kw)

def speech_segments(path):
    out = run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'silencedetect=noise=-35dB:d=0.18', '-f', 'null', '-']).stderr
    dur = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]).stdout)
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]; ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
    sil = list(zip(starts, ends + [dur] * (len(starts) - len(ends))))
    # speech span
    s0 = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0
    s1 = sil[-1][0] if sil and sil[-1][1] >= dur - 0.05 else dur
    gaps = [(a, b) for a, b in sil if a > s0 + 0.05 and b < s1 - 0.05]
    return dur, s0, s1, gaps

def align(sents, s0, s1, gaps):
    n = len(sents); L = [len(s) for s in sents]; tot = sum(L); exp = []; acc = 0
    for i in range(1, n): acc += L[i - 1]; exp.append(s0 + (s1 - s0) * acc / tot)
    G = len(gaps); INF = 1e18
    if G < n - 1: return None, INF
    mids = [(a + b) / 2 for a, b in gaps]
    # dp[k][j] = min cost placing boundary k at gap j
    dp = [[INF] * G for _ in range(n - 1)]; bk = [[-1] * G for _ in range(n - 1)]
    for j in range(G): dp[0][j] = (mids[j] - exp[0]) ** 2
    for k in range(1, n - 1):
        best, bj = INF, -1
        for j in range(G):
            if j - 1 >= 0 and dp[k - 1][j - 1] < best: best, bj = dp[k - 1][j - 1], j - 1
            if best < INF: dp[k][j] = best + (mids[j] - exp[k]) ** 2; bk[k][j] = bj
    j = min(range(G), key=lambda x: dp[n - 2][x]); cost = dp[n - 2][j]; ch = [j]
    for k in range(n - 2, 0, -1): j = bk[k][j]; ch.append(j)
    ch.reverse(); return [gaps[c] for c in ch], cost / max(1, n - 1)

def main(check_only=False):
    import itertools
    segs = {}
    for f in FILES:
        path = [os.path.join(U, x) for x in os.listdir(U) if x.startswith(f)][0]; segs[f] = (path, *speech_segments(path))
    # confirm file order: cost matrix
    print('cost (rows=file, cols=video):')
    for f in FILES:
        _, dur, s0, s1, gaps = segs[f]
        print(f, f'{dur:5.1f}s gaps={len(gaps):2d}', ' '.join(f'{align([s for s, _ in v["sents"]], s0, s1, gaps)[1]:8.3f}' for v in VIDEOS))
    if check_only: return
    for i, v in enumerate(VIDEOS):
        path, dur, s0, s1, gaps = segs[FILES[i]]
        sents = [s for s, _ in v['sents']]
        import ps_align
        W = ps_align.align(path, sents); cost = 0.0
        starts = [min(w['start'] for w in W if w['s'] == k) for k in range(len(sents))]
        s1 = max(w['end'] for w in W)
        slug = v['slug']; P = os.path.join(STUDIO, 'projects', slug)
        if os.path.exists(P): shutil.rmtree(P)
        tmp = f'/home/claude/stick_in/{slug}.json'
        json.dump({'words': [{'word': w['word'], 'start': w['start'], 'end': w['end']} for w in W]}, open(tmp, 'w'))
        r = run(['python3', 'tools/new_project.py', '--name', slug, '--voice', path, '--script', tmp, '--aspect', '9:16', '--resolution', '1080p', '--style', 'ember', '--title', v['title'], '--captions'], cwd=STUDIO); print(r.stdout.strip(), r.stderr[-300:])
        r = run(['python3', 'tools/parse_script.py', '--project', f'projects/{slug}', '--script', f'projects/{slug}/input/script.json'], cwd=STUDIO); print(r.stdout.strip(), r.stderr[-300:])
        os.makedirs(f'{P}/scenes/sets', exist_ok=True); os.makedirs(f'{P}/scenes/shots', exist_ok=True)
        shutil.copy(f'{LIB}/office.js', f'{P}/scenes/sets/office.js'); shutil.copy(f'{LIB}/warehouse.js', f'{P}/scenes/sets/warehouse.js')
        shutil.copy(f'{LIB}/cast.js', f'{P}/scenes/cast.js'); shutil.copy(f'{LIB}/shots.js', f'{P}/scenes/shots/lib.js')
        total = round(dur + v.get('tail', 1.6), 2)
        items = list(v['sents']) + ([('', v['end'])] if v.get('end') else [])
        cuts = [0.0] + [round(max(0.0, st - 0.12), 2) for st in starts[1:]]
        if v.get('end'): cuts.append(round(s1 + 0.25, 2))
        cuts.append(total)
        shots = []
        for k, (line, p) in enumerate(items):
            p = dict(p)
            if 'frm' in p: p['from'] = p.pop('frm')
            if 'frm_level' in p: p['from'] = p.pop('frm_level')
            t = p['type']; sfx = list(SFX.get(t, []))
            if t == 'breakdown' and p.get('big'): sfx = [{'at': 0.05, 'name': 'impact', 'gain': -5}]
            elif t == 'breakdown': sfx = [{'at': 0.4, 'name': 'blip', 'gain': -12}]
            cap = t not in ('statement', 'end', 'bubble') and not (t == 'breakdown' and p.get('big'))
            tin = {'type': 'flash', 'dur': 0.3} if t == 'freeze' else {'type': 'fade', 'dur': 0.4} if k == 0 else {'type': 'cut'}
            shots.append({'id': f's{k + 1:02d}', 'start': cuts[k], 'end': cuts[k + 1], 'line': line, 'scene': t, 'set': p.get('set', 'office'), 'bars': None, 'in': tin, 'sfx': sfx, 'params': p, 'captions': cap,
                          'amb': {'name': 'roomtone', 'gain': -28}})
        music = []; prev = 0.0
        for mood, inten, frac in v['music']: end = round(total * frac, 2); music.append({'start': prev, 'end': end, 'mood': mood, 'intensity': inten}); prev = end
        json.dump({'title': v['title'], 'duration': total, 'shots': shots, 'music': music, 'sfx': []}, open(f'{P}/story/shots.json', 'w'), indent=1)
        c = json.load(open(f'{P}/config.json')); c['duration'] = total; json.dump(c, open(f'{P}/config.json', 'w'), indent=1)
        print(slug, f'cost={cost:.3f}', 'starts', [round(x, 2) for x in starts])

if __name__ == '__main__': main('--check' in sys.argv)

"""Forced alignment of known text to audio with PocketSphinx (bundled en-us model). Prints JSON [{word,start,end}]."""
import json, re, subprocess, sys
from pocketsphinx import Decoder

NUM = {'0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten', '15': 'fifteen', '16': 'sixteen', '17': 'seventeen', '18': 'eighteen',
       '23': 'twenty three', '25': 'twenty five', '30': 'thirty', '31': 'thirty one', '50': 'fifty', '10,000': 'ten thousand', '200': 'two hundred'}

def spoken(tok):
    t = tok.lower().strip('.,?!:;"\'“”')
    m = re.fullmatch(r'[−-]?\$?([\d,]+)', t)
    if m:
        n = m.group(1); words = NUM.get(n, n)
        return words.split() + (['dollars'] if '$' in t and not tok.endswith('-') else [])
    t = re.sub(r"[^a-z']", '', t)
    return [t] if t else []

def align(wav, sentences):
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', wav, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout
    toks = []                                         # (sentence index, display token, spoken words)
    for si, s in enumerate(sentences):
        for tok in s.split(): toks.append((si, tok, spoken(tok)))
    words = [w for _, _, sp in toks for w in sp]
    d = Decoder(samprate=16000, loglevel='FATAL', beam=1e-80, wbeam=1e-60, pbeam=1e-80)
    d.set_align_text(' '.join(words))
    d.start_utt(); d.process_raw(pcm, full_utt=True); d.end_utt()
    seg = [(re.sub(r'\(\d+\)$', '', x.word), x.start_frame / 100, (x.end_frame + 1) / 100) for x in d.seg() if x.word not in ('<s>', '</s>', '<sil>') and not x.word.startswith('[')]
    if len(seg) != len(words): raise SystemExit(f'alignment mismatch {len(seg)} vs {len(words)}')
    out, k = [], 0
    for si, tok, sp in toks:
        if not sp: continue
        a = seg[k][1]; b = seg[k + len(sp) - 1][2]; k += len(sp)
        out.append({'word': tok, 'start': round(a, 3), 'end': round(b, 3), 's': si})
    return out

if __name__ == '__main__':
    print(json.dumps(align(sys.argv[1], json.loads(sys.argv[2]))))

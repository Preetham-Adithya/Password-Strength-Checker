(() => {
  const pwInput   = document.getElementById('pw');
  const toggle    = document.getElementById('toggle');
  const eyeOpen   = document.getElementById('eyeOpen');
  const eyeClosed = document.getElementById('eyeClosed');
  const pins      = [...document.querySelectorAll('.cylinder__pin')];
  const verdictLabel = document.getElementById('verdictLabel');
  const verdictTime  = document.getElementById('verdictTime');
  const note      = document.getElementById('note');
  const items     = [...document.querySelectorAll('.checklist__item')];

  const COMMON = new Set([
    'password','123456','12345678','123456789','qwerty','abc123','password1',
    'admin','letmein','welcome','monkey','iloveyou','111111','123123',
    'dragon','football','sunshine','master','shadow','superman','trustno1',
    'passw0rd','qwerty123','000000','1q2w3e4r','starwars','princess'
  ]);

  const CHART = { c_weak: 'weak', c_fair: 'fair', c_good: 'good', c_strong: 'strong' };

  function hasSequence(pw) {
    const s = pw.toLowerCase();
    const seqs = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    for (const seq of seqs) {
      for (let i = 0; i <= seq.length - 4; i++) {
        const fwd = seq.slice(i, i + 4);
        const rev = [...fwd].reverse().join('');
        if (s.includes(fwd) || s.includes(rev)) return true;
      }
    }
    return /(.)\1{2,}/.test(pw); 
  }

  function charsetSize(pw) {
    let size = 0;
    if (/[a-z]/.test(pw)) size += 26;
    if (/[A-Z]/.test(pw)) size += 26;
    if (/[0-9]/.test(pw)) size += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) size += 33;
    return size || 1;
  }

  function entropyBits(pw) {
    if (!pw) return 0;
    return Math.log2(charsetSize(pw)) * pw.length;
  }

  function crackTimeLabel(bits, penalised) {
    if (!bits) return 'Enter a password to begin';
    if (penalised) return 'Instantly — it\'s a known leaked password';

    const guesses = Math.pow(2, bits) / 2;
    const seconds = guesses / 1e10;

    const units = [
      [60, 'seconds'], [60, 'minutes'], [24, 'hours'], [365, 'days'],
      [100, 'years'], [Infinity, 'centuries']
    ];
    let value = seconds, i = 0;
    if (value < 1) return 'Instantly';
    while (i < units.length - 1 && value >= units[i][0]) {
      value /= units[i][0];
      i++;
    }
    const rounded = value >= 100 ? Math.round(value).toLocaleString() : value.toFixed(1);
    return `~${rounded} ${units[i][1]} to crack`;
  }

  function evaluate(pw) {
    const rules = {
      length: pw.length >= 12,
      upper:  /[A-Z]/.test(pw),
      lower:  /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      symbol: /[^a-zA-Z0-9]/.test(pw),
      common: pw.length > 0 && !COMMON.has(pw.toLowerCase()),
      repeat: pw.length > 0 && !hasSequence(pw),
    };

    const isCommon = COMMON.has(pw.toLowerCase());
    let bits = entropyBits(pw);
    if (isCommon) bits = Math.min(bits, 10); 
    else if (!rules.repeat) bits *= 0.6;      

    let tier;     
    let label;
    if (!pw) { tier = -1; label = '—'; }
    else if (isCommon || bits < 28) { tier = 1; label = 'Weak'; }
    else if (bits < 45) { tier = 2; label = 'Fair'; }
    else if (bits < 65) { tier = 3; label = 'Good'; }
    else { tier = 4; label = 'Strong'; }

    return { rules, bits, tier, label, isCommon };
  }

  function render() {
    const pw = pwInput.value;
    const { rules, bits, tier, label, isCommon } = evaluate(pw);

    // checklist
    items.forEach(item => {
      const rule = item.dataset.rule;
      const pass = rules[rule];
      item.classList.toggle('pass', !!pass && pw.length > 0);
      item.querySelector('.checklist__mark').textContent = (pw.length > 0 && pass) ? '●' : '○';
    });

    
    const tierClass = { 1: 'c-weak', 2: 'c-fair', 3: 'c-good', 4: 'c-strong' }[tier];
    pins.forEach((pin, i) => {
      pin.classList.remove('set', 'c-weak', 'c-fair', 'c-good', 'c-strong');
      if (tier >= 1 && i < tier + 1) {
        pin.classList.add('set', tierClass);
      }
    });

    
    verdictLabel.textContent = pw ? label : '—';
    verdictLabel.className = 'verdict__label' + (tierClass ? ` ${tierClass}` : '');
    verdictTime.textContent = crackTimeLabel(bits, isCommon);

    
    if (!pw) {
      note.textContent = '';
    } else if (isCommon) {
      note.textContent = 'This exact password appears in common breach lists — pick something else entirely.';
    } else if (!rules.repeat) {
      note.textContent = 'Avoid keyboard runs and repeated characters (e.g. "1234", "aaaa") — they\'re guessed early.';
    } else if (tier < 3) {
      note.textContent = 'Try a longer passphrase — length beats complexity for resisting cracking.';
    } else {
      note.textContent = 'Store this in a password manager rather than memorising or reusing it.';
    }
  }

  toggle.addEventListener('click', () => {
    const showing = pwInput.type === 'text';
    pwInput.type = showing ? 'password' : 'text';
    eyeOpen.style.display = showing ? '' : 'none';
    eyeClosed.style.display = showing ? 'none' : '';
    toggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    pwInput.focus();
  });

  pwInput.addEventListener('input', render);
  render();
})();

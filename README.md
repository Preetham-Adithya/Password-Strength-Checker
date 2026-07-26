# Password Strength Checker

A lightweight, client-side password strength checker. No frameworks, no build step, no network requests — everything runs in the browser.

![status](https://img.shields.io/badge/status-active-35c98c) ![license](https://img.shields.io/badge/license-MIT-6d7488)

## Features

- **Live strength meter** — a 5-pin "lock cylinder" visual that fills in as the password gets stronger (Weak → Fair → Good → Strong)
- **Rule checklist** — checks for:
  - Minimum length (12+ characters)
  - Uppercase letters
  - Lowercase letters
  - Numbers
  - Symbols
  - Common / leaked passwords (checked against a small built-in sample list)
  - Obvious repeats or keyboard sequences (`1234`, `qwerty`, `aaaa`, etc.)
- **Estimated crack time** — a rough entropy-based estimate of how long an offline attacker would take to crack the password
- **Show/hide toggle** — reveal the password to check for typos
- **Fully client-side** — no data ever leaves the browser, nothing is logged or stored
- **Responsive & accessible** — works on mobile, visible keyboard focus, respects `prefers-reduced-motion`

## Demo

Open `index.html` in any modern browser — no build tools or server required.

## File structure

```
password-strength-checker/
├── index.html    # Markup
├── style.css     # Styling / theme
├── script.js     # Strength evaluation logic
└── README.md
```

## How strength is calculated

The checker estimates password entropy using:

```
entropy (bits) = log2(character set size) × password length
```

The character set size grows based on which categories are present (lowercase, uppercase, digits, symbols). The result is then:

- **Capped low** if the password matches a known common/leaked password
- **Penalized** if it contains an obvious keyboard sequence or repeated run of characters

The final entropy score is mapped to a Weak / Fair / Good / Strong tier and used to estimate crack time, assuming a determined offline attacker at roughly 10 billion guesses/second.

> **Note:** The built-in "common password" list is a small illustrative sample, not an exhaustive breach corpus. For production use, consider checking against a real breach database such as the [Have I Been Pwned Pwned Passwords API](https://haveibeenpwned.com/API/v3#PwnedPasswords) (via k-anonymity, so the full password is never transmitted).


## License

MIT — free to use, modify, and distribute.

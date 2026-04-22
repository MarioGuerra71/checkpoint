"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';

const PillNav = ({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#120F17',
  hoveredPillTextColor = '#ffffff',
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return;
        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);
        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();
    window.addEventListener('resize', layout);
    document.fonts?.ready.then(layout).catch(() => {});

    if (mobileMenuRef.current) {
      gsap.set(mobileMenuRef.current, { visibility: 'hidden', opacity: 0 });
    }

    if (initialLoadAnimation) {
      if (logoRef.current) {
        gsap.set(logoRef.current, { scale: 0 });
        gsap.to(logoRef.current, { scale: 1, duration: 0.6, ease });
      }
      if (navItemsRef.current) {
        gsap.set(navItemsRef.current, { width: 0, overflow: 'hidden' });
        gsap.to(navItemsRef.current, { width: 'auto', duration: 0.6, ease });
      }
    }

    return () => window.removeEventListener('resize', layout);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: 'auto' });
  };

  const handleLeave = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: 'auto' });
  };

  const handleLogoEnter = () => {
    if (!logoImgRef.current) return;
    logoTweenRef.current?.kill();
    gsap.set(logoImgRef.current, { rotate: 0 });
    logoTweenRef.current = gsap.to(logoImgRef.current, { rotate: 360, duration: 0.2, ease, overwrite: 'auto' });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    const menu = mobileMenuRef.current;
    const hamburger = hamburgerRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      gsap.to(lines[0], { rotation: newState ? 45 : 0,  y: newState ? 3  : 0, duration: 0.3, ease });
      gsap.to(lines[1], { rotation: newState ? -45 : 0, y: newState ? -3 : 0, duration: 0.3, ease });
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(menu, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease });
      } else {
        gsap.to(menu, { opacity: 0, y: 10, duration: 0.2, ease, onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
      }
    }

    onMobileMenuClick?.();
  };

  const cssVars = {
    '--base':      baseColor,
    '--pill-bg':   pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text': resolvedPillTextColor,
    '--nav-h':     '42px',
    '--logo':      '36px',
    '--pill-pad-x': '18px',
    '--pill-gap':  '3px'
  };

  const basePillClasses = 'relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-semibold text-[16px] leading-[0] uppercase tracking-[0.2px] whitespace-nowrap cursor-pointer px-0';

  return (
    <div className="relative w-auto">
      <nav className={`w-full md:w-max flex items-center justify-between md:justify-start box-border px-4 md:px-0 ${className}`} style={cssVars}>

        {/* Logo */}
        <Link
          href="/"
          aria-label="Home"
          onMouseEnter={handleLogoEnter}
          ref={logoRef}
          className="rounded-full p-2 inline-flex items-center justify-center overflow-hidden"
          style={{ width: 'var(--nav-h)', height: 'var(--nav-h)', background: 'var(--base)' }}
        >
          <img src={logo} alt={logoAlt} ref={logoImgRef} className="w-full h-full object-cover block" />
        </Link>

        {/* Pills desktop */}
        <div ref={navItemsRef} className="relative items-center rounded-full hidden md:flex ml-2"
          style={{ height: 'var(--nav-h)', background: 'var(--base)' }}>
          <ul role="menubar" className="list-none flex items-stretch m-0 p-0.75 h-full" style={{ gap: 'var(--pill-gap)' }}>
            {items.map((item, i) => (
              <li key={item.href} role="none" className="flex h-full">
                <Link
                  role="menuitem"
                  href={item.href}
                  className={basePillClasses}
                  style={{ background: 'var(--pill-bg)', color: 'var(--pill-text)', paddingLeft: 'var(--pill-pad-x)', paddingRight: 'var(--pill-pad-x)' }}
                  aria-label={item.ariaLabel || item.label}
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                >
                  <span className="hover-circle absolute left-1/2 bottom-0 rounded-full z-1 block pointer-events-none"
                    style={{ background: 'var(--base)', willChange: 'transform' }}
                    aria-hidden="true"
                    ref={el => { circleRefs.current[i] = el; }} />
                  <span className="label-stack relative inline-block leading-none z-2">
                    <span className="pill-label relative z-2 inline-block leading-none" style={{ willChange: 'transform' }}>
                      {item.label}
                    </span>
                    <span className="pill-label-hover absolute left-0 top-0 z-3 inline-block"
                      style={{ color: 'var(--hover-text)', willChange: 'transform, opacity' }} aria-hidden="true">
                      {item.label}
                    </span>
                  </span>
                  {activeHref === item.href && (
                    <span className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 rounded-full z-4"
                      style={{ background: 'var(--base)' }} aria-hidden="true" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Hamburger móvil */}
        <button ref={hamburgerRef} onClick={toggleMobileMenu} aria-label="Toggle menu"
          className="md:hidden rounded-full border-0 flex flex-col items-center justify-center gap-1 cursor-pointer p-0"
          style={{ width: 'var(--nav-h)', height: 'var(--nav-h)', background: 'var(--base)' }}>
          <span className="hamburger-line w-4 h-0.5 rounded origin-center" style={{ background: 'var(--pill-bg)' }} />
          <span className="hamburger-line w-4 h-0.5 rounded origin-center" style={{ background: 'var(--pill-bg)' }} />
        </button>
      </nav>

      {/* Menú móvil */}
      <div ref={mobileMenuRef} className="md:hidden absolute top-[3em] left-4 right-4 rounded-[27px] z-998"
        style={{ ...cssVars, background: 'var(--base)' }}>
        <ul className="list-none m-0 p-0.75 flex flex-col gap-0.75">
          {items.map(item => (
            <li key={item.href}>
              <Link href={item.href}
                className="block py-3 px-4 text-[16px] font-medium rounded-[50px] transition-all duration-200"
                style={{ background: 'var(--pill-bg)', color: 'var(--pill-text)' }}
                onClick={() => setIsMobileMenuOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
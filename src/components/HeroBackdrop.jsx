import { useEffect, useRef, useState } from 'react';

const POSTER = './assets/video/cover-poster.jpg';

/**
 * Full-bleed hero backdrop: operations footage filling the section, with the
 * hero copy laid over it. Falls back to the poster frame when the visitor
 * prefers reduced motion, and pauses once the hero scrolls away so an
 * off-screen video never keeps decoding.
 */
export default function HeroBackdrop() {
    const videoRef = useRef(null);
    const wrapRef = useRef(null);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const apply = () => setReducedMotion(mq.matches);
        apply();
        mq.addEventListener('change', apply);
        return () => mq.removeEventListener('change', apply);
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        const wrap = wrapRef.current;
        if (!video || !wrap || reducedMotion) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            },
            { threshold: 0.05 }
        );
        io.observe(wrap);
        return () => io.disconnect();
    }, [reducedMotion]);

    return (
        <div className="hero-backdrop" ref={wrapRef} aria-hidden="true">
            {reducedMotion ? (
                <img src={POSTER} alt="" width="1920" height="500" />
            ) : (
                <video
                    ref={videoRef}
                    poster={POSTER}
                    width="1920"
                    height="500"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    tabIndex={-1}
                >
                    <source src="./assets/video/cover.webm" type="video/webm" />
                    <source src="./assets/video/cover.mp4" type="video/mp4" />
                </video>
            )}
        </div>
    );
}

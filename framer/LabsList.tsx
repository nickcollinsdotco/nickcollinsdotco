import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import {
    motion,
    useMotionValue,
    useSpring,
    useReducedMotion,
} from "framer-motion"

type Status = "LIVE" | "BETA" | "ALPHA" | "WIP" | "STEALTH"
type StealthEffect = "Glitch" | "Warp" | "Mosaic" | "Redacted" | "Combo" | "Blur"

interface Item {
    name: string
    description: string
    status: Status
    url?: string
    github?: string
    image?: { src: string; srcSet?: string; alt?: string }
    video?: string
}

interface Props {
    items: Item[]
    limit: number
    moreLabel: string
    moreLink?: string
    showSite: boolean
    showGithub: boolean
    titleCaps: boolean
    descCaps: boolean
    scrambleStealth: boolean
    font: React.CSSProperties
    textColor: string
    mutedColor: string
    dividerColor: string
    previewWidth: number
    previewRadius: number
    chipStyle: "Filled" | "Outline" | "Plain"
    chipFill: string
    chipBorder: string
    statusColors: Record<Status, string>
    stealthEffect: StealthEffect
    stealthLabel: string
    descAlign: "Left" | "Right"
    previewMode: "Follow" | "Pinned"
    pinnedX: number
}

const STATUSES: Status[] = ["LIVE", "BETA", "ALPHA", "WIP", "STEALTH"]

// Matches the status chips on the main Projects list
const STATUS_COLOR: Record<Status, string> = {
    LIVE: "#FFE500",
    BETA: "#2B4BFF",
    ALPHA: "#2DD4BF",
    WIP: "#FF5A00",
    STEALTH: "#A855F7",
}

const DEFAULT_ITEMS: Item[] = [
    {
        name: "Spectral",
        description: "Product studio and R&D engine",
        status: "LIVE",
        url: "https://spctrl.tech",
    },
    {
        name: "BotFriendly",
        description: "Discovery for the bot economy",
        status: "LIVE",
        url: "https://botfriendly.xyz",
    },
    {
        name: "TRACE",
        description: "Local-first meeting notes, stored as Markdown",
        status: "BETA",
        github: "https://github.com/nickcollinsdotco/trace",
    },
    {
        name: "Product Kernel",
        description: "Meta-context framework for vibecoding",
        status: "WIP",
        github: "https://github.com/nickcollinsdotco/Product-Kernel",
    },
    {
        name: "Product Film Studio",
        description: "Cinematic product films, written in code",
        status: "ALPHA",
        github: "https://github.com/nickcollinsdotco/Product-Film-Studio",
    },
    {
        name: "Social Card Studio",
        description: "Announcement graphics, design-engineered",
        status: "ALPHA",
    },
    {
        name: "Botbase",
        description: "The AI agent store",
        status: "WIP",
        url: "https://botbase.io",
    },
    {
        name: "AgentFinance",
        description: "Financial rails for AI agents",
        status: "WIP",
        url: "https://agentfinance.app",
    },
    {
        name: "Autónomo Tax OS",
        description: "Filing-ready taxes for Spanish freelancers",
        status: "WIP",
    },
    {
        name: "TaskArena",
        description: "Under wraps",
        status: "STEALTH",
    },
]

const CSS = `
.labs { position: relative; container-type: inline-size; }
.labs a, .labs a:hover { color: inherit; text-decoration: none !important; }
.labs-row {
    position: relative;
    display: grid;
    grid-template-columns: 88px minmax(0, 1fr) minmax(0, 1.6fr);
    gap: 4px 16px;
    align-items: center;
    min-height: 46px;
    padding: 8px 0;
    border-bottom: 1px solid var(--labs-divider);
    transition: opacity 150ms ease;
}
.labs-row:first-child { border-top: 1px solid var(--labs-divider); }
.labs-status {
    justify-self: start;
    display: inline-flex; align-items: center; gap: 6px;
    height: 22px; padding: 0 9px 0 8px;
    border-radius: 999px;
    font-size: 0.75em; letter-spacing: 0.04em; line-height: 1;
    white-space: nowrap;
}
.labs-status[data-chip="Plain"] { padding: 0; color: var(--labs-muted); }
.labs-status[data-chip="Filled"] { background: var(--labs-chip-fill); }
.labs-status[data-chip="Outline"] { box-shadow: inset 0 0 0 1px var(--labs-chip-border); }
.labs-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.labs-title { display: flex; align-items: center; gap: 8px; min-width: 0; }
.labs-name { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.labs-name[href]::after { content: ""; position: absolute; inset: 0; }
.labs-label { overflow: hidden; text-overflow: ellipsis; }
.labs-row:hover .labs-name[href] .labs-label { text-decoration: underline; text-underline-offset: 3px; }
.labs-arrow { color: inherit; }
.labs-icon {
    position: relative; z-index: 1;
    display: inline-flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; flex-shrink: 0;
    border-radius: 6px;
    color: var(--labs-muted);
    transition: color 150ms ease, background-color 150ms ease;
}
.labs-icon:hover { color: inherit; background: var(--labs-divider); }
@media (hover: hover) {
    .labs-arrow, .labs-icon { opacity: 0; transform: translate(-2px, 2px); transition: opacity 150ms ease, transform 200ms cubic-bezier(0.23, 1, 0.32, 1), color 150ms ease, background-color 150ms ease; }
    .labs-row:hover .labs-arrow, .labs-row:hover .labs-icon,
    .labs-row:focus-within .labs-arrow, .labs-row:focus-within .labs-icon { opacity: 1; transform: none; }
}
.labs-desc { color: var(--labs-muted); }
.labs[data-desc-align="Right"] .labs-desc { text-align: right; }
.labs-more { display: inline-block; margin-top: 12px; color: var(--labs-muted); }
.labs-more:hover { text-decoration: underline; text-underline-offset: 3px; }
.labs a:focus-visible { outline: 1px solid currentColor; outline-offset: 2px; border-radius: 4px; }
@container (max-width: 560px) {
    .labs-row { grid-template-columns: 72px minmax(0, 1fr); }
    .labs-desc, .labs[data-desc-align="Right"] .labs-desc { grid-column: 2; text-align: left; }
}
`

const GLYPHS = ".-=*#%/\\+:8sd0"

// Deterministic first pass so server and client render the same string
function scramble(text: string, seed = 0) {
    let out = ""
    for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") {
            out += " "
            continue
        }
        const n = seed ? Math.random() * GLYPHS.length : (text.charCodeAt(i) * 7 + i * 13) % GLYPHS.length
        out += GLYPHS[Math.floor(n)]
    }
    return out
}

function Scramble({ text, active }: { text: string; active: boolean }) {
    const [value, setValue] = React.useState(() => scramble(text))
    React.useEffect(() => {
        if (!active) return
        const id = setInterval(() => setValue(scramble(text, 1)), 70)
        return () => clearInterval(id)
    }, [active, text])
    return <span aria-label="Hidden">{value}</span>
}

const GithubIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
)

const COVER: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
}

function useLoadedImage(src: string) {
    const [img, setImg] = React.useState<HTMLImageElement | null>(null)
    React.useEffect(() => {
        const el = new Image()
        el.onload = () => setImg(el)
        el.src = src
        return () => {
            el.onload = null
        }
    }, [src])
    return img
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight)
    const sw = w / s
    const sh = h / s
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, w, h)
}

const MOSAIC_STEPS = [14, 18, 12, 22]

// Canvas renderer for Glitch, Mosaic and Combo
function CanvasStealth({
    src,
    mosaic,
    glitch,
    still,
}: {
    src: string
    mosaic: boolean
    glitch: boolean
    still: boolean
}) {
    const ref = React.useRef<HTMLCanvasElement>(null)
    const img = useLoadedImage(src)

    React.useEffect(() => {
        const canvas = ref.current
        if (!canvas || !img) return
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const w = Math.round(canvas.clientWidth * dpr)
        const h = Math.round(canvas.clientHeight * dpr)
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")!

        const make = (cw: number, ch: number) => {
            const c = document.createElement("canvas")
            c.width = cw
            c.height = ch
            return [c, c.getContext("2d")!] as const
        }
        const [base, bctx] = make(w, h)
        const [tint, tctx] = make(w, h)
        const [small, sctx] = make(1, 1)

        const renderBase = (block: number) => {
            if (block <= 1) return drawCover(bctx, img, w, h)
            small.width = Math.max(1, Math.round(w / (block * dpr)))
            small.height = Math.max(1, Math.round(h / (block * dpr)))
            drawCover(sctx, img, small.width, small.height)
            bctx.imageSmoothingEnabled = false
            bctx.drawImage(small, 0, 0, w, h)
        }

        // Isolate one colour channel and add it back with an offset
        const channel = (color: string, dx: number) => {
            tctx.globalCompositeOperation = "source-over"
            tctx.drawImage(base, 0, 0)
            tctx.globalCompositeOperation = "multiply"
            tctx.fillStyle = color
            tctx.fillRect(0, 0, w, h)
            ctx.drawImage(tint, dx, 0)
        }

        if (still) {
            renderBase(mosaic ? 16 : 1)
            ctx.drawImage(base, 0, 0)
            return
        }

        let raf = 0
        let last = 0
        let burstUntil = 0
        let nextBurst = performance.now() + 400

        const frame = (t: number) => {
            raf = requestAnimationFrame(frame)
            if (t - last < 50) return // ~20fps, steppy on purpose
            last = t

            if (glitch && t > nextBurst) {
                burstUntil = t + 140 + Math.random() * 120
                nextBurst = t + 1100 + Math.random() * 900
            }
            const bursting = glitch && t < burstUntil

            renderBase(mosaic ? MOSAIC_STEPS[Math.floor(t / 260) % MOSAIC_STEPS.length] : 1)

            ctx.globalCompositeOperation = "source-over"
            if (!bursting) {
                ctx.drawImage(base, 0, 0)
                return
            }

            const off = (4 + Math.random() * 8) * dpr
            ctx.fillStyle = "#000"
            ctx.fillRect(0, 0, w, h)
            ctx.globalCompositeOperation = "lighter"
            channel("#f00", -off)
            channel("#0f0", 0)
            channel("#00f", off)
            ctx.globalCompositeOperation = "source-over"

            const slices = 3 + Math.floor(Math.random() * 4)
            for (let i = 0; i < slices; i++) {
                const y = Math.random() * h
                const sh = (4 + Math.random() * 24) * dpr
                const dx = (Math.random() - 0.5) * 40 * dpr
                ctx.drawImage(canvas, 0, y, w, sh, dx, y, w, sh)
            }
        }
        raf = requestAnimationFrame(frame)
        return () => cancelAnimationFrame(raf)
    }, [img, mosaic, glitch, still])

    return <canvas ref={ref} style={{ ...COVER, display: "block" }} />
}

function WarpStealth({ src, still }: { src: string; still: boolean }) {
    const id = "labs-warp-" + React.useId().replace(/:/g, "")
    const [seed, setSeed] = React.useState(1)
    const [scale, setScale] = React.useState(40)

    React.useEffect(() => {
        if (still) return
        const t = setInterval(() => {
            setSeed((s) => s + 1)
            setScale(Math.random() < 0.15 ? 120 : 40)
        }, 90)
        return () => clearInterval(t)
    }, [still])

    return (
        <>
            <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
                <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.004 0.06" numOctaves={2} seed={seed} />
                    <feDisplacementMap in="SourceGraphic" scale={scale} xChannelSelector="R" yChannelSelector="G" />
                    <feGaussianBlur stdDeviation="3" />
                </filter>
            </svg>
            <img src={src} alt="" style={{ ...COVER, filter: `url(#${id})`, transform: "scale(1.1)" }} />
        </>
    )
}

// Flips a few characters at a time so the label stays readable
function Garble({ text, still }: { text: string; still: boolean }) {
    const [value, setValue] = React.useState(text)
    React.useEffect(() => {
        setValue(text)
        if (still) return
        const t = setInterval(() => {
            setValue(
                text
                    .split("")
                    .map((c) =>
                        c !== " " && Math.random() < 0.15
                            ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
                            : c
                    )
                    .join("")
            )
        }, 80)
        return () => clearInterval(t)
    }, [text, still])
    return <>{value}</>
}

function RedactOverlay({ label, color, still }: { label: string; color: string; still: boolean }) {
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                        "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0 1px, transparent 1px 3px)",
                }}
            />
            {label && (
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 10px",
                        borderRadius: 4,
                        background: "rgba(0,0,0,0.75)",
                        color: "#fff",
                        fontSize: 11,
                        letterSpacing: "0.08em",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                    }}
                >
                    <span style={{ width: 6, height: 6, background: color }} />
                    <Garble text={label} still={still} />
                </div>
            )}
        </>
    )
}

function StealthPreview({
    src,
    effect,
    label,
    color,
    still,
}: {
    src: string
    effect: StealthEffect
    label: string
    color: string
    still: boolean
}) {
    return (
        <div style={{ ...COVER, overflow: "hidden", background: "#000" }}>
            {effect === "Glitch" && <CanvasStealth src={src} mosaic={false} glitch still={still} />}
            {effect === "Mosaic" && <CanvasStealth src={src} mosaic glitch={false} still={still} />}
            {effect === "Combo" && <CanvasStealth src={src} mosaic glitch still={still} />}
            {effect === "Warp" && <WarpStealth src={src} still={still} />}
            {effect === "Redacted" && (
                <img
                    src={src}
                    alt=""
                    style={{
                        ...COVER,
                        filter: "grayscale(1) blur(10px) brightness(0.45)",
                        transform: "scale(1.15)",
                    }}
                />
            )}
            {(effect === "Redacted" || effect === "Combo") && (
                <RedactOverlay label={label} color={color} still={still} />
            )}
        </div>
    )
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function LabsList(props: Props) {
    const {
        items = [],
        limit,
        moreLabel,
        moreLink,
        showSite,
        showGithub,
        titleCaps,
        descCaps,
        scrambleStealth,
        font,
        textColor,
        mutedColor,
        dividerColor,
        previewWidth,
        previewRadius,
        chipStyle = "Filled",
        chipFill,
        chipBorder,
        statusColors,
        stealthEffect = "Combo",
        stealthLabel,
        descAlign = "Right",
        previewMode = "Pinned",
        pinnedX = 50,
    } = props

    const shown = limit > 0 ? items.slice(0, limit) : items
    const hasMore = limit > 0 && items.length > limit && !!moreLink
    const previewHeight = (previewWidth * 10) / 16

    const ref = React.useRef<HTMLDivElement>(null)
    const [active, setActive] = React.useState<number | null>(null)
    const [canHover, setCanHover] = React.useState(false)
    const reduceMotion = useReducedMotion()

    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const spring = { stiffness: 500, damping: 40, mass: 0.4 }
    const sx = useSpring(x, spring)
    const sy = useSpring(y, spring)

    React.useEffect(() => {
        setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches)
    }, [])

    // Pinned locks x to a column; Follow flips left of the cursor near the right edge
    const position = (e: React.MouseEvent) => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return null
        const cx = e.clientX - r.left
        const cy = e.clientY - r.top
        if (previewMode === "Pinned") {
            return {
                x: (r.width * pinnedX) / 100 - previewWidth / 2,
                y: cy - previewHeight / 2,
            }
        }
        const flip = cx + 24 + previewWidth > r.width
        return {
            x: flip ? cx - 24 - previewWidth : cx + 24,
            y: cy - previewHeight / 2,
        }
    }

    const onEnter = (e: React.MouseEvent) => {
        const p = position(e)
        if (!p) return
        x.jump(p.x)
        y.jump(p.y)
        sx.jump(p.x)
        sy.jump(p.y)
    }

    const onMove = (e: React.MouseEvent) => {
        const p = position(e)
        if (!p) return
        x.set(p.x)
        y.set(p.y)
    }

    const activeItem = active === null ? null : shown[active]
    const showPreview = canHover && !!(activeItem?.image?.src || activeItem?.video)

    return (
        <div
            ref={ref}
            className="labs"
            data-desc-align={descAlign}
            onMouseEnter={onEnter}
            onMouseMove={onMove}
            onMouseLeave={() => setActive(null)}
            style={
                {
                    ...font,
                    color: textColor,
                    "--labs-muted": mutedColor,
                    "--labs-divider": dividerColor,
                    "--labs-chip-fill": chipFill,
                    "--labs-chip-border": chipBorder,
                } as React.CSSProperties
            }
        >
            <style>{CSS}</style>

            <div>
                {shown.map((item, i) => {
                    const stealth = item.status === "STEALTH"
                    const site = showSite && !stealth ? item.url : undefined
                    const github = showGithub && !stealth ? item.github : undefined
                    const href = site || github
                    return (
                        <div
                            key={item.name + i}
                            className="labs-row"
                            onMouseEnter={() => canHover && setActive(i)}
                            style={{ opacity: active === null || active === i ? 1 : 0.35 }}
                        >
                            <span className="labs-status" data-chip={chipStyle}>
                                <span
                                    className="labs-dot"
                                    style={{
                                        background:
                                            statusColors?.[item.status] ?? STATUS_COLOR[item.status],
                                    }}
                                />
                                {item.status}
                            </span>
                            <span className="labs-title">
                                <a
                                    className="labs-name"
                                    href={href}
                                    target={href ? "_blank" : undefined}
                                    rel={href ? "noopener noreferrer" : undefined}
                                    style={{ textTransform: titleCaps ? "uppercase" : "none" }}
                                >
                                    <span className="labs-label">{item.name}</span>
                                    {site && <span className="labs-arrow">↗</span>}
                                </a>
                                {github && (
                                    <a
                                        className="labs-icon"
                                        href={github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`${item.name} on GitHub`}
                                        title="GitHub"
                                    >
                                        <GithubIcon />
                                    </a>
                                )}
                            </span>
                            <span
                                className="labs-desc"
                                style={{ textTransform: descCaps ? "uppercase" : "none" }}
                            >
                                {stealth && scrambleStealth ? (
                                    <Scramble text={item.description} active={active === i} />
                                ) : (
                                    item.description
                                )}
                            </span>
                        </div>
                    )
                })}
            </div>

            {hasMore && (
                <a className="labs-more" href={moreLink}>
                    {moreLabel} →
                </a>
            )}

            {canHover && (
                <motion.div
                    aria-hidden
                    initial={false}
                    animate={{
                        opacity: showPreview ? 1 : 0,
                        scale: showPreview || reduceMotion ? 1 : 0.96,
                    }}
                    transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        x: reduceMotion ? x : sx,
                        y: reduceMotion ? y : sy,
                        width: previewWidth,
                        height: previewHeight,
                        borderRadius: previewRadius,
                        overflow: "hidden",
                        pointerEvents: "none",
                        zIndex: 10,
                        background: dividerColor,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.16)",
                    }}
                >
                    {/* All images mount up front so swaps are instant */}
                    {shown.map((item, i) => {
                        const stealth = item.status === "STEALTH"
                        if (stealth && stealthEffect !== "Blur" && item.image?.src) {
                            return active === i ? (
                                <StealthPreview
                                    key={item.name + i}
                                    src={item.image.src}
                                    effect={stealthEffect}
                                    label={stealthLabel}
                                    color={statusColors?.STEALTH ?? STATUS_COLOR.STEALTH}
                                    still={!!reduceMotion}
                                />
                            ) : (
                                <link
                                    key={item.name + i}
                                    rel="preload"
                                    as="image"
                                    href={item.image.src}
                                />
                            )
                        }
                        const media: React.CSSProperties = {
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            opacity: active === i ? 1 : 0,
                            transition: "opacity 120ms ease",
                            filter: stealth ? "blur(14px)" : undefined,
                            transform: stealth ? "scale(1.15)" : undefined,
                        }
                        if (item.video && active === i) {
                            return (
                                <video
                                    key={item.name + i}
                                    src={item.video}
                                    poster={item.image?.src}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    style={media}
                                />
                            )
                        }
                        return item.image?.src ? (
                            <img
                                key={item.name + i}
                                src={item.image.src}
                                srcSet={item.image.srcSet}
                                alt=""
                                style={media}
                            />
                        ) : null
                    })}
                </motion.div>
            )}
        </div>
    )
}

LabsList.displayName = "Labs List"

addPropertyControls(LabsList, {
    items: {
        type: ControlType.Array,
        title: "Projects",
        control: {
            type: ControlType.Object,
            controls: {
                name: { type: ControlType.String, title: "Name" },
                description: { type: ControlType.String, title: "One-liner" },
                status: {
                    type: ControlType.Enum,
                    title: "Status",
                    options: STATUSES,
                    defaultValue: "WIP",
                },
                url: { type: ControlType.Link, title: "Site" },
                github: { type: ControlType.Link, title: "GitHub" },
                image: { type: ControlType.ResponsiveImage, title: "Preview" },
                video: {
                    type: ControlType.File,
                    title: "Video",
                    allowedFileTypes: ["mp4", "webm", "mov"],
                },
            },
        },
        defaultValue: DEFAULT_ITEMS,
    },
    limit: {
        type: ControlType.Number,
        title: "Limit",
        description: "0 shows all",
        defaultValue: 0,
        min: 0,
        step: 1,
        displayStepper: true,
    },
    moreLabel: {
        type: ControlType.String,
        title: "More Label",
        defaultValue: "All side projects",
        hidden: (p) => !p.limit,
    },
    moreLink: {
        type: ControlType.Link,
        title: "More Link",
        hidden: (p) => !p.limit,
    },
    showSite: { type: ControlType.Boolean, title: "Site Links", defaultValue: true },
    showGithub: { type: ControlType.Boolean, title: "GitHub Icons", defaultValue: true },
    titleCaps: { type: ControlType.Boolean, title: "Title Caps", defaultValue: true },
    descCaps: { type: ControlType.Boolean, title: "Desc Caps", defaultValue: false },
    scrambleStealth: {
        type: ControlType.Boolean,
        title: "Scramble Stealth",
        description: "Glitches STEALTH one-liners, animates on hover",
        defaultValue: true,
    },
    descAlign: {
        type: ControlType.Enum,
        title: "Desc Align",
        options: ["Left", "Right"],
        defaultValue: "Right",
        displaySegmentedControl: true,
    },
    previewMode: {
        type: ControlType.Enum,
        title: "Preview",
        options: ["Pinned", "Follow"],
        defaultValue: "Pinned",
        displaySegmentedControl: true,
    },
    pinnedX: {
        type: ControlType.Number,
        title: "Pinned X",
        description: "Card centre, % of width",
        defaultValue: 50,
        min: 0,
        max: 100,
        unit: "%",
        hidden: (p) => p.previewMode !== "Pinned",
    },
    stealthEffect: {
        type: ControlType.Enum,
        title: "Stealth FX",
        options: ["Combo", "Glitch", "Warp", "Mosaic", "Redacted", "Blur"],
        defaultValue: "Combo",
    },
    stealthLabel: {
        type: ControlType.String,
        title: "Stealth Label",
        defaultValue: "Access restricted",
        hidden: (p) => p.stealthEffect !== "Redacted" && p.stealthEffect !== "Combo",
    },
    font: {
        type: ControlType.Font,
        controls: "extended",
        defaultFontType: "monospace",
        defaultValue: { fontSize: 14, lineHeight: "1.4em" },
    },
    textColor: { type: ControlType.Color, title: "Text", defaultValue: "#111111" },
    mutedColor: { type: ControlType.Color, title: "Muted", defaultValue: "#8A8A8A" },
    dividerColor: { type: ControlType.Color, title: "Divider", defaultValue: "#E8E8E8" },
    chipStyle: {
        type: ControlType.Enum,
        title: "Chip",
        options: ["Filled", "Outline", "Plain"],
        defaultValue: "Filled",
        displaySegmentedControl: true,
    },
    chipFill: {
        type: ControlType.Color,
        title: "Chip Fill",
        defaultValue: "#161616",
        hidden: (p) => p.chipStyle !== "Filled",
    },
    chipBorder: {
        type: ControlType.Color,
        title: "Chip Border",
        defaultValue: "#2A2A2A",
        hidden: (p) => p.chipStyle !== "Outline",
    },
    statusColors: {
        type: ControlType.Object,
        title: "Status Colors",
        controls: Object.fromEntries(
            STATUSES.map((s) => [
                s,
                { type: ControlType.Color, title: s, defaultValue: STATUS_COLOR[s] },
            ])
        ),
    },
    previewWidth: {
        type: ControlType.Number,
        title: "Preview W",
        defaultValue: 280,
        min: 160,
        max: 480,
        step: 8,
    },
    previewRadius: {
        type: ControlType.Number,
        title: "Preview R",
        defaultValue: 10,
        min: 0,
        max: 32,
    },
})

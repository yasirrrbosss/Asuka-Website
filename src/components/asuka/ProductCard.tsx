"use client";
import { useState, useEffect, useRef } from "react";
import { rp } from "@/lib/format";
import { isInStock, type Product } from "@/lib/types";
import { ProdImg } from "./shared";

/**
 * Editorial product card. The photo sits in a square tile (square so packaging
 * artwork with baked-in typography is never cropped mid-letter), and the copy
 * lives BELOW the image on the page surface — overlaying text on packaging
 * shots collided with the artwork's own type. Hover: photo zoom + card lift +
 * arrow slide.
 */
export function ProductCard({ product, addToCart, delay }: { product: Product; addToCart: (p: Product, q: number) => void; delay: number }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const soldOut = !isInStock(product);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => setVisible(true), delay);
        obs.disconnect();
      }
    }, { threshold: 0.05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);

  const handleAdd = () => {
    if (soldOut) return;
    addToCart(product, 1);
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={soldOut ? -1 : 0}
      aria-label={soldOut ? `${product.name} — sold out` : `Add ${product.name} to cart — ${rp(product.price)}`}
      aria-disabled={soldOut}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleAdd}
      onKeyDown={(e) => {
        if (soldOut) return;
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleAdd(); }
      }}
      style={{
        cursor: soldOut ? "not-allowed" : "pointer",
        opacity: visible ? (soldOut ? 0.55 : 1) : 0,
        transform: visible ? (hovered && !soldOut ? "translateY(-6px)" : "translateY(0)") : "translateY(28px)",
        transition: "opacity 0.7s var(--ease-out-soft), transform 0.4s var(--ease-out-soft)",
        position: "relative",
      }}
    >
      {/* Image tile */}
      <div style={{
        aspectRatio: "1/1",
        background: "#3a2818",
        overflow: "hidden",
        position: "relative",
      }}>
        <div style={{
          width: "100%", height: "100%",
          transform: hovered && !soldOut ? "scale(1.06)" : "scale(1)",
          filter: soldOut ? "grayscale(0.4)" : (hovered ? "saturate(1.1)" : "saturate(0.95)"),
          transition: "transform 0.7s var(--ease-out-soft), filter 0.4s",
        }}>
          <ProdImg src={product.img} cat={product.cat} style={{ aspectRatio: "1/1", height: "100%" }} />
        </div>

        {soldOut && (
          <div style={{
            position: "absolute", top: 18, left: 18, zIndex: 2,
            background: "var(--terracotta)", color: "#fff",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.22em",
            textTransform: "uppercase", padding: "5px 12px",
          }}>Sold Out</div>
        )}

        {/* Pack size — variants with identical artwork (e.g. 200gr vs 1 KG)
            stay distinguishable without opening the cart */}
        {product.weight && (
          <div style={{
            position: "absolute", top: 18, right: 18, zIndex: 2,
            background: "rgba(240,235,224,0.92)", color: "var(--ink)",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", padding: "5px 12px",
          }}>{product.weight}</div>
        )}
      </div>

      {/* Copy — on the page surface, clear of the artwork */}
      <div style={{ paddingTop: 20 }}>
        <div style={{
          fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
          color: "var(--copper)", fontWeight: 700, marginBottom: 8,
        }}>{product.cat} · {product.origin}</div>
        <h3 style={{
          fontFamily: "var(--font-fraunces), serif",
          fontVariationSettings: '"SOFT" 30, "WONK" 0',
          fontSize: "clamp(22px, 4.5vw, 28px)", fontWeight: 450, letterSpacing: "-0.012em",
          color: "var(--ink)", marginBottom: 6, lineHeight: 1.12,
        }}>{product.name}</h3>
        <p style={{
          fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic", marginBottom: 16,
          lineHeight: 1.5,
        }}>
          {product.notes}
        </p>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          paddingTop: 14, borderTop: "1px solid var(--paper-edge)",
        }}>
          <span style={{
            fontFamily: "var(--font-fraunces), serif",
            fontVariationSettings: '"SOFT" 30',
            fontSize: "clamp(18px, 3.5vw, 21px)", color: "var(--copper)", fontWeight: 500,
          }}>{rp(product.price)}</span>
          <span style={{
            fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase",
            color: "var(--ink)", fontWeight: 600,
            display: "inline-flex", alignItems: "center", gap: hovered && !soldOut ? 14 : 6,
            transition: "gap 0.3s",
          }}>{soldOut ? "Sold out" : "Add →"}</span>
        </div>
      </div>
    </div>
  );
}

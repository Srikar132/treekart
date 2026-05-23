"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { DeliveryAddress } from "@/types/database.types";
import settings from "@/constants/settings";

type PrintStickerProps =
    | {
          type: "order";
          referenceId: string;
          date: string;
          deliveryAddress: DeliveryAddress;
          items: { name: string; qty: number }[];
          totalAmount: number;
          trackingId?: string | null;
      }
    | {
          type: "rental";
          referenceId: string;
          date: string;
          deliveryAddress: DeliveryAddress;
          treeVariety: string;
          season: string;
          amountPaid: number;
      };

export function buildStickerHTML(props: PrintStickerProps): string {
    const { deliveryAddress: a, referenceId, date } = props;

    const formattedDate = date
        ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "—";

    const shortRef = referenceId.slice(0, 8).toUpperCase();

    const addressLines = [
        a.line1,
        [a.locality, a.city].filter(Boolean).join(", "),
        [a.district, a.state].filter(Boolean).join(", "),
    ].filter(Boolean);

    const contentsHTML =
        props.type === "order"
            ? (() => {
                  const visible = props.items.slice(0, 3);
                  const extra = props.items.length - visible.length;
                  return (
                      visible.map((i) => `<div class="item-line">${i.name} &times; ${i.qty}</div>`).join("") +
                      (extra > 0 ? `<div class="item-line">+${extra} more item${extra > 1 ? "s" : ""}</div>` : "")
                  );
              })()
            : `<div class="item-line">Tree Variety: ${props.treeVariety}</div>
               <div class="item-line">Season: ${props.season}</div>`;

    const refRows =
        props.type === "order"
            ? `
        <div class="ref-key">REF</div><div class="ref-val">#${shortRef}</div>
        <div class="ref-key">DATE</div><div class="ref-val">${formattedDate}</div>
        <div class="ref-key">AMT</div><div class="ref-val">&#8377;${props.totalAmount.toLocaleString("en-IN")}</div>
        ${props.trackingId ? `<div class="ref-key">TRK</div><div class="ref-val">${props.trackingId}</div>` : ""}
    `
            : `
        <div class="ref-key">REF</div><div class="ref-val">#${shortRef}</div>
        <div class="ref-key">DATE</div><div class="ref-val">${formattedDate}</div>
        <div class="ref-key">AMT</div><div class="ref-val">&#8377;${props.amountPaid.toLocaleString("en-IN")}</div>
        <div class="ref-key">SEASON</div><div class="ref-val">${props.season}</div>
    `;

    const typeLabel = props.type === "order" ? "ORDER LABEL" : "RENTAL LABEL";

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Delivery Sticker — ${shortRef}</title>
<style>
  @page { size: 100mm 150mm; margin: 0; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    background: #fff;
    color: #000;
    width: 100mm;
    height: 150mm;
    overflow: hidden;
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
  .sticker {
    width: 100mm;
    height: 150mm;
    border: 2px dashed #444;
    display: grid;
    grid-template-rows: 14mm 1fr 20mm 22mm 18mm 14mm;
  }

  /* ── Brand Bar ── */
  .brand-bar {
    background: #000;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4mm;
    border-bottom: 2px solid #000;
  }
  .brand-name {
    font-size: 13pt;
    font-weight: 900;
    letter-spacing: 3px;
    text-transform: uppercase;
  }
  .type-badge {
    font-size: 7pt;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    border: 1px solid #fff;
    padding: 2px 6px;
  }

  /* ── SHIP TO ── */
  .ship-to {
    padding: 3mm 4mm 2mm;
    border-bottom: 1.5px solid #000;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .section-label {
    font-size: 7pt;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #555;
    margin-bottom: 2mm;
  }
  .recipient-name {
    font-size: 15pt;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    line-height: 1.1;
    margin-bottom: 1.5mm;
  }
  .recipient-phone {
    font-size: 10pt;
    font-family: 'Courier New', monospace;
    letter-spacing: 1px;
    margin-bottom: 1.5mm;
  }
  .address-line {
    font-size: 8.5pt;
    line-height: 1.5;
    text-transform: uppercase;
  }
  .pincode-line {
    font-size: 9pt;
    font-weight: 700;
    margin-top: 1mm;
    letter-spacing: 1px;
  }

  /* ── FROM ── */
  .from-section {
    padding: 2mm 4mm;
    border-bottom: 1px solid #ccc;
  }
  .from-brand {
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .from-detail {
    font-size: 7.5pt;
    color: #444;
    line-height: 1.5;
  }

  /* ── Reference ── */
  .reference-box {
    margin: 2mm 4mm;
    border: 1px solid #000;
    padding: 2mm 3mm;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5mm 3mm;
    font-size: 7.5pt;
    align-content: center;
  }
  .ref-key {
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    white-space: nowrap;
  }
  .ref-val {
    font-family: 'Courier New', monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Contents ── */
  .items-section {
    padding: 1.5mm 4mm;
    border-bottom: 1px solid #eee;
  }
  .item-line {
    font-size: 8pt;
    line-height: 1.7;
    text-transform: uppercase;
  }
  .item-line::before { content: "• "; }

  /* ── Barcode Strip ── */
  .barcode-strip {
    border-top: 1px solid #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1mm 4mm;
    gap: 0.5mm;
  }
  .barcode-text {
    font-family: 'Courier New', monospace;
    font-size: 20pt;
    font-weight: 900;
    letter-spacing: 4px;
    line-height: 1;
    color: #000;
  }
  .barcode-human {
    font-size: 6pt;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #555;
  }
</style>
</head>
<body>
<div class="sticker">

  <div class="brand-bar">
    <span class="brand-name">TreeKart</span>
    <span class="type-badge">${typeLabel}</span>
  </div>

  <div class="ship-to">
    <div class="section-label">Ship To</div>
    <div class="recipient-name">${a.name}</div>
    <div class="recipient-phone">${a.phone}</div>
    ${addressLines.map((l) => `<div class="address-line">${l}</div>`).join("")}
    <div class="pincode-line">${a.pincode} &bull; ${a.country ?? "India"}</div>
  </div>

  <div class="from-section">
    <div class="section-label">From</div>
    <div class="from-brand">TreeKart</div>
    <div class="from-detail">${settings.ADDRESS}</div>
    <div class="from-detail">${settings.PHONE} &nbsp;|&nbsp; ${settings.WEB}</div>
  </div>

  <div class="reference-box">
    ${refRows}
  </div>

  <div class="items-section">
    <div class="section-label">Contents</div>
    ${contentsHTML}
  </div>

  <div class="barcode-strip">
    <div class="barcode-text">${shortRef}</div>
    <div class="barcode-human">Ref: ${referenceId}</div>
  </div>

</div>
</body>
</html>`;
}

export function PrintSticker(props: PrintStickerProps) {
    function handlePrint() {
        const html = buildStickerHTML(props);
        const win = window.open("", "_blank", "width=420,height=630");
        if (!win) {
            alert("Allow popups for this site to print stickers.");
            return;
        }
        win.document.write(html);
        win.document.close();
        win.onafterprint = () => win.close();
        if (win.document.readyState === "complete") {
            win.focus();
            win.print();
        } else {
            win.onload = () => {
                win.focus();
                win.print();
            };
        }
    }

    return (
        <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="gap-2 rounded-none border-border uppercase tracking-widest text-[10px] font-black"
        >
            <Printer size={14} />
            Print Sticker
        </Button>
    );
}
